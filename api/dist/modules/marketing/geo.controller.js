"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeoCampaigns = getGeoCampaigns;
exports.createGeoCampaign = createGeoCampaign;
exports.trackGeoEvent = trackGeoEvent;
exports.getGeoAnalytics = getGeoAnalytics;
const db_1 = require("../../lib/db");
async function getGeoCampaigns(req, res) {
    const { chain_id } = req.params;
    const result = await db_1.db.query('SELECT * FROM geo_campaigns WHERE chain_id = $1 ORDER BY created_at DESC', [chain_id]);
    res.json({ success: true, data: result.rows });
}
async function createGeoCampaign(req, res) {
    const { chain_id } = req.params;
    const { name, trigger_message, coupon_id, min_distance_meters } = req.body;
    const result = await db_1.db.query(`INSERT INTO geo_campaigns (chain_id, name, trigger_message, coupon_id, min_distance_meters)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`, [chain_id, name, trigger_message, coupon_id, min_distance_meters]);
    res.status(201).json({ success: true, data: result.rows[0] });
}
async function trackGeoEvent(req, res) {
    const { customer_id, outlet_id, campaign_id, distance_meters } = req.body;
    const result = await db_1.db.query(`INSERT INTO geo_events (customer_id, outlet_id, campaign_id, distance_meters)
     VALUES ($1, $2, $3, $4) RETURNING *`, [customer_id, outlet_id, campaign_id, distance_meters]);
    // In real implementation, this would trigger a push notification via Firebase/OneSignal
    console.log(`[GEO_TRIGGER] Customer ${customer_id} is ${distance_meters}m from Outlet ${outlet_id}. Sending: ${campaign_id}`);
    res.json({ success: true, event_id: result.rows[0].id });
}
async function getGeoAnalytics(req, res) {
    const { chain_id } = req.params;
    const stats = await db_1.db.query(`SELECT 
       gc.name as campaign_name,
       COUNT(ge.id) as total_triggers,
       SUM(CASE WHEN ge.converted THEN 1 ELSE 0 END) as total_conversions
     FROM geo_campaigns gc
     LEFT JOIN geo_events ge ON ge.campaign_id = gc.id
     WHERE gc.chain_id = $1
     GROUP BY gc.id`, [chain_id]);
    res.json({ success: true, data: stats.rows });
}
