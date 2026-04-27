import { db } from '../../lib/db';

export async function getKDSFeed(outlet_id: string, station_name?: string) {
  const query = `
    SELECT oi.*, m.name as item_name, o.order_number, o.source, o.type as order_type,
           t.name as table_name,
           EXTRACT(EPOCH FROM (NOW() - oi.created_at)) / 60 as wait_time_minutes
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN menu_items m ON m.id = oi.menu_item_id
    LEFT JOIN tables t ON t.id = o.table_id
    WHERE oi.outlet_id = $1 
      AND oi.status IN ('pending', 'preparing')
      ${station_name ? 'AND oi.station = $2' : ''}
    ORDER BY oi.is_priority DESC, oi.created_at ASC
  `;
  
  const params = station_name ? [outlet_id, station_name] : [outlet_id];
  const res = await db.query(query, params);
  return res.rows;
}

export async function updateItemKDSStatus(item_id: string, status: 'preparing' | 'ready') {
  const now = new Date();
  
  const updateQuery = status === 'preparing' 
    ? `UPDATE order_items SET status = $1, prep_started_at = $2 WHERE id = $3 RETURNING *`
    : `UPDATE order_items SET status = $1, prep_completed_at = $2 WHERE id = $3 RETURNING *`;
    
  const res = await db.query(updateQuery, [status, now, item_id]);
  const item = res.rows[0];

  if (status === 'ready' && item.prep_started_at) {
    // Log performance metrics
    const prepSeconds = Math.round((now.getTime() - new Date(item.prep_started_at).getTime()) / 1000);
    const isOverTarget = (prepSeconds / 60) > (item.target_prep_time_minutes || 15);
    
    await db.query(`
      INSERT INTO kds_performance_logs (outlet_id, station_name, order_item_id, prep_time_seconds, is_over_target)
      VALUES ($1, $2, $3, $4, $5)
    `, [item.outlet_id, item.station || 'General', item.id, prepSeconds, isOverTarget]);
  }

  return item;
}

export async function getStationLoad(outlet_id: string) {
  const res = await db.query(`
    SELECT station, COUNT(*) as active_orders,
           AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60) as avg_wait_time
    FROM order_items
    WHERE outlet_id = $1 AND status IN ('pending', 'preparing')
    GROUP BY station
  `, [outlet_id]);
  
  return res.rows;
}
