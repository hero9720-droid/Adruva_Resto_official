"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaff = getStaff;
exports.clockIn = clockIn;
exports.clockOut = clockOut;
exports.getAttendance = getAttendance;
exports.getSchedule = getSchedule;
exports.startShift = startShift;
exports.endShift = endShift;
exports.getPayrollSummary = getPayrollSummary;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
// --- STAFF LIST ---
async function getStaff(req, res) {
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`SELECT id, name, email, phone, role, is_active, created_at
       FROM staff
       WHERE outlet_id = $1
       ORDER BY role ASC, name ASC`, [outlet_id]);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
// --- ATTENDANCE (clock_in/clock_out per day) ---
async function clockIn(req, res) {
    const outlet_id = req.user.outlet_id;
    const staff_id = req.user.staff_id;
    const today = new Date().toISOString().split('T')[0];
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // Check if already clocked in today
        const check = await client.query(`SELECT id FROM attendance WHERE staff_id = $1 AND date = $2 AND clock_out IS NULL`, [staff_id, today]);
        if ((check.rowCount ?? 0) > 0)
            throw new errors_1.AppError(400, 'Already clocked in today', 'ALREADY_CLOCKED_IN');
        const r = await client.query(`INSERT INTO attendance (outlet_id, staff_id, date, clock_in)
       VALUES ($1, $2, $3, NOW()) RETURNING *`, [outlet_id, staff_id, today]);
        return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function clockOut(req, res) {
    const outlet_id = req.user.outlet_id;
    const staff_id = req.user.staff_id;
    const today = new Date().toISOString().split('T')[0];
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`UPDATE attendance
       SET clock_out = NOW(),
           hours_worked = EXTRACT(EPOCH FROM (NOW() - clock_in)) / 3600
       WHERE staff_id = $1 AND date = $2 AND clock_out IS NULL
       RETURNING *`, [staff_id, today]);
        if ((r.rowCount ?? 0) === 0)
            throw new errors_1.AppError(400, 'Not clocked in', 'NOT_CLOCKED_IN');
        return r.rows[0];
    });
    res.json({ success: true, data: result });
}
async function getAttendance(req, res) {
    const outlet_id = req.user.outlet_id;
    const { date, staff_id: filterStaff } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const params = [outlet_id, targetDate];
        let query = `
      SELECT a.*, s.name as staff_name, s.role
      FROM attendance a
      JOIN staff s ON s.id = a.staff_id
      WHERE a.outlet_id = $1 AND a.date = $2
    `;
        if (filterStaff) {
            params.push(filterStaff);
            query += ` AND a.staff_id = $${params.length}`;
        }
        query += ' ORDER BY a.clock_in ASC NULLS LAST';
        const r = await client.query(query, params);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
// --- SCHEDULE (shifts = weekly schedule) ---
async function getSchedule(req, res) {
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`SELECT sh.*, s.name as staff_name, s.role
       FROM shifts sh
       JOIN staff s ON s.id = sh.staff_id
       WHERE s.outlet_id = $1
       ORDER BY sh.day_of_week ASC, sh.start_time ASC`, [outlet_id]);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
async function startShift(req, res) {
    // For POS shift start — just record clock-in
    return clockIn(req, res);
}
async function endShift(req, res) {
    // For POS shift end — just record clock-out
    return clockOut(req, res);
}
async function getPayrollSummary(req, res) {
    const outlet_id = req.user.outlet_id;
    const { month } = req.query; // format: 'YYYY-MM'
    const targetMonth = month || new Date().toISOString().substring(0, 7);
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`SELECT 
         s.id, 
         s.name, 
         s.role, 
         pg.name as grade_name,
         pg.salary_type,
         pg.rate_paise,
         COALESCE(SUM(a.hours_worked), 0)::float as total_hours,
         COALESCE(SUM(adv.amount_paise), 0)::int as total_advances
       FROM staff s
       LEFT JOIN pay_grades pg ON pg.id = s.pay_grade_id
       LEFT JOIN attendance a ON a.staff_id = s.id AND TO_CHAR(a.date, 'YYYY-MM') = $2
       LEFT JOIN salary_advances adv ON adv.staff_id = s.id AND adv.deduct_month = $2 AND adv.is_deducted = false
       WHERE s.outlet_id = $1
       GROUP BY s.id, pg.id
       ORDER BY s.name ASC`, [outlet_id, targetMonth]);
        // Calculate final estimated payout
        return r.rows.map(row => {
            let estimated_salary_paise = 0;
            if (row.salary_type === 'monthly') {
                estimated_salary_paise = row.rate_paise;
            }
            else if (row.salary_type === 'hourly') {
                estimated_salary_paise = Math.round(row.total_hours * row.rate_paise);
            }
            else if (row.salary_type === 'daily') {
                // Approximate days from hours (8h shift)
                estimated_salary_paise = Math.round((row.total_hours / 8) * row.rate_paise);
            }
            return {
                ...row,
                estimated_payout_paise: estimated_salary_paise - row.total_advances
            };
        });
    });
    res.json({ success: true, data: result });
}
