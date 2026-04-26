"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.createPublicOrder = createPublicOrder;
exports.getOrders = getOrders;
exports.updateOrderStatus = updateOrderStatus;
exports.updateItemStatus = updateItemStatus;
exports.getPublicOrder = getPublicOrder;
const db_1 = require("../../lib/db");
const counters_1 = require("../../lib/counters");
const inventory_1 = require("../../lib/inventory");
const websocket_1 = require("../../websocket");
const errors_1 = require("../../lib/errors");
const planLimits_1 = require("../../lib/planLimits");
async function createOrder(req, res) {
    const outlet_id = req.user.outlet_id;
    const staff_id = req.user.staff_id;
    const { order_type, session_id, table_id, room_id, customer_id, waiter_id, notes, items } = req.body;
    // Enforce SaaS plan limits
    await (0, planLimits_1.checkPlanLimit)(outlet_id, 'max_orders_per_month');
    const result = await processOrderCreation(outlet_id, {
        order_type, session_id, table_id, room_id,
        customer_id, waiter_id: waiter_id || staff_id, notes, items,
        created_by: staff_id
    });
    (0, websocket_1.emitToOutlet)(outlet_id, 'order:new', result);
    res.status(201).json({ success: true, data: result });
}
async function createPublicOrder(req, res) {
    const { outlet_id, table_id, items, notes } = req.body;
    if (!outlet_id)
        throw new errors_1.AppError(400, 'Outlet ID is required', 'BAD_REQUEST');
    // Enforce SaaS plan limits
    await (0, planLimits_1.checkPlanLimit)(outlet_id, 'max_orders_per_month');
    const result = await processOrderCreation(outlet_id, {
        order_type: 'qr',
        source: 'qr',
        table_id,
        notes,
        items,
        created_by: 'system_guest'
    });
    (0, websocket_1.emitToOutlet)(outlet_id, 'order:new', result);
    res.status(201).json({ success: true, data: result });
}
async function processOrderCreation(outlet_id, data) {
    return await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // 1. Get next order number atomically
        const order_number = await (0, counters_1.getNextOrderNumber)(client, outlet_id);
        // 2. Create parent order
        const orderRes = await client.query(`INSERT INTO orders (
        outlet_id, order_number, order_type, session_id, table_id, 
        room_id, customer_id, waiter_id, notes, status, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'confirmed', $10) RETURNING *`, [
            outlet_id, order_number, data.order_type, data.session_id, data.table_id,
            data.room_id, data.customer_id, data.waiter_id, data.notes, data.source || 'pos'
        ]);
        const order = orderRes.rows[0];
        // 3. Create order items and handle inventory
        const createdItems = [];
        for (const item of data.items) {
            // Get menu item price if not provided (safety)
            let price = item.unit_price_paise;
            if (!price) {
                const miRes = await client.query("SELECT base_price_paise FROM menu_items WHERE id = $1", [item.menu_item_id]);
                price = miRes.rows[0]?.base_price_paise || 0;
            }
            const itemTotal = price * item.quantity;
            const itemRes = await client.query(`INSERT INTO order_items (
          outlet_id, order_id, menu_item_id, variant_id, 
          quantity, unit_price_paise, total_paise, modifiers_json, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [
                outlet_id, order.id, item.menu_item_id, item.variant_id,
                item.quantity, price, itemTotal,
                JSON.stringify(item.modifiers_json || {}), item.notes
            ]);
            // Add menu item name and station for the WebSocket payload
            const miInfoRes = await client.query("SELECT name, station FROM menu_items WHERE id = $1", [item.menu_item_id]);
            createdItems.push({
                ...itemRes.rows[0],
                menu_item_name: miInfoRes.rows[0]?.name,
                station: miInfoRes.rows[0]?.station || 'kitchen'
            });
            // Deduct inventory
            await (0, inventory_1.deductInventory)(client, outlet_id, item.menu_item_id, item.quantity, data.created_by);
        }
        // 4. Update table status if dine-in
        if (data.table_id) {
            await client.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [data.table_id]);
        }
        return { ...order, items: createdItems };
    });
}
async function getOrders(req, res) {
    const outlet_id = req.user.outlet_id;
    const { status, order_type, source } = req.query;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        let query = `
      SELECT o.*, t.name as table_name,
        (SELECT json_agg(json_build_object(
          'id', oi.id,
          'menu_item_id', oi.menu_item_id,
          'menu_item_name', mi.name,
          'category_name', c.name,
          'quantity', oi.quantity,
          'status', oi.status,
          'notes', oi.notes,
          'unit_price_paise', oi.unit_price_paise,
          'total_paise', oi.total_paise,
          'station', mi.station
        )) FROM order_items oi 
         JOIN menu_items mi ON mi.id = oi.menu_item_id
         LEFT JOIN menu_categories c ON c.id = mi.category_id
         WHERE oi.order_id = o.id) as items
      FROM orders o 
      LEFT JOIN tables t ON t.id = o.table_id
      WHERE 1=1
    `;
        const params = [];
        if (status) {
            params.push(status);
            query += ` AND o.status = $${params.length}`;
        }
        if (order_type) {
            params.push(order_type);
            query += ` AND o.order_type = $${params.length}`;
        }
        if (req.query.table_id) {
            params.push(req.query.table_id);
            query += ` AND o.table_id = $${params.length}`;
        }
        if (source) {
            params.push(source);
            query += ` AND o.source = $${params.length}`;
        }
        query += ' ORDER BY o.created_at DESC LIMIT 50';
        const res = await client.query(query, params);
        return res.rows;
    });
    res.json({ success: true, data: result });
}
async function updateOrderStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const res = await client.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, id]);
        if (res.rowCount === 0)
            throw new errors_1.AppError(404, 'Order not found', 'NOT_FOUND');
        return res.rows[0];
    });
    (0, websocket_1.emitToBilling)(outlet_id, 'order:status_change', result);
    res.json({ success: true, data: result });
}
async function updateItemStatus(req, res) {
    const { itemId } = req.params;
    const { status } = req.body;
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const res = await client.query('UPDATE order_items SET status = $1 WHERE id = $2 RETURNING *', [status, itemId]);
        if (res.rowCount === 0)
            throw new errors_1.AppError(404, 'Order item not found', 'NOT_FOUND');
        return res.rows[0];
    });
    // Notify all outlet screens (KDS, POS) about the item status change
    (0, websocket_1.emitToOutlet)(outlet_id, 'order:item_update', {
        order_id: result.order_id,
        item_id: result.id,
        status: result.status
    });
    // If item is ready, notify cashier specifically
    if (status === 'ready') {
        (0, websocket_1.emitToBilling)(outlet_id, 'item:ready', result);
    }
    res.json({ success: true, data: result });
}
async function getPublicOrder(req, res) {
    const { id } = req.params;
    const { outlet_id } = req.query;
    if (!outlet_id)
        throw new errors_1.AppError(400, 'Outlet ID is required', 'BAD_REQUEST');
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const res = await client.query(`SELECT o.*, 
        (SELECT json_agg(json_build_object(
          'id', oi.id,
          'menu_item_name', mi.name,
          'quantity', oi.quantity,
          'status', oi.status,
          'total_paise', oi.total_paise
        )) FROM order_items oi 
         JOIN menu_items mi ON mi.id = oi.menu_item_id
         WHERE oi.order_id = o.id) as items
      FROM orders o 
      WHERE o.id = $1 AND o.outlet_id = $2`, [id, outlet_id]);
        if (res.rowCount === 0)
            throw new errors_1.AppError(404, 'Order not found', 'NOT_FOUND');
        return res.rows[0];
    });
    res.json({ success: true, data: result });
}
