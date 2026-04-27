"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaxSummary = getTaxSummary;
exports.getHSNReport = getHSNReport;
exports.updateHSNCodes = updateHSNCodes;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
async function getTaxSummary(req, res) {
    const { outlet_id } = req.params;
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date)
        throw new errors_1.AppError(400, 'Start and End dates are required', 'VALIDATION_ERROR');
    const result = await db_1.db.query(`
    SELECT 
      COALESCE(SUM(tax_total_paise), 0) as tax_collected,
      json_build_object(
        'cgst', SUM((tax_split->>'cgst')::bigint),
        'sgst', SUM((tax_split->>'sgst')::bigint),
        'igst', SUM((tax_split->>'igst')::bigint),
        'vat',  SUM((tax_split->>'vat')::bigint)
      ) as output_gst_split,
      (SELECT COALESCE(SUM(tax_paise), 0) FROM expenses WHERE outlet_id = $1 AND expense_date BETWEEN $2 AND $3 AND is_itc_eligible = true) as input_tax_credit
    FROM bills
    WHERE outlet_id = $1 AND created_at BETWEEN $2 AND $3 AND status = 'paid'
  `, [outlet_id, start_date, end_date]);
    res.json({ success: true, data: result.rows[0] });
}
async function getHSNReport(req, res) {
    const { outlet_id } = req.params;
    const result = await db_1.db.query(`
    SELECT mi.hsn_code, mi.name as item_name, SUM(oi.quantity) as total_qty, SUM(oi.total_paise) as total_value
    FROM order_items oi
    JOIN menu_items mi ON mi.id = oi.menu_item_id
    JOIN bills b ON b.order_id = oi.order_id
    WHERE b.outlet_id = $1 AND b.status = 'paid'
    GROUP BY mi.hsn_code, mi.name
    ORDER BY total_value DESC
  `, [outlet_id]);
    res.json({ success: true, data: result.rows });
}
async function updateHSNCodes(req, res) {
    const { outlet_id } = req.params;
    const { mappings } = req.body; // Array of { item_id, hsn_code }
    if (!Array.isArray(mappings))
        throw new errors_1.AppError(400, 'Invalid mappings', 'VALIDATION_ERROR');
    for (const m of mappings) {
        await db_1.db.query('UPDATE menu_items SET hsn_code = $1 WHERE id = $2 AND outlet_id = $3', [m.hsn_code, m.item_id, outlet_id]);
    }
    res.json({ success: true, message: 'HSN codes updated successfully' });
}
