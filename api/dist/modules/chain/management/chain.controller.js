"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChainMetrics = getChainMetrics;
exports.listOutlets = listOutlets;
exports.createOutlet = createOutlet;
exports.syncMasterMenu = syncMasterMenu;
exports.getChainPnLAnalysis = getChainPnLAnalysis;
exports.updateChainSettings = updateChainSettings;
exports.getChainDetails = getChainDetails;
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
async function getChainPnLAnalysis(req, res) {
    const chain_id = req.user.chain_id;
    const { start_date, end_date } = req.query;
    const filters = 'AND b.created_at >= $2 AND b.created_at <= $3';
    const params = [chain_id, start_date || '1970-01-01', end_date || '2100-01-01'];
    // 1. Comparative Revenue & Profit by Outlet
    const outletPerformance = await db_1.db.query(`
    SELECT 
      o.name as outlet_name,
      COUNT(b.id)::int as total_bills,
      COALESCE(SUM(b.subtotal_paise), 0)::bigint as gross_revenue,
      COALESCE(SUM(b.tax_paise), 0)::bigint as total_tax,
      COALESCE(SUM(b.discount_paise), 0)::bigint as total_discounts,
      COALESCE(SUM(b.total_paise), 0)::bigint as net_revenue
    FROM outlets o
    LEFT JOIN bills b ON b.outlet_id = o.id AND b.status = 'paid' ${filters}
    WHERE o.chain_id = $1
    GROUP BY o.id, o.name
    ORDER BY net_revenue DESC
  `, params);
    // 2. 7-Day Trend Comparison
    const revenueTrends = await db_1.db.query(`
    SELECT 
      o.name as outlet_name,
      DATE(b.created_at) as date,
      SUM(b.total_paise)::bigint as daily_revenue
    FROM outlets o
    JOIN bills b ON b.outlet_id = o.id
    WHERE o.chain_id = $1 AND b.status = 'paid' AND b.created_at >= NOW() - INTERVAL '14 days'
    GROUP BY o.name, DATE(b.created_at)
    ORDER BY date ASC
  `, [chain_id]);
    // 3. Chain-wide Category Performance
    const categoryLeaderboard = await db_1.db.query(`
    SELECT 
      c.name as category_name,
      SUM(oi.quantity)::int as total_quantity,
      SUM(oi.total_paise)::bigint as total_sales
    FROM menu_categories c
    JOIN menu_items mi ON mi.category_id = c.id
    JOIN order_items oi ON oi.menu_item_id = mi.id
    JOIN orders o ON o.id = oi.order_id
    WHERE c.outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)
      AND o.status = 'completed'
    GROUP BY c.name
    ORDER BY total_sales DESC
    LIMIT 10
  `, [chain_id]);
    res.json({
        success: true,
        data: {
            outletPerformance: outletPerformance.rows,
            trends: revenueTrends.rows,
            categoryLeaderboard: categoryLeaderboard.rows
        }
    });
}
async function updateChainSettings(req, res) {
    const chain_id = req.user.chain_id;
    const { loyalty_config } = req.body;
    await db_1.db.query('UPDATE chains SET loyalty_config = COALESCE($1, loyalty_config) WHERE id = $2', [loyalty_config ? JSON.stringify(loyalty_config) : null, chain_id]);
    res.json({ success: true, message: 'Chain settings updated' });
}
async function getChainDetails(req, res) {
    const chain_id = req.user.chain_id;
    const result = await db_1.db.query('SELECT * FROM chains WHERE id = $1', [chain_id]);
    res.json({ success: true, data: result.rows[0] });
}
