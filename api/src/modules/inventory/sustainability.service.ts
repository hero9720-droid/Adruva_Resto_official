import { db } from '../../lib/db';

export async function logWasteWithImpact(outlet_id: string, data: any) {
  const { ingredient_id, quantity, reason, category } = data;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch ingredient cost
    const ing = await client.query('SELECT name, avg_cost_paise, unit FROM ingredients WHERE id = $1', [ingredient_id]);
    const cost = Number(ing.rows[0].avg_cost_paise) * Number(quantity);

    // 2. Mock Impact Factors
    // kg CO2 per kg/unit
    const impactMap: any = {
      meat: { co2: 15.0, water: 5000 },
      dairy: { co2: 5.0, water: 1000 },
      produce: { co2: 0.5, water: 100 },
      dry_goods: { co2: 1.0, water: 50 }
    };
    const factors = impactMap[category] || impactMap.dry_goods;
    const co2_impact = Number(quantity) * factors.co2;
    const water_impact = Number(quantity) * factors.water;

    // 3. Create Stock Movement (wastage)
    const movement = await client.query(`
      INSERT INTO stock_movements (outlet_id, ingredient_id, type, quantity, total_cost_paise, reason)
      VALUES ($1, $2, 'wastage', $3, $4, $5) RETURNING id
    `, [outlet_id, ingredient_id, quantity, cost, reason]);

    // 4. Log Detailed Sustainability Data
    await client.query(`
      INSERT INTO sustainability_waste_logs 
      (outlet_id, stock_movement_id, item_category, waste_reason, quantity, unit, cost_impact_paise, co2_impact_kg, water_impact_liters)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [outlet_id, movement.rows[0].id, category, reason, quantity, ing.rows[0].unit, cost, co2_impact, water_impact]);

    await client.query('COMMIT');
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getChainSustainabilityReport(chain_id: string) {
  const res = await db.query(`
    SELECT 
      w.item_category, 
      SUM(w.co2_impact_kg) as total_co2, 
      SUM(w.water_impact_liters) as total_water,
      SUM(w.cost_impact_paise) as total_cost
    FROM sustainability_waste_logs w
    JOIN outlets o ON o.id = w.outlet_id
    WHERE o.chain_id = $1
    GROUP BY w.item_category
  `, [chain_id]);
  return res.rows;
}
