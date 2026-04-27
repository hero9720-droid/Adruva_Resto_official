"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTerritoryOverview = getTerritoryOverview;
exports.createFieldReport = createFieldReport;
const db_1 = require("../../lib/db");
async function getTerritoryOverview(manager_id) {
    // 1. Get assigned outlets
    const outlets = await db_1.db.query(`
    SELECT o.id, o.name, o.city
    FROM outlets o
    JOIN area_manager_territories amt ON amt.outlet_id = o.id
    WHERE amt.manager_id = $1
  `, [manager_id]);
    if (outlets.rowCount === 0)
        return { metrics: {}, outlets: [] };
    const outletIds = outlets.rows.map(o => o.id);
    // 2. Aggregate metrics for the territory
    const metrics = await db_1.db.query(`
    SELECT 
      COUNT(b.id) as total_orders,
      SUM(b.total_paise) as total_revenue,
      AVG(EXTRACT(EPOCH FROM (oi.updated_at - oi.created_at))/60) as avg_prep_time
    FROM bills b
    LEFT JOIN order_items oi ON oi.order_id IN (SELECT id FROM orders WHERE outlet_id = b.outlet_id)
    WHERE b.outlet_id = ANY($1) AND b.created_at > NOW() - INTERVAL '30 days'
  `, [outletIds]);
    // 3. Performance per outlet
    const performance = await db_1.db.query(`
    SELECT 
      o.name, 
      COUNT(b.id) as order_count,
      COALESCE(SUM(b.total_paise), 0) as revenue
    FROM outlets o
    LEFT JOIN bills b ON b.outlet_id = o.id AND b.created_at > NOW() - INTERVAL '30 days'
    WHERE o.id = ANY($1)
    GROUP BY o.id, o.name
    ORDER BY revenue DESC
  `, [outletIds]);
    return {
        summary: metrics.rows[0],
        outlets: performance.rows
    };
}
async function createFieldReport(manager_id, outlet_id, data) {
    const { operational_score, hygiene_score, service_score, findings, action_plan } = data;
    const res = await db_1.db.query(`
    INSERT INTO territory_field_reports (
      manager_id, outlet_id, operational_score, hygiene_score, 
      service_score, findings, action_plan, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'published')
    RETURNING id
  `, [manager_id, outlet_id, operational_score, hygiene_score, service_score, findings, action_plan]);
    return res.rows[0];
}
