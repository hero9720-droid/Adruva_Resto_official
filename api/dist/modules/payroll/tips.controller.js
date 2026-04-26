"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTipPoolStats = getTipPoolStats;
exports.processTipDistribution = processTipDistribution;
exports.getStaffTips = getStaffTips;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
async function getTipPoolStats(req, res) {
    const { outlet_id } = req.params;
    // 1. Get total unallocated tips from bills
    const unallocated = await db_1.db.query(`SELECT SUM(tip_amount_paise) as total 
     FROM bills 
     WHERE outlet_id = $1 AND id NOT IN (SELECT reference_id FROM tip_distributions WHERE pool_id IS NOT NULL)`, [outlet_id]);
    // 2. Get active rules
    const rules = await db_1.db.query('SELECT * FROM tip_rules WHERE outlet_id = $1', [outlet_id]);
    res.json({
        success: true,
        data: {
            unallocated_paise: unallocated.rows[0].total || 0,
            rules: rules.rows
        }
    });
}
async function processTipDistribution(req, res) {
    const { outlet_id } = req.params;
    const { start_date, end_date } = req.body;
    await db_1.db.query('BEGIN');
    try {
        // 1. Calculate total pool
        const poolRes = await db_1.db.query(`SELECT SUM(tip_amount_paise) as total 
       FROM bills 
       WHERE outlet_id = $1 AND created_at BETWEEN $2 AND $3`, [outlet_id, start_date, end_date]);
        const totalAmount = BigInt(poolRes.rows[0].total || 0);
        if (totalAmount === BigInt(0))
            throw new errors_1.AppError(400, 'No tips found for this period', 'NOT_FOUND');
        // 2. Create the pool
        const pool = await db_1.db.query(`INSERT INTO tip_pools (outlet_id, start_date, end_date, total_amount_paise, status)
       VALUES ($1, $2, $3, $4, 'processed') RETURNING *`, [outlet_id, start_date, end_date, totalAmount.toString()]);
        // 3. Simple distribution logic (equally weighted for now, enhanced by multipliers)
        const staffRes = await db_1.db.query('SELECT id, role FROM staff WHERE outlet_id = $1 AND status = \'active\'', [outlet_id]);
        const share = totalAmount / BigInt(staffRes.rowCount || 1);
        for (const staff of staffRes.rows) {
            await db_1.db.query(`INSERT INTO tip_distributions (pool_id, staff_id, amount_paise, performance_score)
         VALUES ($1, $2, $3, 1.0)`, [pool.rows[0].id, staff.id, share.toString()]);
        }
        await db_1.db.query('COMMIT');
        res.json({ success: true, data: pool.rows[0] });
    }
    catch (err) {
        await db_1.db.query('ROLLBACK');
        throw err;
    }
}
async function getStaffTips(req, res) {
    const { staff_id } = req.params;
    const result = await db_1.db.query(`SELECT td.*, tp.start_date, tp.end_date 
     FROM tip_distributions td
     JOIN tip_pools tp ON tp.id = td.pool_id
     WHERE td.staff_id = $1 
     ORDER BY td.created_at DESC`, [staff_id]);
    res.json({ success: true, data: result.rows });
}
