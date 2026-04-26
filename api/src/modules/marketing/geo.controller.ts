import { Request, Response } from 'express';
import { db } from '../../lib/db';
import { AppError } from '../../lib/errors';

export async function getGeoCampaigns(req: Request, res: Response) {
  const { chain_id } = req.params;
  const result = await db.query(
    'SELECT * FROM geo_campaigns WHERE chain_id = $1 ORDER BY created_at DESC',
    [chain_id]
  );
  res.json({ success: true, data: result.rows });
}

export async function createGeoCampaign(req: Request, res: Response) {
  const { chain_id } = req.params;
  const { name, trigger_message, coupon_id, min_distance_meters } = req.body;

  const result = await db.query(
    `INSERT INTO geo_campaigns (chain_id, name, trigger_message, coupon_id, min_distance_meters)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [chain_id, name, trigger_message, coupon_id, min_distance_meters]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
}

export async function trackGeoEvent(req: Request, res: Response) {
  const { customer_id, outlet_id, campaign_id, distance_meters } = req.body;

  const result = await db.query(
    `INSERT INTO geo_events (customer_id, outlet_id, campaign_id, distance_meters)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [customer_id, outlet_id, campaign_id, distance_meters]
  );

  // In real implementation, this would trigger a push notification via Firebase/OneSignal
  console.log(`[GEO_TRIGGER] Customer ${customer_id} is ${distance_meters}m from Outlet ${outlet_id}. Sending: ${campaign_id}`);

  res.json({ success: true, event_id: result.rows[0].id });
}

export async function getGeoAnalytics(req: Request, res: Response) {
  const { chain_id } = req.params;
  
  const stats = await db.query(
    `SELECT 
       gc.name as campaign_name,
       COUNT(ge.id) as total_triggers,
       SUM(CASE WHEN ge.converted THEN 1 ELSE 0 END) as total_conversions
     FROM geo_campaigns gc
     LEFT JOIN geo_events ge ON ge.campaign_id = gc.id
     WHERE gc.chain_id = $1
     GROUP BY gc.id`,
    [chain_id]
  );

  res.json({ success: true, data: stats.rows });
}
