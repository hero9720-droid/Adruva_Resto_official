"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpense = createExpense;
exports.getExpenses = getExpenses;
exports.getTaxReport = getTaxReport;
const db_1 = require("../../lib/db");
async function createExpense(req, res) {
    const outlet_id = req.user.outlet_id;
    const staff_id = req.user.staff_id;
    // DB schema: category(text), amount_paise, description, expense_date, receipt_url, submitted_by
    const { category, amount_paise, description, expense_date, receipt_url } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`INSERT INTO expenses (outlet_id, category, amount_paise, description, expense_date, receipt_url, submitted_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING *`, [outlet_id, category, amount_paise, description, expense_date || new Date().toISOString().split('T')[0], receipt_url, staff_id]);
        return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function getExpenses(req, res) {
    const outlet_id = req.user.outlet_id;
    const { status, start_date, end_date } = req.query;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const params = [outlet_id];
        let query = `
      SELECT e.*, s.name as submitted_by_name
      FROM expenses e
      LEFT JOIN staff s ON s.id = e.submitted_by
      WHERE e.outlet_id = $1
    `;
        if (status) {
            params.push(status);
            query += ` AND e.status = $${params.length}`;
        }
        if (start_date) {
            params.push(start_date);
            query += ` AND e.expense_date >= $${params.length}`;
        }
        if (end_date) {
            params.push(end_date);
            query += ` AND e.expense_date <= $${params.length}`;
        }
        query += ' ORDER BY e.expense_date DESC, e.created_at DESC';
        const r = await client.query(query, params);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
async function getTaxReport(req, res) {
    const outlet_id = req.user.outlet_id;
    const { start_date, end_date } = req.query;
    const from = start_date || '1970-01-01';
    const to = end_date || '2100-01-01';
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // GST from bills — using correct column names (gst_5_paise, gst_12_paise, gst_18_paise)
        const taxRes = await client.query(`
      SELECT 
        COALESCE(SUM(gst_5_paise + gst_12_paise + gst_18_paise), 0)::int AS total_tax,
        COALESCE(SUM(total_paise), 0)::int AS total_revenue,
        COALESCE(SUM(gst_5_paise), 0)::int  AS gst_5,
        COALESCE(SUM(gst_12_paise), 0)::int AS gst_12,
        COALESCE(SUM(gst_18_paise), 0)::int AS gst_18
      FROM bills
      WHERE outlet_id = $1 AND status = 'paid'
        AND created_at::date BETWEEN $2 AND $3
    `, [outlet_id, from, to]);
        const row = taxRes.rows[0];
        const sgst = Math.floor(row.total_tax / 2);
        const cgst = row.total_tax - sgst;
        return {
            total_revenue: row.total_revenue,
            total_tax: row.total_tax,
            gst_5: row.gst_5,
            gst_12: row.gst_12,
            gst_18: row.gst_18,
            sgst,
            cgst,
            period: { start: from, end: to },
        };
    });
    res.json({ success: true, data: result });
}
