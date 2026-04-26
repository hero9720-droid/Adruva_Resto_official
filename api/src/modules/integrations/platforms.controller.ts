import { Request, Response } from 'express';
import { db } from '../../lib/db';
import { AppError } from '../../lib/errors';

export async function getPlatformStatus(req: Request, res: Response) {
  const { outlet_id } = req.params;
  const result = await db.query(
    'SELECT * FROM external_platforms WHERE outlet_id = $1',
    [outlet_id]
  );
  res.json({ success: true, data: result.rows });
}

export async function togglePlatform(req: Request, res: Response) {
  const { outlet_id, platform_name } = req.params;
  const { is_active } = req.body;

  const result = await db.query(
    `UPDATE external_platforms 
     SET is_active = $1 
     WHERE outlet_id = $2 AND platform_name = $3 
     RETURNING *`,
    [is_active, outlet_id, platform_name]
  );

  // In real implementation, this would call Zomato/Swiggy API
  console.log(`[EXTERNAL_SYNC] ${platform_name.toUpperCase()} for outlet ${outlet_id} set to ${is_active ? 'ONLINE' : 'OFFLINE'}`);

  res.json({ success: true, data: result.rows[0] });
}

export async function syncMenuItemStatus(req: Request, res: Response) {
  const { item_id } = req.params;
  const { platform_name, is_available } = req.body;

  const item = await db.query('SELECT external_sync_status FROM menu_items WHERE id = $1', [item_id]);
  if (item.rowCount === 0) throw new AppError(404, 'Item not found', 'NOT_FOUND');

  const newStatus = { ...item.rows[0].external_sync_status, [platform_name]: is_available };

  await db.query(
    'UPDATE menu_items SET external_sync_status = $1 WHERE id = $2',
    [JSON.stringify(newStatus), item_id]
  );

  console.log(`[ITEM_SYNC] ${item_id} set to ${is_available ? 'AVAILABLE' : 'OUT_OF_STOCK'} on ${platform_name.toUpperCase()}`);

  res.json({ success: true, status: newStatus });
}

export async function getAggregatedOrders(req: Request, res: Response) {
  const { outlet_id } = req.params;
  const result = await db.query(
    `SELECT * FROM orders 
     WHERE outlet_id = $1 AND external_platform IS NOT NULL 
     ORDER BY created_at DESC LIMIT 50`,
    [outlet_id]
  );
  res.json({ success: true, data: result.rows });
}
