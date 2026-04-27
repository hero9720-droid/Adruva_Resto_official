import { db } from '../../lib/db';

export async function getCentralSupplyOverview(chain_id: string) {
  // 1. Get Base Kitchens
  const kitchens = await db.query(`SELECT id, name FROM outlets WHERE chain_id = $1 AND is_base_kitchen = TRUE`, [chain_id]);
  
  // 2. Pending Indents across the chain
  const indents = await db.query(`
    SELECT st.*, i.name as item_name, o.name as requesting_outlet
    FROM stock_transfers st
    JOIN ingredients i ON i.id = st.ingredient_id
    JOIN outlets o ON o.id = st.to_outlet_id
    WHERE st.chain_id = $1 AND st.status = 'pending' AND st.is_internal_supply = TRUE
    ORDER BY st.created_at ASC
  `, [chain_id]);

  // 3. Active Production Batches
  const batches = await db.query(`
    SELECT * FROM production_batches 
    WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)
    AND status IN ('planned', 'in_production')
  `, [chain_id]);

  return {
    kitchens: kitchens.rows,
    indents: indents.rows,
    activeBatches: batches.rows
  };
}

export async function startProduction(base_kitchen_id: string, data: any) {
  const { item_name, quantity_planned, unit } = data;
  const res = await db.query(`
    INSERT INTO production_batches (outlet_id, item_name, quantity_planned, unit, status, started_at)
    VALUES ($1, $2, $3, $4, 'in_production', NOW())
    RETURNING id
  `, [base_kitchen_id, item_name, quantity_planned, unit]);
  return res.rows[0];
}

export async function dispatchIndents(batch_id: string, indent_ids: string[]) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    // Update batch status
    await client.query(`UPDATE production_batches SET status = 'completed', completed_at = NOW() WHERE id = $1`, [batch_id]);

    // Dispatch indents
    for (const id of indent_ids) {
      await client.query(`
        UPDATE stock_transfers 
        SET status = 'shipped', production_batch_id = $1, dispatch_time = NOW() 
        WHERE id = $2
      `, [batch_id, id]);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
