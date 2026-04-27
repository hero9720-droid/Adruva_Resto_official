import { db } from '../../lib/db';

export async function getStaffByOutlet(outlet_id: string) {
  const r = await db.query(
    'SELECT * FROM staff WHERE outlet_id = $1 ORDER BY created_at DESC',
    [outlet_id]
  );
  return r.rows;
}

export async function createStaff(data: any) {
  const { outlet_id, name, role, pin, base_pay_paise } = data;
  const r = await db.query(
    `INSERT INTO staff (outlet_id, name, role, pin, base_pay_paise, is_active)
     VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
    [outlet_id, name, role, pin || null, base_pay_paise || 0]
  );
  return r.rows[0];
}
