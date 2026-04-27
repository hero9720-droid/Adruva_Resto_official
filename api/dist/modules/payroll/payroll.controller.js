"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertPayrollConfig = upsertPayrollConfig;
exports.generatePayrollCycle = generatePayrollCycle;
exports.getCyclePayslips = getCyclePayslips;
exports.getPayrollCycles = getPayrollCycles;
const db_1 = require("../../lib/db");
async function upsertPayrollConfig(req, res) {
    const { staff_id, base_salary_paise, hourly_rate_paise, overtime_multiplier } = req.body;
    const result = await db_1.db.query(`INSERT INTO payroll_configs (staff_id, base_salary_paise, hourly_rate_paise, overtime_multiplier)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (staff_id) DO UPDATE SET 
       base_salary_paise = EXCLUDED.base_salary_paise,
       hourly_rate_paise = EXCLUDED.hourly_rate_paise,
       overtime_multiplier = EXCLUDED.overtime_multiplier,
       updated_at = NOW()
     RETURNING *`, [staff_id, base_salary_paise || 0, hourly_rate_paise || 0, overtime_multiplier || 1.5]);
    res.json({ success: true, data: result.rows[0] });
}
async function generatePayrollCycle(req, res) {
    const chain_id = req.user.chain_id;
    const { month, year } = req.body;
    const targetMonth = `${year}-${String(month).padStart(2, '0')}`;
    // 1. Create Cycle
    const cycleRes = await db_1.db.query(`INSERT INTO payroll_cycles (chain_id, month, year) VALUES ($1, $2, $3) 
     ON CONFLICT (chain_id, month, year) DO UPDATE SET status = 'processing' RETURNING *`, [chain_id, month, year]);
    const cycle = cycleRes.rows[0];
    // 2. Fetch all staff and their attendance hours for the month
    const staff = await db_1.db.query(`SELECT 
       s.id, 
       s.name,
       pg.rate_paise,
       pg.salary_type,
       COALESCE(SUM(a.hours_worked), 0)::float as total_hours,
       COALESCE(SUM(adv.amount_paise), 0)::int as total_advances
     FROM staff s
     LEFT JOIN pay_grades pg ON pg.id = s.pay_grade_id
     LEFT JOIN attendance a ON a.staff_id = s.id AND TO_CHAR(a.date, 'YYYY-MM') = $2
     LEFT JOIN salary_advances adv ON adv.staff_id = s.id AND adv.deduct_month = $2 AND adv.is_deducted = false
     WHERE s.outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)
     GROUP BY s.id, pg.id`, [chain_id, targetMonth]);
    for (const s of staff.rows) {
        let basePaid = 0;
        if (s.salary_type === 'monthly') {
            basePaid = s.rate_paise || 0;
        }
        else if (s.salary_type === 'hourly') {
            basePaid = Math.round((s.rate_paise || 0) * s.total_hours);
        }
        else if (s.salary_type === 'daily') {
            // 8h shift assumption
            basePaid = Math.round((s.rate_paise || 0) * (s.total_hours / 8));
        }
        const netPaid = basePaid - (s.total_advances || 0);
        await db_1.db.query(`INSERT INTO payslips (cycle_id, staff_id, base_paid_paise, net_paid_paise, hours_worked)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (cycle_id, staff_id) DO UPDATE SET
         base_paid_paise = EXCLUDED.base_paid_paise,
         net_paid_paise = EXCLUDED.net_paid_paise,
         hours_worked = EXCLUDED.hours_worked`, [cycle.id, s.id, basePaid, netPaid, s.total_hours]);
    }
    await db_1.db.query("UPDATE payroll_cycles SET status = 'completed' WHERE id = $1", [cycle.id]);
    res.json({ success: true, message: `Payroll cycle for ${month}/${year} completed.` });
}
async function getCyclePayslips(req, res) {
    const { cycle_id } = req.params;
    const result = await db_1.db.query(`SELECT p.*, s.name as staff_name, s.role as staff_role, o.name as outlet_name
     FROM payslips p
     JOIN staff s ON s.id = p.staff_id
     JOIN outlets o ON o.id = s.outlet_id
     WHERE p.cycle_id = $1`, [cycle_id]);
    res.json({ success: true, data: result.rows });
}
async function getPayrollCycles(req, res) {
    const chain_id = req.user.chain_id;
    const result = await db_1.db.query('SELECT * FROM payroll_cycles WHERE chain_id = $1 ORDER BY year DESC, month DESC', [chain_id]);
    res.json({ success: true, data: result.rows });
}
