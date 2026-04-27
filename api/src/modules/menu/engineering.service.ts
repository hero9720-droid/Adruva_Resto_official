import { db } from '../../lib/db';

export async function runMatrixAnalysis(outlet_id: string, period: string) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch sales performance for the period
    const performance = await client.query(`
      SELECT 
        mi.id, 
        mi.name, 
        mi.base_price_paise, 
        mi.cost_price_paise,
        COALESCE(SUM(oi.quantity), 0)::int as sales_count,
        COALESCE(SUM(oi.total_paise), 0)::bigint as total_revenue
      FROM menu_items mi
      LEFT JOIN order_items oi ON oi.menu_item_id = mi.id
      LEFT JOIN orders o ON o.id = oi.order_id AND TO_CHAR(o.created_at, 'YYYY-MM') = $2 AND o.status = 'completed'
      WHERE mi.outlet_id = $1
      GROUP BY mi.id
    `, [outlet_id, period]);

    const items = performance.rows;
    if (items.length === 0) return [];

    // 2. Calculate Medians
    const salesCounts = items.map(i => i.sales_count).sort((a, b) => a - b);
    const margins = items.map(i => Number(i.base_price_paise) - Number(i.cost_price_paise)).sort((a, b) => a - b);
    
    const medianSales = salesCounts[Math.floor(salesCounts.length / 2)];
    const medianMargin = margins[Math.floor(margins.length / 2)];

    // 3. Classify and Upsert
    const results = [];
    for (const item of items) {
      const margin = Number(item.base_price_paise) - Number(item.cost_price_paise);
      const isPopHigh = item.sales_count >= medianSales;
      const isProfHigh = margin >= medianMargin;

      let classification = 'DOG';
      if (isPopHigh && isProfHigh) classification = 'STAR';
      else if (isPopHigh && !isProfHigh) classification = 'PLOWHORSE';
      else if (!isPopHigh && isProfHigh) classification = 'PUZZLE';

      await client.query(`
        INSERT INTO menu_matrix_analysis 
        (outlet_id, menu_item_id, sales_count, gross_profit_paise, classification, popularity_index, profitability_index, period_month)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (menu_item_id, period_month) DO UPDATE SET
          sales_count = EXCLUDED.sales_count,
          gross_profit_paise = EXCLUDED.gross_profit_paise,
          classification = EXCLUDED.classification,
          popularity_index = EXCLUDED.popularity_index,
          profitability_index = EXCLUDED.profitability_index
      `, [
        outlet_id, 
        item.id, 
        item.sales_count, 
        margin * item.sales_count, 
        classification,
        isPopHigh ? 'HIGH' : 'LOW',
        isProfHigh ? 'HIGH' : 'LOW',
        period
      ]);

      results.push({ ...item, classification, margin });
    }

    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getMatrixData(outlet_id: string, period: string) {
  const res = await db.query(`
    SELECT m.*, mi.name as item_name, mi.base_price_paise
    FROM menu_matrix_analysis m
    JOIN menu_items mi ON mi.id = m.menu_item_id
    WHERE m.outlet_id = $1 AND m.period_month = $2
  `, [outlet_id, period]);
  return res.rows;
}
