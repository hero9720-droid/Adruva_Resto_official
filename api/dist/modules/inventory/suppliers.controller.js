"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuppliers = getSuppliers;
exports.getSupplierLedger = getSupplierLedger;
exports.recordVendorPayment = recordVendorPayment;
exports.getBulkVendorDues = getBulkVendorDues;
const db_1 = require("../../lib/db");
async function getSuppliers(req, res) {
    const { chain_id } = req.params;
    const result = await db_1.db.query('SELECT * FROM suppliers WHERE chain_id = $1 ORDER BY name ASC', [chain_id]);
    res.json({ success: true, data: result.rows });
}
async function getSupplierLedger(req, res) {
    const { supplier_id } = req.params;
    const result = await db_1.db.query(`SELECT sl.*, o.name as outlet_name 
     FROM supplier_ledgers sl
     LEFT JOIN outlets o ON o.id = sl.outlet_id
     WHERE sl.supplier_id = $1 
     ORDER BY sl.created_at DESC LIMIT 100`, [supplier_id]);
    res.json({ success: true, data: result.rows });
}
async function recordVendorPayment(req, res) {
    const { supplier_id } = req.params;
    const { amount_paise, description, outlet_id } = req.body;
    await db_1.db.query('BEGIN');
    try {
        // 1. Get current balance
        const lastEntry = await db_1.db.query('SELECT balance_after_paise FROM supplier_ledgers WHERE supplier_id = $1 ORDER BY created_at DESC LIMIT 1', [supplier_id]);
        const currentBalance = lastEntry.rowCount > 0 ? BigInt(lastEntry.rows[0].balance_after_paise) : BigInt(0);
        const newBalance = currentBalance - BigInt(amount_paise);
        // 2. Record DEBIT (Payment)
        const result = await db_1.db.query(`INSERT INTO supplier_ledgers (supplier_id, outlet_id, type, amount_paise, description, balance_after_paise)
       VALUES ($1, $2, 'DEBIT', $3, $4, $5) RETURNING *`, [supplier_id, outlet_id, amount_paise, description, newBalance.toString()]);
        await db_1.db.query('COMMIT');
        res.json({ success: true, data: result.rows[0] });
    }
    catch (err) {
        await db_1.db.query('ROLLBACK');
        throw err;
    }
}
async function getBulkVendorDues(req, res) {
    const { chain_id } = req.params;
    const result = await db_1.db.query(`SELECT s.id, s.name, 
       (SELECT balance_after_paise FROM supplier_ledgers WHERE supplier_id = s.id ORDER BY created_at DESC LIMIT 1) as outstanding_balance_paise
     FROM suppliers s
     WHERE s.chain_id = $1`, [chain_id]);
    res.json({ success: true, data: result.rows });
}
