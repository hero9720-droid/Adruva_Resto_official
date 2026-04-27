import { db } from '../../lib/db';

export async function getWastageRiskAlerts(outlet_id: string) {
  // 1. Join current stock with predicted usage and shelf life
  const risks = await db.query(`
    SELECT 
      i.id, 
      i.name, 
      i.current_stock,
      i.unit,
      COALESCE(idf.predicted_usage_7d, 0) as predicted_usage,
      (i.current_stock - COALESCE(idf.predicted_usage_7d, 0)) as excess_stock,
      ib.expiry_date
    FROM ingredients i
    LEFT JOIN inventory_demand_forecasts idf ON idf.ingredient_id = i.id
    LEFT JOIN ingredient_batches ib ON ib.ingredient_id = i.id AND ib.is_used = FALSE
    WHERE i.outlet_id = $1 AND i.is_perishable = TRUE
    AND (i.current_stock > COALESCE(idf.predicted_usage_7d, 0) OR ib.expiry_date < NOW() + INTERVAL '3 days')
    ORDER BY ib.expiry_date ASC
  `, [outlet_id]);

  return risks.rows;
}

export async function generateWastageAnalytics(outlet_id: string) {
  const wastage = await db.query(`
    SELECT 
      reason, 
      SUM(quantity) as total_qty,
      SUM(cost_impact_paise) as total_loss_paise
    FROM inventory_wastage_records
    WHERE outlet_id = $1 AND created_at > NOW() - INTERVAL '30 days'
    GROUP BY reason
    ORDER BY total_loss_paise DESC
  `, [outlet_id]);

  return wastage.rows;
}

export async function runPredictiveEngine(outlet_id: string) {
  // Logic: 
  // 1. Get 30 day sales for all menu items
  // 2. Explode menu items into recipe ingredients
  // 3. Average daily usage * 7
  // 4. Update inventory_demand_forecasts
  
  const usage = await db.query(`
    SELECT 
      ri.ingredient_id,
      SUM(ri.quantity * oi.quantity) / 30.0 * 7.0 as predicted_7d
    FROM order_items oi
    JOIN recipes r ON r.menu_item_id = oi.menu_item_id
    JOIN recipe_ingredients ri ON ri.recipe_id = r.id
    WHERE oi.outlet_id = $1 AND oi.created_at > NOW() - INTERVAL '30 days'
    GROUP BY ri.ingredient_id
  `, [outlet_id]);

  for (const row of usage.rows) {
    await db.query(`
      INSERT INTO inventory_demand_forecasts (outlet_id, ingredient_id, predicted_usage_7d)
      VALUES ($1, $2, $3)
      ON CONFLICT (outlet_id, ingredient_id) DO UPDATE 
      SET predicted_usage_7d = EXCLUDED.predicted_usage_7d, last_updated_at = NOW()
    `, [outlet_id, row.ingredient_id, row.predicted_7d]);
  }

  return { ingredientsUpdated: usage.rowCount };
}
