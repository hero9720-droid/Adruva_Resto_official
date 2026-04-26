"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferralStats = getReferralStats;
exports.setupReferralCode = setupReferralCode;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
async function getReferralStats(req, res) {
    const { chain_id } = req.params;
    const stats = await db_1.db.query(`SELECT 
       COUNT(id) as total_referrals,
       SUM(reward_amount_paise) as total_payouts_paise,
       (SELECT COUNT(*) FROM customers WHERE referred_by IS NOT NULL) as conversion_count
     FROM referral_conversions 
     WHERE referrer_id IN (SELECT id FROM customers WHERE chain_id = $1)`, [chain_id]);
    const topReferrers = await db_1.db.query(`SELECT c.name, c.phone, COUNT(rc.id) as friend_count
     FROM referral_conversions rc
     JOIN customers c ON c.id = rc.referrer_id
     GROUP BY c.id ORDER BY friend_count DESC LIMIT 10`);
    res.json({
        success: true,
        data: {
            summary: stats.rows[0],
            topReferrers: topReferrers.rows
        }
    });
}
async function setupReferralCode(req, res) {
    const { customer_id } = req.params;
    // Generate a friendly code: NAME+RANDOM
    const customer = await db_1.db.query('SELECT name FROM customers WHERE id = $1', [customer_id]);
    if (customer.rowCount === 0)
        throw new errors_1.AppError('Customer not found', 404);
    const prefix = customer.rows[0].name.split(' ')[0].toUpperCase().slice(0, 4);
    const code = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
    await db_1.db.query('UPDATE customers SET referral_code = $1 WHERE id = $2', [code, customer_id]);
    res.json({ success: true, code });
}
