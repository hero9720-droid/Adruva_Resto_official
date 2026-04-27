import { db } from '../../lib/db';

export async function updateDailyConsumption(outlet_id: string, date: string) {
  // Aggregate consumption based on orders served on that date
  // Formula: order_item -> recipe -> recipe_ingredients
  await db.query(`
    INSERT INTO ingredient_consumption_daily (outlet_id, ingredient_id, log_date, quantity_used)
    SELECT 
      o.outlet_id,
      ri.ingredient_id,
      $2::date,
      SUM(oi.quantity * ri.quantity)
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN recipes r ON oi.menu_item_id = r.menu_item_id
    JOIN recipe_ingredients ri ON r.id = ri.recipe_id
    WHERE o.outlet_id = $1 AND o.created_at::date = $2::date AND o.status IN ('served', 'ready')
    GROUP BY o.outlet_id, ri.ingredient_id
    ON CONFLICT (ingredient_id, log_date) DO UPDATE 
    SET quantity_used = EXCLUDED.quantity_used;
  `, [outlet_id, date]);
}

export async function runForecaster(outlet_id: string) {
  const ingredients = await db.query('SELECT id, name FROM ingredients WHERE outlet_id = $1 AND is_active = true', [outlet_id]);

  for (const ing of ingredients.rows) {
    // Weighted Moving Average Logic:
    // (Avg of last 7 days * 0.6) + (Avg of same day in last 3 weeks * 0.4)
    const stats = await db.query(`
      WITH last_7 AS (
        SELECT AVG(quantity_used) as avg_7 
        FROM ingredient_consumption_daily 
        WHERE ingredient_id = $1 AND log_date > CURRENT_DATE - INTERVAL '7 days'
      ),
      same_day AS (
        SELECT AVG(quantity_used) as avg_same 
        FROM ingredient_consumption_daily 
        WHERE ingredient_id = $1 
        AND EXTRACT(DOW FROM log_date) = EXTRACT(DOW FROM CURRENT_DATE + INTERVAL '1 day')
      )
      SELECT 
        COALESCE(avg_7, 0) * 0.6 + COALESCE(avg_same, 0) * 0.4 as prediction
      FROM last_7, same_day
    `, [ing.id]);

    const predicted = stats.rows[0].prediction || 0;

    await db.query(`
      INSERT INTO inventory_forecasts (outlet_id, ingredient_id, forecast_date, predicted_demand, metadata)
      VALUES ($1, $2, CURRENT_DATE + INTERVAL '1 day', $3, $4)
      ON CONFLICT (ingredient_id, forecast_date) DO UPDATE 
      SET predicted_demand = EXCLUDED.predicted_demand;
    `, [outlet_id, ing.id, predicted, JSON.stringify({ method: 'weighted_ma', ran_at: new Date() })]);
  }
}

export async function getStockPredictions(outlet_id: string) {
  const result = await db.query(`
    SELECT 
      i.name,
      i.current_stock,
      i.unit,
      f.predicted_demand,
      CASE 
        WHEN f.predicted_demand > 0 THEN (i.current_stock / f.predicted_demand)
        ELSE 99
      END as days_remaining,
      i.low_threshold,
      i.reorder_quantity,
      i.lead_time_days
    FROM ingredients i
    LEFT JOIN inventory_forecasts f ON i.id = f.ingredient_id AND f.forecast_date = CURRENT_DATE + INTERVAL '1 day'
    WHERE i.outlet_id = $1 AND i.is_active = true
    ORDER BY days_remaining ASC
  `, [outlet_id]);

  return result.rows;
}
