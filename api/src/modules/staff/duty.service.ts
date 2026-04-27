import { db } from '../../lib/db';
import { AppError } from '../../lib/errors';

export async function clockIn(staff_id: string, outlet_id: string, method: string = 'manual') {
  const today = new Date().toISOString().split('T')[0];

  // 1. Check if already clocked in
  const existing = await db.query(`SELECT id FROM attendance WHERE staff_id = $1 AND date = $2`, [staff_id, today]);
  if ((existing.rowCount ?? 0) > 0) throw new AppError(400, 'Already clocked in for today', 'ALREADY_CLOCKED_IN');

  // 2. Identify the active shift
  const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
  const shiftRes = await db.query(`
    SELECT id, start_time, late_buffer_minutes 
    FROM shifts 
    WHERE outlet_id = $1 AND is_active = TRUE 
    AND $2 BETWEEN start_time AND end_time
    LIMIT 1
  `, [outlet_id, now]);

  const shift = shiftRes.rows[0];
  let is_late = false;

  if (shift) {
    const shiftStart = new Date(`${today}T${shift.start_time}`);
    const actualIn = new Date();
    const diffMins = (actualIn.getTime() - shiftStart.getTime()) / 60000;
    if (diffMins > shift.late_buffer_minutes) is_late = true;
  }

  const result = await db.query(`
    INSERT INTO attendance (outlet_id, staff_id, date, clock_in, clock_in_method, shift_id, is_late)
    VALUES ($1, $2, $3, NOW(), $4, $5, $6)
    RETURNING *
  `, [outlet_id, staff_id, today, method, shift?.id || null, is_late]);

  return result.rows[0];
}

export async function clockOut(staff_id: string, outlet_id: string, method: string = 'manual') {
  const today = new Date().toISOString().split('T')[0];

  const result = await db.query(`
    UPDATE attendance 
    SET clock_out = NOW(), clock_out_method = $1,
        hours_worked = EXTRACT(EPOCH FROM (NOW() - clock_in)) / 3600
    WHERE staff_id = $2 AND outlet_id = $3 AND date = $4 AND clock_out IS NULL
    RETURNING *
  `, [method, staff_id, outlet_id, today]);

  if ((result.rowCount ?? 0) === 0) throw new AppError(404, 'No active clock-in found for today', 'NOT_FOUND');

  return result.rows[0];
}

export async function getLiveRoster(outlet_id: string) {
  const res = await db.query(`
    SELECT a.*, s.name as staff_name, s.role, sh.name as shift_name
    FROM attendance a
    JOIN staff s ON s.id = a.staff_id
    LEFT JOIN shifts sh ON sh.id = a.shift_id
    WHERE a.outlet_id = $1 AND a.date = CURRENT_DATE AND a.clock_out IS NULL
  `, [outlet_id]);

  return res.rows;
}
