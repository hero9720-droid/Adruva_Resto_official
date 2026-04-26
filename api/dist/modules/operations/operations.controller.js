"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShiftLog = createShiftLog;
exports.getShiftLogs = getShiftLogs;
exports.getHandoverData = getHandoverData;
exports.getHandoverPreview = getHandoverPreview;
const db_1 = require("../../lib/db");
async function createShiftLog(req, res) {
    const { outlet_id } = req.params;
    const staff_id = req.user.staff_id || req.user.id;
    const { shift_type, closing_cash_paise, summary, incidents, checklist_items } = req.body;
    // Find the last completed shift to establish the timeframe
    const lastShiftRes = await db_1.db.query(`SELECT closing_cash_paise, created_at 
     FROM shift_logs 
     WHERE outlet_id = $1 AND status = 'completed'
     ORDER BY created_at DESC LIMIT 1`, [outlet_id]);
    let startTime = new Date(0).toISOString();
    let opening_cash_paise = 0;
    if (lastShiftRes.rowCount && lastShiftRes.rowCount > 0) {
        startTime = lastShiftRes.rows[0].created_at;
        opening_cash_paise = Number(lastShiftRes.rows[0].closing_cash_paise);
    }
    // Calculate cash transactions since last shift
    const txRes = await db_1.db.query(`SELECT COALESCE(SUM(amount_paise), 0)::bigint as total 
     FROM payment_transactions 
     WHERE outlet_id = $1 
       AND status = 'captured' 
       AND method = 'cash'
       AND created_at > $2`, [outlet_id, startTime]);
    const cash_sales = Number(txRes.rows[0].total);
    const expected_cash = opening_cash_paise + cash_sales;
    const cash_difference = Number(closing_cash_paise) - expected_cash;
    const result = await db_1.db.query(`INSERT INTO shift_logs (
       outlet_id, manager_id, shift_type, opening_cash_paise, 
       closing_cash_paise, cash_difference_paise, summary, incidents, checklist_items, status
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'completed') RETURNING *`, [
        outlet_id, staff_id, shift_type, opening_cash_paise,
        closing_cash_paise || 0, cash_difference, summary,
        JSON.stringify(incidents || []), JSON.stringify(checklist_items || [])
    ]);
    res.status(201).json({ success: true, data: result.rows[0] });
}
async function getShiftLogs(req, res) {
    const { outlet_id } = req.params;
    const result = await db_1.db.query(`SELECT sl.*, s.name as manager_name 
     FROM shift_logs sl
     JOIN staff s ON s.id = sl.manager_id
     WHERE sl.outlet_id = $1 
     ORDER BY sl.created_at DESC LIMIT 50`, [outlet_id]);
    res.json({ success: true, data: result.rows });
}
async function getHandoverData(req, res) {
    const { outlet_id } = req.params;
    // Get the most recent completed shift log
    const result = await db_1.db.query(`SELECT sl.*, s.name as manager_name 
     FROM shift_logs sl
     JOIN staff s ON s.id = sl.manager_id
     WHERE sl.outlet_id = $1 AND sl.status = 'completed'
     ORDER BY sl.created_at DESC LIMIT 1`, [outlet_id]);
    res.json({ success: true, data: result.rows[0] || null });
}
async function getHandoverPreview(req, res) {
    const { outlet_id } = req.params;
    // Find the last completed shift to establish the timeframe
    const lastShiftRes = await db_1.db.query(`SELECT closing_cash_paise, created_at 
     FROM shift_logs 
     WHERE outlet_id = $1 AND status = 'completed'
     ORDER BY created_at DESC LIMIT 1`, [outlet_id]);
    let startTime = new Date(0).toISOString(); // Default to beginning of time
    let opening_cash_paise = 0;
    if (lastShiftRes.rowCount && lastShiftRes.rowCount > 0) {
        startTime = lastShiftRes.rows[0].created_at;
        opening_cash_paise = Number(lastShiftRes.rows[0].closing_cash_paise);
    }
    // Calculate transaction totals since the last shift
    const txRes = await db_1.db.query(`SELECT 
       method, 
       COALESCE(SUM(amount_paise), 0)::bigint as total 
     FROM payment_transactions 
     WHERE outlet_id = $1 
       AND status = 'captured' 
       AND created_at > $2
     GROUP BY method`, [outlet_id, startTime]);
    let cash_sales = 0;
    let upi_sales = 0;
    let card_sales = 0;
    for (const row of txRes.rows) {
        if (row.method === 'cash')
            cash_sales += Number(row.total);
        if (row.method === 'upi')
            upi_sales += Number(row.total);
        if (row.method === 'card')
            card_sales += Number(row.total);
    }
    const expected_cash_paise = opening_cash_paise + cash_sales;
    res.json({
        success: true,
        data: {
            last_shift_time: startTime,
            opening_cash_paise,
            sales: {
                cash_sales,
                upi_sales,
                card_sales
            },
            expected_cash_paise
        }
    });
}
