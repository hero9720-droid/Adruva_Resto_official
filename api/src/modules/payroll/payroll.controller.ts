import { Request, Response } from 'express';
import { db } from '../../lib/db';
import { AppError } from '../../lib/errors';

export async function upsertPayrollConfig(req: Request, res: Response) {
  const { staff_id, base_salary_paise, hourly_rate_paise, overtime_multiplier } = req.body;

  const result = await db.query(
    `INSERT INTO payroll_configs (staff_id, base_salary_paise, hourly_rate_paise, overtime_multiplier)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (staff_id) DO UPDATE SET 
       base_salary_paise = EXCLUDED.base_salary_paise,
       hourly_rate_paise = EXCLUDED.hourly_rate_paise,
       overtime_multiplier = EXCLUDED.overtime_multiplier,
       updated_at = NOW()
     RETURNING *`,
    [staff_id, base_salary_paise || 0, hourly_rate_paise || 0, overtime_multiplier || 1.5]
  );

  res.json({ success: true, data: result.rows[0] });
}

export async function generatePayrollCycle(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const { month, year } = req.body;

  // 1. Create Cycle
  const cycleRes = await db.query(
    `INSERT INTO payroll_cycles (chain_id, month, year) VALUES ($1, $2, $3) 
     ON CONFLICT (chain_id, month, year) DO UPDATE SET status = 'processing' RETURNING *`,
    [chain_id, month, year]
  );
  const cycle = cycleRes.rows[0];

  // 2. Fetch all staff for the chain
  const staff = await db.query(
    `SELECT s.*, pc.base_salary_paise, pc.hourly_rate_paise, pc.overtime_multiplier 
     FROM staff s
     LEFT JOIN payroll_configs pc ON pc.staff_id = s.id
     WHERE s.outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)`,
    [chain_id]
  );

  for (const s of staff.rows) {
    // 3. Calculate Hours from Attendance
    // Simulated: In production, sum (check_out - check_in) for the month
    const hoursWorked = 160; 
    const overtimeHours = 10;

    const basePaid = s.base_salary_paise || (s.hourly_rate_paise * hoursWorked);
    const overtimePaid = (s.hourly_rate_paise || 0) * overtimeHours * (s.overtime_multiplier || 1.5);
    const netPaid = Number(basePaid) + Number(overtimePaid);

    await db.query(
      `INSERT INTO payslips (cycle_id, staff_id, base_paid_paise, overtime_paid_paise, net_paid_paise)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [cycle.id, s.id, basePaid, overtimePaid, netPaid]
    );
  }

  await db.query("UPDATE payroll_cycles SET status = 'completed' WHERE id = $1", [cycle.id]);

  res.json({ success: true, message: `Payroll cycle for ${month}/${year} completed.` });
}

export async function getCyclePayslips(req: Request, res: Response) {
  const { cycle_id } = req.params;
  const result = await db.query(
    `SELECT p.*, s.name as staff_name, s.role as staff_role, o.name as outlet_name
     FROM payslips p
     JOIN staff s ON s.id = p.staff_id
     JOIN outlets o ON o.id = s.outlet_id
     WHERE p.cycle_id = $1`,
    [cycle_id]
  );
  res.json({ success: true, data: result.rows });
}

export async function getPayrollCycles(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const result = await db.query(
    'SELECT * FROM payroll_cycles WHERE chain_id = $1 ORDER BY year DESC, month DESC',
    [chain_id]
  );
  res.json({ success: true, data: result.rows });
}
