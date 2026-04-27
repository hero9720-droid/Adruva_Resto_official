import { db } from '../../lib/db';

export async function predictWaitTime(outlet_id: string, party_size: number) {
  // 1. Get occupied tables and their expected release
  const tables = await db.query(`
    SELECT expected_release_at FROM tables 
    WHERE outlet_id = $1 AND status = 'occupied'
    ORDER BY expected_release_at ASC
  `, [outlet_id]);

  // 2. Simple Prediction Logic
  // In a real AI model, we'd use average meal time based on past data
  if (tables.rowCount === 0) return 0;
  
  // Find a table that fits the party size (Mock logic: just take the soonest release)
  const soonest = tables.rows[0].expected_release_at;
  const now = new Date();
  const diff = soonest ? Math.max(0, Math.floor((new Date(soonest).getTime() - now.getTime()) / 60000)) : 15;
  
  return diff + (party_size > 4 ? 10 : 0); // Party size penalty
}

export async function joinWaitlist(outlet_id: string, data: any) {
  const { customer_name, phone, party_size, source } = data;
  const estimate = await predictWaitTime(outlet_id, party_size);

  const res = await db.query(`
    INSERT INTO waitlist_entries (outlet_id, customer_name, phone, party_size, estimated_wait_minutes, source)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
  `, [outlet_id, customer_name, phone, party_size, estimate, source || 'walk_in']);
  
  return res.rows[0];
}

export async function getActiveWaitlist(outlet_id: string) {
  const res = await db.query(`
    SELECT * FROM waitlist_entries 
    WHERE outlet_id = $1 AND status IN ('waiting', 'called')
    ORDER BY joined_at ASC
  `, [outlet_id]);
  return res.rows;
}

export async function callGuest(id: string) {
  const res = await db.query(`
    UPDATE waitlist_entries SET status = 'called', notified_at = NOW() 
    WHERE id = $1 RETURNING *
  `, [id]);
  
  // Trigger SMS/WhatsApp here
  return res.rows[0];
}
