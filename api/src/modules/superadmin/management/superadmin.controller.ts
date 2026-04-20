import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../../../lib/db';
import { redis } from '../../../lib/redis';
import { AppError } from '../../../lib/errors';

export async function getGlobalMetrics(req: Request, res: Response) {
  // SuperAdmin has no outlet_id restriction — full platform view
  const [chainsCount, outletsCount, customersCount, revenueRes, subscriptions] = await Promise.all([
    db.query('SELECT COUNT(*)::int AS count FROM chains'),
    db.query('SELECT COUNT(*)::int AS count FROM outlets'),
    db.query('SELECT COUNT(*)::int AS count FROM customers'),
    db.query(`
      SELECT COALESCE(SUM(amount_paise), 0)::bigint AS total_revenue 
      FROM subscription_payments 
      WHERE status = 'paid'
    `),
    db.query(`
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

export async function getSystemHealth(req: Request, res: Response) {
  let dbStatus = 'ok';
  let redisStatus = 'ok';
  
  try { await db.query('SELECT 1'); } catch { dbStatus = 'error'; }
  try { await redis.ping(); } catch { redisStatus = 'error'; }

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

export async function listAllChains(req: Request, res: Response) {
  const result = await db.query(`
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

export async function onboardChain(req: Request, res: Response) {
  const { 
    chain_name, outlet_name, plan_id, 
    admin_name, admin_email, admin_password 
  } = req.body;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Create Chain
    const chainRes = await client.query(
      `INSERT INTO chains (name, owner_name, owner_email, plan_id, status) 
       VALUES ($1, $2, $3, $4, 'trial') RETURNING id`,
      [chain_name, admin_name, admin_email, plan_id]
    );
    const chainId = chainRes.rows[0].id;

    // 2. Create Initial Outlet
    const outletRes = await client.query(
      `INSERT INTO outlets (chain_id, name, plan_id, subscription_status) 
       VALUES ($1, $2, $3, 'active') RETURNING id`,
      [chainId, outlet_name, plan_id]
    );
    const outletId = outletRes.rows[0].id;

    // 3. Create Chain Owner Login (chain_users)
    const hashedPassword = await bcrypt.hash(admin_password, 12);
    await client.query(
      `INSERT INTO chain_users (chain_id, name, email, password_hash, role, is_active) 
       VALUES ($1, $2, $3, $4, 'chain_owner', true)`,
      [chainId, admin_name, admin_email, hashedPassword]
    );

    // 4. Create Outlet Admin (Staff) so they can also log into outlet-app
    await client.query(
      `INSERT INTO staff (outlet_id, name, email, role, password_hash, is_active) 
       VALUES ($1, $2, $3, 'outlet_manager', $4, true)`,
      [outletId, admin_name, admin_email, hashedPassword]
    );

    // 4. Initialize Subscription record
    await client.query(
      `INSERT INTO subscriptions (outlet_id, plan_id, status, current_period_start, current_period_end) 
       VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '30 days')`,
      [outletId, plan_id]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: { chain_id: chainId, outlet_id: outletId } });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listPlans(req: Request, res: Response) {
  const result = await db.query('SELECT * FROM plans WHERE is_archived = false ORDER BY monthly_price_paise ASC');
  res.json({ success: true, data: result.rows });
}

export async function createPlan(req: Request, res: Response) {
  const { 
    name, monthly_price_paise, annual_price_paise, 
    max_tables, max_staff, max_menu_items, max_orders_per_month, features 
  } = req.body;

  const result = await db.query(
    `INSERT INTO plans (
      name, monthly_price_paise, annual_price_paise, 
      max_tables, max_staff, max_menu_items, max_orders_per_month, features
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      name, monthly_price_paise, annual_price_paise, 
      max_tables, max_staff, max_menu_items, max_orders_per_month, JSON.stringify(features || {})
    ]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
}

export async function suspendChain(req: Request, res: Response) {
  const { id } = req.params;
  
  // outlets table uses is_active (boolean) and subscription_status (text)
  await db.query(
    `UPDATE outlets SET is_active = false, subscription_status = 'suspended' WHERE chain_id = $1`,
    [id]
  );
  
  // subscriptions table has status column
  await db.query(
    `UPDATE subscriptions SET status = 'suspended' WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)`,
    [id]
  );
  
  res.json({ success: true, message: 'Chain suspended' });
}
