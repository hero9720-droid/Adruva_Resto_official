import { Request, Response } from 'express';
import { withOutletContext } from '../../lib/db';

export async function getSalesOverview(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { period = '7days' } = req.query;

  // Map period to SQL interval
  const intervalMap: Record<string, string> = {
    '7days':  '7 days',
    '30days': '30 days',
    '90days': '90 days',
  };
  const interval = intervalMap[period as string] ?? '7 days';

  const result = await withOutletContext(outlet_id, async (client) => {
    // 1. Daily sales trend
    const salesTrend = await client.query(`
      SELECT 
        DATE(created_at)          AS date,
        COALESCE(SUM(total_paise), 0)::int  AS total_sales,
        COUNT(*)::int             AS order_count
      FROM bills
      WHERE outlet_id = $1
        AND status = 'paid'
        AND created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [outlet_id]);

    // 2. Payment method breakdown (correct table: payment_transactions, column: method)
    const paymentMethods = await client.query(`
      SELECT 
        method                          AS payment_method,
        COALESCE(SUM(amount_paise), 0)::int AS total
      FROM payment_transactions
      WHERE outlet_id = $1
        AND status = 'captured'
        AND created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY method
      ORDER BY total DESC
    `, [outlet_id]);

    // 3. Today's key metrics
    const metrics = await client.query(`
      SELECT 
        COALESCE(SUM(total_paise), 0)::int  AS total_revenue,
        COUNT(*)::int                        AS total_bills,
        COALESCE(AVG(total_paise), 0)::int   AS avg_order_value
      FROM bills 
      WHERE outlet_id = $1
        AND status = 'paid'
        AND created_at >= date_trunc('day', NOW())
    `, [outlet_id]);

    // 4. This week vs last week comparison
    const weekComparison = await client.query(`
      SELECT
        COALESCE(SUM(CASE WHEN created_at >= date_trunc('week', NOW()) THEN total_paise END), 0)::int AS this_week,
        COALESCE(SUM(CASE WHEN created_at >= date_trunc('week', NOW()) - INTERVAL '7 days'
                           AND created_at <  date_trunc('week', NOW()) THEN total_paise END), 0)::int AS last_week
      FROM bills
      WHERE outlet_id = $1 AND status = 'paid'
    `, [outlet_id]);

    return {
      salesTrend:      salesTrend.rows,
      paymentMethods:  paymentMethods.rows,
      today:           metrics.rows[0],
      weekComparison:  weekComparison.rows[0],
    };
  });

  res.json({ success: true, data: result });
}

export async function getTopItems(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(`
      SELECT 
        mi.name,
        mi.food_type,
        SUM(oi.quantity)::int        AS total_quantity,
        SUM(oi.total_paise)::int     AS total_revenue
      FROM order_items oi
      JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE oi.outlet_id = $1
      GROUP BY mi.id, mi.name, mi.food_type
      ORDER BY total_quantity DESC
      LIMIT 10
    `, [outlet_id]);
    return r.rows;
  });

  res.json({ success: true, data: result });
}

export async function getStaffPerformance(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(`
      SELECT 
        s.name,
        s.role,
        COUNT(DISTINCT o.id)::int    AS total_orders,
        COALESCE(SUM(oi.total_paise), 0)::int AS total_sales
      FROM staff s
      JOIN orders o  ON o.waiter_id = s.id
      JOIN order_items oi ON oi.order_id = o.id
      WHERE s.outlet_id = $1
      GROUP BY s.id, s.name, s.role
      ORDER BY total_sales DESC
    `, [outlet_id]);
    return r.rows;
  });

  res.json({ success: true, data: result });
}

export async function getHourlyHeatmap(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(`
      SELECT
        EXTRACT(DOW  FROM created_at)::int  AS day_of_week,
        EXTRACT(HOUR FROM created_at)::int  AS hour_of_day,
        COUNT(*)::int                        AS order_count,
        COALESCE(SUM(total_paise), 0)::int   AS revenue
      FROM bills
      WHERE outlet_id = $1
        AND status = 'paid'
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY day_of_week, hour_of_day
      ORDER BY day_of_week, hour_of_day
    `, [outlet_id]);
    return r.rows;
  });

  res.json({ success: true, data: result });
}
