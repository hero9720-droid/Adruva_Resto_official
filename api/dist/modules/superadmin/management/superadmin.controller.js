"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalMetrics = getGlobalMetrics;
exports.getSystemHealth = getSystemHealth;
exports.listAllChains = listAllChains;
exports.onboardChain = onboardChain;
exports.listPlans = listPlans;
exports.createPlan = createPlan;
exports.suspendChain = suspendChain;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../../../lib/db");
const redis_1 = require("../../../lib/redis");
async function getGlobalMetrics(req, res) {
    // SuperAdmin has no outlet_id restriction — full platform view
    const [chainsCount, outletsCount, customersCount, revenueRes, subscriptions] = await Promise.all([
        db_1.db.query('SELECT COUNT(*)::int AS count FROM chains'),
        db_1.db.query('SELECT COUNT(*)::int AS count FROM outlets'),
        db_1.db.query('SELECT COUNT(*)::int AS count FROM customers'),
        db_1.db.query(`
      SELECT COALESCE(SUM(amount_paise), 0)::bigint AS total_revenue 
      FROM subscription_payments 
      WHERE status = 'paid'
    `),
        db_1.db.query(`
      SELECT 
        p.name AS plan_name,
        COUNT(s.id)::int AS count
      FROM subscriptions s
      JOIN plans p ON p.id = s.plan_id
      WHERE s.status = 'active'
      GROUP BY p.name
      ORDER BY count DESC
    `),
    ]);
    res.json({
        success: true,
        data: {
            chains: chainsCount.rows[0].count,
            outlets: outletsCount.rows[0].count,
            customers: customersCount.rows[0].count,
            totalRevenue: Number(revenueRes.rows[0].total_revenue),
            subscriptions: subscriptions.rows,
        }
    });
}
async function getSystemHealth(req, res) {
    let dbStatus = 'ok';
    let redisStatus = 'ok';
    try {
        await db_1.db.query('SELECT 1');
    }
    catch {
        dbStatus = 'error';
    }
    try {
        await redis_1.redis.ping();
    }
    catch {
        redisStatus = 'error';
    }
    res.json({
        success: true,
        data: {
            api: 'ok',
            database: dbStatus,
            redis: redisStatus,
            uptime: Math.round(process.uptime()),
            memory: process.memoryUsage(),
        }
    });
}
async function listAllChains(req, res) {
    const result = await db_1.db.query(`
    SELECT 
      c.*,
      (SELECT COUNT(*)::int FROM outlets WHERE chain_id = c.id) AS outlet_count,
      (SELECT s.status FROM subscriptions s 
       WHERE s.outlet_id IN (SELECT id FROM outlets WHERE chain_id = c.id) 
       ORDER BY s.created_at DESC LIMIT 1) AS sub_status
    FROM chains c
    ORDER BY c.created_at DESC
  `);
    res.json({ success: true, data: result.rows });
}
async function onboardChain(req, res) {
    const { chain_name, outlet_name, plan_id, admin_name, admin_email, admin_password } = req.body;
    const client = await db_1.db.connect();
    try {
        await client.query('BEGIN');
        // 1. Create Chain
        const chainRes = await client.query(`INSERT INTO chains (name, owner_name, owner_email, plan_id, status) 
       VALUES ($1, $2, $3, $4, 'trial') RETURNING id`, [chain_name, admin_name, admin_email, plan_id]);
        const chainId = chainRes.rows[0].id;
        // 2. Create Initial Outlet
        const outletRes = await client.query(`INSERT INTO outlets (chain_id, name, plan_id, subscription_status) 
       VALUES ($1, $2, $3, 'active') RETURNING id`, [chainId, outlet_name, plan_id]);
        const outletId = outletRes.rows[0].id;
        // 3. Create Chain Owner Login (chain_users)
        const hashedPassword = await bcrypt_1.default.hash(admin_password, 12);
        await client.query(`INSERT INTO chain_users (chain_id, name, email, password_hash, role, is_active) 
       VALUES ($1, $2, $3, $4, 'chain_owner', true)`, [chainId, admin_name, admin_email, hashedPassword]);
        // 4. Create Outlet Admin (Staff) so they can also log into outlet-app
        await client.query(`INSERT INTO staff (outlet_id, name, email, role, password_hash, is_active) 
       VALUES ($1, $2, $3, 'outlet_manager', $4, true)`, [outletId, admin_name, admin_email, hashedPassword]);
        // 4. Initialize Subscription record
        await client.query(`INSERT INTO subscriptions (outlet_id, plan_id, status, current_period_start, current_period_end) 
       VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '30 days')`, [outletId, plan_id]);
        await client.query('COMMIT');
        res.status(201).json({ success: true, data: { chain_id: chainId, outlet_id: outletId } });
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
async function listPlans(req, res) {
    const result = await db_1.db.query('SELECT * FROM plans WHERE is_archived = false ORDER BY monthly_price_paise ASC');
    res.json({ success: true, data: result.rows });
}
async function createPlan(req, res) {
    const { name, monthly_price_paise, annual_price_paise, max_tables, max_staff, max_menu_items, max_orders_per_month, features } = req.body;
    const result = await db_1.db.query(`INSERT INTO plans (
      name, monthly_price_paise, annual_price_paise, 
      max_tables, max_staff, max_menu_items, max_orders_per_month, features
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [
        name, monthly_price_paise, annual_price_paise,
        max_tables, max_staff, max_menu_items, max_orders_per_month, JSON.stringify(features || {})
    ]);
    res.status(201).json({ success: true, data: result.rows[0] });
}
async function suspendChain(req, res) {
    const { id } = req.params;
    // outlets table uses is_active (boolean) and subscription_status (text)
    await db_1.db.query(`UPDATE outlets SET is_active = false, subscription_status = 'suspended' WHERE chain_id = $1`, [id]);
    // subscriptions table has status column
    await db_1.db.query(`UPDATE subscriptions SET status = 'suspended' WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)`, [id]);
    res.json({ success: true, message: 'Chain suspended' });
}
