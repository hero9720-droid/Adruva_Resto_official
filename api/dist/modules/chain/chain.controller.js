"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalInventory = getGlobalInventory;
exports.getChainPerformance = getChainPerformance;
const db_1 = require("../../lib/db");
async function getGlobalInventory(req, res) {
    const chain_id = req.user.chain_id;
    // Aggregate stock across all outlets for this chain
    const result = await db_1.db.query(`
    SELECT 
      name,
      unit,
      SUM(current_stock) as total_stock,
      SUM(low_threshold) as global_threshold,
      COUNT(*) FILTER (WHERE current_stock <= low_threshold) as outlets_at_risk,
      SUM(current_stock * (avg_cost_paise)) as total_value_paise
    FROM ingredients
    WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)
    GROUP BY name, unit
    ORDER BY outlets_at_risk DESC, total_stock ASC
  `, [chain_id]);
    res.json({ success: true, data: result.rows });
}
async function getChainPerformance(req, res) {
    const chain_id = req.user.chain_id;
    const result = await db_1.db.query(`
    SELECT 
      o.name as outlet_name,
      COALESCE(SUM(b.total_paise), 0) as total_revenue,
      COUNT(b.id) as total_orders,
      COALESCE(AVG(b.total_paise), 0) as avg_order_value
    FROM outlets o
    LEFT JOIN bills b ON o.id = b.outlet_id AND b.status = 'paid'
    WHERE o.chain_id = $1
    GROUP BY o.name
    ORDER BY total_revenue DESC
  `, [chain_id]);
    res.json({ success: true, data: result.rows });
}
