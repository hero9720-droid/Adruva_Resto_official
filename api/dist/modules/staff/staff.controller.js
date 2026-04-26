"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaff = getStaff;
exports.createStaff = createStaff;
exports.clockIn = clockIn;
exports.clockOut = clockOut;
exports.getAttendance = getAttendance;
exports.getSchedule = getSchedule;
exports.startShift = startShift;
exports.endShift = endShift;
exports.getPayrollSummary = getPayrollSummary;
exports.getAttendanceStatus = getAttendanceStatus;
exports.getShiftSummary = getShiftSummary;
exports.getStaffPerformanceMetrics = getStaffPerformanceMetrics;
exports.verifyShift = verifyShift;
exports.getShiftsToVerify = getShiftsToVerify;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
const audit_1 = require("../../lib/audit");
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
// --- CREATE STAFF ---
async function createStaff(req, res) {
    const outlet_id = req.user.outlet_id;
    const { name, role, pin, base_pay_paise } = req.body;
    if (!name || !role)
        throw new errors_1.AppError(400, 'Name and role are required', 'VALIDATION_ERROR');
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`INSERT INTO staff (outlet_id, name, role, pin, base_pay_paise, is_active)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id, name, role, is_active, created_at`, [outlet_id, name, role, pin || null, base_pay_paise || 0]);
        return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
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
    const outlet_id = req.user.outlet_id;
    const staff_id = req.user.staff_id;
    const { opening_cash_paise = 0, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // Check if already in an active shift
        const check = await client.query(`SELECT id FROM attendance WHERE staff_id = $1 AND clock_out IS NULL`, [staff_id]);
        if ((check.rowCount ?? 0) > 0)
            throw new errors_1.AppError(400, 'Shift already active', 'SHIFT_ACTIVE');
        const r = await client.query(`INSERT INTO attendance (outlet_id, staff_id, date, clock_in, opening_cash_paise, notes)
       VALUES ($1, $2, $3, NOW(), $4, $5) RETURNING *`, [outlet_id, staff_id, today, opening_cash_paise, notes]);
        // Audit Log
        await (0, audit_1.logAudit)({
            outlet_id,
            actor_id: staff_id,
            actor_name: req.user.name || 'Staff',
            actor_type: 'staff',
            action: 'SHIFT_START',
            resource_type: 'shift',
            resource_id: r.rows[0].id,
            new_value: { opening_cash_paise, notes },
            ip_address: req.ip,
            user_agent: req.get('user-agent')
        }, client);
        return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function endShift(req, res) {
    const outlet_id = req.user.outlet_id;
    const staff_id = req.user.staff_id;
    const { closing_cash_paise = 0, notes } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // 1. Get active shift info
        const shiftRes = await client.query(`SELECT id, clock_in, opening_cash_paise FROM attendance 
       WHERE staff_id = $1 AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1`, [staff_id]);
        if ((shiftRes.rowCount ?? 0) === 0)
            throw new errors_1.AppError(400, 'No active shift found', 'NO_ACTIVE_SHIFT');
        const shift = shiftRes.rows[0];
        // 2. Calculate expected cash: Opening Cash + Cash Payments recorded since clock_in
        const cashSalesRes = await client.query(`SELECT COALESCE(SUM(amount_paise), 0)::bigint as total 
       FROM payment_transactions 
       WHERE outlet_id = $1 AND method = 'cash' AND created_at >= $2 AND status = 'captured'`, [outlet_id, shift.clock_in]);
        const cashSales = Number(cashSalesRes.rows[0].total);
        const expectedCash = Number(shift.opening_cash_paise) + cashSales;
        // 3. Close the shift
        const r = await client.query(`UPDATE attendance
       SET clock_out = NOW(),
           hours_worked = EXTRACT(EPOCH FROM (NOW() - clock_in)) / 3600,
           closing_cash_paise = $1,
           expected_cash_paise = $2,
           actual_cash_paise = $1,
           notes = COALESCE($3, notes)
       WHERE id = $4
       RETURNING *`, [closing_cash_paise, expectedCash, notes, shift.id]);
        // Audit Log
        await (0, audit_1.logAudit)({
            outlet_id,
            actor_id: staff_id,
            actor_name: req.user.name || 'Staff',
            actor_type: 'staff',
            action: 'SHIFT_END',
            resource_type: 'shift',
            resource_id: shift.id,
            new_value: { closing_cash_paise, expected_cash_paise: expectedCash, notes },
            ip_address: req.ip,
            user_agent: req.get('user-agent')
        }, client);
        return r.rows[0];
    });
    res.json({ success: true, data: result });
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
       GROUP BY s.id, pg.id, pg.name, pg.salary_type, pg.rate_paise
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
async function getAttendanceStatus(req, res) {
    const outlet_id = req.user.outlet_id;
    const staff_id = req.user.staff_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const clockCheck = await client.query(`SELECT id FROM attendance WHERE staff_id = $1 AND clock_out IS NULL`, [staff_id]);
        return {
            isClockedIn: (clockCheck.rowCount ?? 0) > 0,
            isShiftActive: (clockCheck.rowCount ?? 0) > 0,
            staff: {
                name: req.user.name,
                role: req.user.role
            }
        };
    });
    res.json({ success: true, data: result });
}
async function getShiftSummary(req, res) {
    const outlet_id = req.user.outlet_id;
    const staff_id = req.user.staff_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // 1. Find active shift
        const shiftRes = await client.query(`SELECT clock_in, opening_cash_paise FROM attendance 
       WHERE staff_id = $1 AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1`, [staff_id]);
        if ((shiftRes.rowCount ?? 0) === 0) {
            return { total_sales_paise: 0, total_orders: 0, cash_in_hand_paise: 0 };
        }
        const startTime = shiftRes.rows[0].clock_in;
        const openingCash = Number(shiftRes.rows[0].opening_cash_paise);
        // 2. Aggregate sales since startTime
        const salesRes = await client.query(`SELECT 
         COALESCE(SUM(total_paise), 0)::bigint as total_sales,
         COUNT(id)::int as total_orders
       FROM bills
       WHERE outlet_id = $1 AND created_at >= $2`, [outlet_id, startTime]);
        const cashRes = await client.query(`SELECT COALESCE(SUM(amount_paise), 0)::bigint as total_cash
       FROM payment_transactions
       WHERE outlet_id = $1 AND method = 'cash' AND created_at >= $2 AND status = 'captured'`, [outlet_id, startTime]);
        return {
            total_sales_paise: Number(salesRes.rows[0].total_sales),
            total_orders: Number(salesRes.rows[0].total_orders),
            cash_in_hand_paise: openingCash + Number(cashRes.rows[0].total_cash)
        };
    });
    res.json({ success: true, data: result });
}
async function getStaffPerformanceMetrics(req, res) {
    const outlet_id = req.user.outlet_id;
    const { period = '30 days' } = req.query;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // 1. Chef Performance (Avg Prep Time)
        // We assume order_items has updated_at when status becomes 'ready'
        // For now, we compare created_at of order vs updated_at of ready items
        const chefMetrics = await client.query(`
      SELECT 
        s.name,
        COUNT(oi.id)::int as items_prepared,
        AVG(EXTRACT(EPOCH FROM (oi.updated_at - oi.created_at))/60)::float as avg_prep_time_mins
      FROM staff s
      JOIN order_items oi ON oi.status = 'ready' -- we need to know who prepared it, but for now we look at station
      JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE s.outlet_id = $1 AND s.role IN ('chef', 'kitchen')
        AND oi.updated_at >= NOW() - INTERVAL '30 days'
      GROUP BY s.id, s.name
      ORDER BY avg_prep_time_mins ASC
    `, [outlet_id]);
        // 2. Waiter/Cashier Performance (Bills Handled)
        const serviceMetrics = await client.query(`
      SELECT 
        s.name,
        COUNT(b.id)::int as bills_handled,
        SUM(b.total_paise)::bigint as total_revenue_paise,
        AVG(b.total_paise)::float as avg_bill_value_paise
      FROM staff s
      JOIN bills b ON b.status = 'paid' -- created_by should be staff_id
      WHERE s.outlet_id = $1 AND s.role IN ('waiter', 'cashier', 'outlet_manager')
        AND b.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY s.id, s.name
      ORDER BY bills_handled DESC
    `, [outlet_id]);
        return {
            chefs: chefMetrics.rows,
            service: serviceMetrics.rows
        };
    });
    res.json({ success: true, data: result });
}
async function verifyShift(req, res) {
    const outlet_id = req.user.outlet_id;
    const manager_id = req.user.staff_id;
    const { shift_id, manager_notes } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`UPDATE attendance
       SET is_verified = true,
           manager_id = $1,
           manager_notes = $2,
           updated_at = NOW()
       WHERE id = $3 AND outlet_id = $4
       RETURNING *`, [manager_id, manager_notes, shift_id, outlet_id]);
        if ((r.rowCount ?? 0) === 0)
            throw new errors_1.AppError(404, 'Shift not found', 'NOT_FOUND');
        // Audit Log
        await (0, audit_1.logAudit)({
            outlet_id,
            actor_id: manager_id,
            actor_name: req.user.name || 'Manager',
            actor_type: 'staff',
            action: 'SHIFT_VERIFY',
            resource_type: 'shift',
            resource_id: shift_id,
            new_value: { manager_notes },
            ip_address: req.ip,
            user_agent: req.get('user-agent')
        }, client);
        return r.rows[0];
    });
    res.json({ success: true, data: result });
}
async function getShiftsToVerify(req, res) {
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`SELECT a.*, s.name as staff_name,
        (a.closing_cash_paise - a.expected_cash_paise) as discrepancy_paise
       FROM attendance a
       JOIN staff s ON s.id = a.staff_id
       WHERE a.outlet_id = $1 AND a.clock_out IS NOT NULL AND a.is_verified = false
       ORDER BY a.clock_out DESC`, [outlet_id]);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
