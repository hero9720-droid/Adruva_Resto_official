"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaxSlab = createTaxSlab;
exports.getTaxSlabs = getTaxSlabs;
exports.getTaxLiabilityReport = getTaxLiabilityReport;
const db_1 = require("../../lib/db");
async function createTaxSlab(req, res) {
    const chain_id = req.user.chain_id;
    const { name, cgst_percent, sgst_percent, igst_percent, vat_percent } = req.body;
    const result = await db_1.db.query(`INSERT INTO tax_slabs (chain_id, name, cgst_percent, sgst_percent, igst_percent, vat_percent)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [chain_id, name, cgst_percent || 0, sgst_percent || 0, igst_percent || 0, vat_percent || 0]);
    res.status(201).json({ success: true, data: result.rows[0] });
}
async function getTaxSlabs(req, res) {
    const chain_id = req.user.chain_id;
    const result = await db_1.db.query('SELECT * FROM tax_slabs WHERE chain_id = $1 ORDER BY name ASC', [chain_id]);
    res.json({ success: true, data: result.rows });
}
async function getTaxLiabilityReport(req, res) {
    const chain_id = req.user.chain_id;
    const { start_date, end_date } = req.query;
    const result = await db_1.db.query(`SELECT 
       o.name as outlet_name,
       COUNT(b.id) as total_bills,
       SUM(b.subtotal_paise) as net_sales,
       SUM(b.tax_total_paise) as total_tax,
       SUM(CAST(b.tax_split->>'cgst' AS BIGINT)) as total_cgst,
       SUM(CAST(b.tax_split->>'sgst' AS BIGINT)) as total_sgst,
       SUM(CAST(b.tax_split->>'igst' AS BIGINT)) as total_igst,
       SUM(b.total_paise) as gross_sales
     FROM bills b
     JOIN outlets o ON o.id = b.outlet_id
     WHERE o.chain_id = $1 
       AND b.created_at >= $2 
       AND b.created_at <= $3
     GROUP BY o.name
     ORDER BY o.name ASC`, [chain_id, start_date || '1970-01-01', end_date || '2099-12-31']);
    res.json({ success: true, data: result.rows });
}
