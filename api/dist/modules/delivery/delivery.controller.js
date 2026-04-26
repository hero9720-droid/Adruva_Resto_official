"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestExternalOrder = ingestExternalOrder;
exports.getChannelAnalytics = getChannelAnalytics;
exports.listPlatforms = listPlatforms;
const db_1 = require("../../lib/db");
const counters_1 = require("../../lib/counters");
async function ingestExternalOrder(req, res) {
    // Simulated Webhook from Zomato/Swiggy
    const { outlet_id, platform_name, external_order_id, items, total_paise } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // 1. Find platform config
        const platRes = await client.query('SELECT * FROM delivery_platforms WHERE name = $1', [platform_name]);
        const platform = platRes.rows[0];
        const commission_paise = platform ? Math.round((total_paise * platform.commission_percent) / 100) : 0;
        const orderNumber = await (0, counters_1.getNextOrderNumber)(client, outlet_id);
        // 2. Create Order
        const orderRes = await client.query(`INSERT INTO orders (
        outlet_id, order_number, status, source, delivery_platform_id, 
        external_order_id, platform_commission_paise, total_paise
      ) VALUES ($1, $2, 'confirmed', 'delivery', $3, $4, $5, $6) RETURNING *`, [outlet_id, orderNumber, platform?.id || null, external_order_id, commission_paise, total_paise]);
        const order = orderRes.rows[0];
        // 3. Create Items
        for (const item of items) {
            await client.query(`INSERT INTO order_items (order_id, outlet_id, menu_item_id, name, quantity, price_paise, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'preparing')`, [order.id, outlet_id, item.menu_item_id, item.name, item.quantity, item.price_paise]);
        }
        return order;
    });
    res.status(201).json({ success: true, data: result });
}
async function getChannelAnalytics(req, res) {
    const chain_id = req.user.chain_id;
    const result = await db_1.db.query(`SELECT 
       source,
       dp.name as platform_name,
       COUNT(o.id) as total_orders,
       SUM(o.total_paise) as gross_revenue,
       SUM(o.platform_commission_paise) as total_commission,
       SUM(o.total_paise - o.platform_commission_paise) as net_revenue
     FROM orders o
     LEFT JOIN delivery_platforms dp ON dp.id = o.delivery_platform_id
     WHERE o.outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)
     GROUP BY source, dp.name
     ORDER BY net_revenue DESC`, [chain_id]);
    res.json({ success: true, data: result.rows });
}
async function listPlatforms(req, res) {
    const chain_id = req.user.chain_id;
    const result = await db_1.db.query('SELECT * FROM delivery_platforms WHERE chain_id = $1', [chain_id]);
    res.json({ success: true, data: result.rows });
}
