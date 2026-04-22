"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChainMetrics = getChainMetrics;
exports.listOutlets = listOutlets;
exports.createOutlet = createOutlet;
exports.syncMasterMenu = syncMasterMenu;
const db_1 = require("../../../lib/db");
const errors_1 = require("../../../lib/errors");
async function getChainMetrics(req, res) {
    const chain_id = req.user.chain_id;
    const result = await db_1.db.query(`
    SELECT 
      COUNT(id)::int AS total_outlets,
      (SELECT COALESCE(SUM(total_paise), 0) FROM bills 
        WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1) AND status = 'paid') AS total_revenue,
      (SELECT COUNT(id)::int FROM orders 
        WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)) AS total_orders
    FROM outlets 
    WHERE chain_id = $1
  `, [chain_id]);
    const outletSales = await db_1.db.query(`
    SELECT 
      o.name, 
      o.id,
      o.is_active as status,
      COALESCE(SUM(b.total_paise), 0)::int AS revenue
    FROM outlets o
    LEFT JOIN bills b ON b.outlet_id = o.id AND b.status = 'paid'
    WHERE o.chain_id = $1
    GROUP BY o.id, o.name, o.is_active
    ORDER BY revenue DESC
  `, [chain_id]);
    res.json({
        success: true,
        data: {
            metrics: result.rows[0],
            outletSales: outletSales.rows
        }
    });
}
async function listOutlets(req, res) {
    const chain_id = req.user.chain_id;
    const result = await db_1.db.query(`SELECT o.*, 
       (SELECT COUNT(*)::int FROM orders WHERE outlet_id = o.id) AS order_count
     FROM outlets o
     WHERE o.chain_id = $1
     ORDER BY o.created_at DESC`, [chain_id]);
    res.json({ success: true, data: result.rows });
}
async function createOutlet(req, res) {
    const chain_id = req.user.chain_id;
    const { name, address, phone } = req.body;
    if (!name)
        throw new errors_1.AppError(400, 'Name is required', 'VALIDATION_ERROR');
    const result = await db_1.db.query(`INSERT INTO outlets (chain_id, name, address, phone) VALUES ($1, $2, $3, $4) RETURNING *`, [chain_id, name, address, phone]);
    res.status(201).json({ success: true, data: result.rows[0] });
}
async function syncMasterMenu(req, res) {
    const chain_id = req.user.chain_id;
    const { target_outlet_ids } = req.body;
    if (!Array.isArray(target_outlet_ids) || target_outlet_ids.length === 0) {
        throw new errors_1.AppError(400, 'target_outlet_ids must be a non-empty array', 'VALIDATION_ERROR');
    }
    // Fetch chain-level (master) menu items — outlet_id IS NULL for master items
    const masterItems = await db_1.db.query('SELECT * FROM menu_items WHERE outlet_id IS NULL AND chain_id = $1', [chain_id]);
    const client = await db_1.db.connect();
    try {
        await client.query('BEGIN');
        for (const outletId of target_outlet_ids) {
            // Delete existing synced chain items for this outlet to avoid duplicates
            await client.query(`DELETE FROM menu_items WHERE outlet_id = $1 AND chain_id = $2`, [outletId, chain_id]);
            // Re-insert fresh from master
            for (const item of masterItems.rows) {
                await client.query(`
          INSERT INTO menu_items (
            outlet_id, chain_id, category_id, name, description,
            base_price_paise, photo_url, is_available, food_type
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
                    outletId, chain_id, item.category_id, item.name, item.description,
                    item.base_price_paise, item.photo_url, item.is_available, item.food_type
                ]);
            }
        }
        await client.query('COMMIT');
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
    res.json({ success: true, message: `Synced ${masterItems.rowCount} items to ${target_outlet_ids.length} outlets` });
}
