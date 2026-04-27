import { db } from '../../lib/db';

export async function createRFQ(outlet_id: string, data: any) {
  const { title, description, deadline, items } = data;
  
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    const rfqRes = await client.query(`
      INSERT INTO rfqs (outlet_id, title, description, deadline)
      VALUES ($1, $2, $3, $4) RETURNING id
    `, [outlet_id, title, description, deadline]);
    
    const rfq_id = rfqRes.rows[0].id;

    for (const item of items) {
      await client.query(`
        INSERT INTO rfq_items (rfq_id, ingredient_name, quantity, unit)
        VALUES ($1, $2, $3, $4)
      `, [rfq_id, item.name, item.quantity, item.unit]);
    }

    await client.query('COMMIT');
    return { id: rfq_id };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function submitBid(supplier_id: string, rfq_id: string, data: any) {
  const { price_paise, delivery_days, notes } = data;
  const res = await db.query(`
    INSERT INTO rfq_bids (rfq_id, supplier_id, price_paise, delivery_days, notes)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (rfq_id, supplier_id) DO UPDATE 
    SET price_paise = EXCLUDED.price_paise, delivery_days = EXCLUDED.delivery_days, notes = EXCLUDED.notes
    RETURNING *
  `, [rfq_id, supplier_id, price_paise, delivery_days, notes]);
  return res.rows[0];
}

export async function getRFQDetails(rfq_id: string) {
  const rfq = await db.query(`SELECT * FROM rfqs WHERE id = $1`, [rfq_id]);
  const items = await db.query(`SELECT * FROM rfq_items WHERE rfq_id = $1`, [rfq_id]);
  const bids = await db.query(`
    SELECT rb.*, s.name as supplier_name, s.rating as supplier_rating
    FROM rfq_bids rb
    JOIN suppliers s ON s.id = rb.supplier_id
    WHERE rb.rfq_id = $1
  `, [rfq_id]);

  return {
    ...rfq.rows[0],
    items: items.rows,
    bids: bids.rows
  };
}
