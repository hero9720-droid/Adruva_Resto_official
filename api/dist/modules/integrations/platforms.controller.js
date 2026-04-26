"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformStatus = getPlatformStatus;
exports.togglePlatform = togglePlatform;
exports.syncMenuItemStatus = syncMenuItemStatus;
exports.getAggregatedOrders = getAggregatedOrders;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
async function getPlatformStatus(req, res) {
    const { outlet_id } = req.params;
    const result = await db_1.db.query('SELECT * FROM external_platforms WHERE outlet_id = $1', [outlet_id]);
    res.json({ success: true, data: result.rows });
}
async function togglePlatform(req, res) {
    const { outlet_id, platform_name } = req.params;
    const { is_active } = req.body;
    const result = await db_1.db.query(`UPDATE external_platforms 
     SET is_active = $1 
     WHERE outlet_id = $2 AND platform_name = $3 
     RETURNING *`, [is_active, outlet_id, platform_name]);
    // In real implementation, this would call Zomato/Swiggy API
    console.log(`[EXTERNAL_SYNC] ${platform_name.toUpperCase()} for outlet ${outlet_id} set to ${is_active ? 'ONLINE' : 'OFFLINE'}`);
    res.json({ success: true, data: result.rows[0] });
}
async function syncMenuItemStatus(req, res) {
    const { item_id } = req.params;
    const { platform_name, is_available } = req.body;
    const item = await db_1.db.query('SELECT external_sync_status FROM menu_items WHERE id = $1', [item_id]);
    if (item.rowCount === 0)
        throw new errors_1.AppError(404, 'Item not found', 'NOT_FOUND');
    const newStatus = { ...item.rows[0].external_sync_status, [platform_name]: is_available };
    await db_1.db.query('UPDATE menu_items SET external_sync_status = $1 WHERE id = $2', [JSON.stringify(newStatus), item_id]);
    console.log(`[ITEM_SYNC] ${item_id} set to ${is_available ? 'AVAILABLE' : 'OUT_OF_STOCK'} on ${platform_name.toUpperCase()}`);
    res.json({ success: true, status: newStatus });
}
async function getAggregatedOrders(req, res) {
    const { outlet_id } = req.params;
    const result = await db_1.db.query(`SELECT * FROM orders 
     WHERE outlet_id = $1 AND external_platform IS NOT NULL 
     ORDER BY created_at DESC LIMIT 50`, [outlet_id]);
    res.json({ success: true, data: result.rows });
}
