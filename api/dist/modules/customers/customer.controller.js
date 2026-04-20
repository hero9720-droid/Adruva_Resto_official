"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomers = getCustomers;
exports.createOrUpdateCustomer = createOrUpdateCustomer;
exports.getCustomerByPhone = getCustomerByPhone;
exports.earnLoyaltyPoints = earnLoyaltyPoints;
exports.getCustomerHistory = getCustomerHistory;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
const db_2 = require("../../lib/db");
// DB schema: id, chain_id, name, phone, email, loyalty_points, lifetime_spend_paise, visit_count, last_visit_at, notes
// customers is chain-wide, NOT outlet-scoped
async function getCustomers(req, res) {
    const chain_id = req.user.chain_id;
    const { search, limit = '50', offset = '0' } = req.query;
    let query = `
    SELECT id, name, phone, email, loyalty_points, lifetime_spend_paise, visit_count, last_visit_at, notes
    FROM customers
    WHERE chain_id = $1
  `;
    const params = [chain_id];
    if (search) {
        params.push(`%${search}%`);
        query += ` AND (name ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }
    query += ` ORDER BY visit_count DESC, last_visit_at DESC NULLS LAST LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    const result = await db_2.db.query(query, params);
    res.json({ success: true, data: result.rows });
}
async function createOrUpdateCustomer(req, res) {
    const chain_id = req.user.chain_id;
    // DB columns: name, phone, email, notes
    const { name, phone, email, notes } = req.body;
    // Upsert by phone within chain
    const result = await db_2.db.query(`INSERT INTO customers (chain_id, name, phone, email, notes, loyalty_points, visit_count)
     VALUES ($1, $2, $3, $4, $5, 0, 0)
     ON CONFLICT (chain_id, phone) DO UPDATE
       SET name  = EXCLUDED.name,
           email = EXCLUDED.email,
           notes = EXCLUDED.notes,
           updated_at = NOW()
     RETURNING *`, [chain_id, name, phone, email, notes]);
    res.status(200).json({ success: true, data: result.rows[0] });
}
async function getCustomerByPhone(req, res) {
    const chain_id = req.user.chain_id;
    const { phone } = req.params;
    const result = await db_2.db.query('SELECT * FROM customers WHERE chain_id = $1 AND phone = $2', [chain_id, phone]);
    res.json({ success: true, data: result.rows[0] || null });
}
async function earnLoyaltyPoints(req, res) {
    const outlet_id = req.user.outlet_id;
    const chain_id = req.user.chain_id;
    const { customer_id, bill_id } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const billRes = await client.query('SELECT total_paise FROM bills WHERE id = $1', [bill_id]);
        if ((billRes.rowCount ?? 0) === 0)
            throw new errors_1.AppError(404, 'Bill not found', 'NOT_FOUND');
        // 1 point per ₹100 spent (10000 paise)
        const points = Math.floor(billRes.rows[0].total_paise / 10000);
        if (points > 0) {
            // Update customer points (chain-level)
            await db_2.db.query(`UPDATE customers
         SET loyalty_points = loyalty_points + $1,
             lifetime_spend_paise = lifetime_spend_paise + $2,
             visit_count = visit_count + 1,
             last_visit_at = NOW(),
             updated_at = NOW()
         WHERE id = $3`, [points, billRes.rows[0].total_paise, customer_id]);
            // Record in loyalty_transactions
            await client.query(`INSERT INTO loyalty_transactions (customer_id, chain_id, outlet_id, bill_id, type, points)
         VALUES ($1, $2, $3, $4, 'earn', $5)`, [customer_id, chain_id, outlet_id, bill_id, points]);
        }
        return { points_earned: points };
    });
    res.json({ success: true, data: result });
}
async function getCustomerHistory(req, res) {
    const { id } = req.params;
    const chain_id = req.user.chain_id;
    const customer = await db_2.db.query('SELECT * FROM customers WHERE id = $1 AND chain_id = $2', [id, chain_id]);
    if ((customer.rowCount ?? 0) === 0)
        throw new errors_1.AppError(404, 'Customer not found', 'NOT_FOUND');
    const transactions = await db_2.db.query(`SELECT lt.*, o.name as outlet_name
     FROM loyalty_transactions lt
     LEFT JOIN outlets o ON o.id = lt.outlet_id
     WHERE lt.customer_id = $1
     ORDER BY lt.created_at DESC
     LIMIT 50`, [id]);
    res.json({
        success: true,
        data: {
            customer: customer.rows[0],
            transactions: transactions.rows,
        }
    });
}
