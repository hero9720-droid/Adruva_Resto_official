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

export async function getGlobalAuditLogs(req: Request, res: Response) {
  const result = await db.query(`
    SELECT al.*, o.name as outlet_name
    FROM audit_logs al
    LEFT JOIN outlets o ON o.id = al.outlet_id
    ORDER BY al.created_at DESC
    LIMIT 50
  `);
  res.json({ success: true, data: result.rows });
}

export async function getRevenueTrends(req: Request, res: Response) {
  const result = await db.query(`
    SELECT 
      DATE(created_at) as date,
      SUM(amount_paise) as total_paise
    FROM payment_transactions
    WHERE status = 'captured'
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) DESC
    LIMIT 14
  `);
  res.json({ success: true, data: result.rows });
}

export async function getPlatformCRM(req: Request, res: Response) {
  // Aggregate users from chain_users and staff
  const result = await db.query(`
    (SELECT id, name, email, role, 'chain' as portal, created_at FROM chain_users)
    UNION ALL
    (SELECT id, name, email, role, 'outlet' as portal, created_at FROM staff)
    ORDER BY created_at DESC
    LIMIT 100
  `);
  res.json({ success: true, data: result.rows });
}

export async function getStorageMetrics(req: Request, res: Response) {
  const dbSize = await db.query("SELECT pg_size_pretty(pg_database_size(current_database())) as size");
  const tableCounts = await db.query(`
    SELECT relname as table_name, n_live_tup as row_count 
    FROM pg_stat_user_tables 
    ORDER BY n_live_tup DESC 
    LIMIT 10
  `);

  res.json({ 
    success: true, 
    data: {
      database_size: dbSize.rows[0].size,
      top_tables: tableCounts.rows
    }
  });
}

export async function getGlobalSettings(req: Request, res: Response) {
  const result = await db.query('SELECT * FROM global_settings');
  res.json({ success: true, data: result.rows[0] || {} });
}

export async function updateGlobalSettings(req: Request, res: Response) {
  const { maintenance_mode, platform_fee_percent, support_email } = req.body;
  
  await db.query(`
    INSERT INTO global_settings (id, maintenance_mode, platform_fee_percent, support_email)
    VALUES (1, $1, $2, $3)
    ON CONFLICT (id) DO UPDATE SET 
      maintenance_mode = $1, 
      platform_fee_percent = $2, 
      support_email = $3,
      updated_at = NOW()
  `, [maintenance_mode, platform_fee_percent, support_email]);

  res.json({ success: true, message: 'Settings updated' });
}

export async function getPlatformPayments(req: Request, res: Response) {
  const result = await db.query(`
    SELECT 
      sp.id,
      sp.amount_paise,
      sp.currency,
      sp.status,
      sp.created_at,
      c.name as chain_name,
      p.name as plan_name
    FROM subscription_payments sp
    JOIN chains c ON c.id = sp.chain_id
    JOIN plans p ON p.id = c.plan_id
    ORDER BY sp.created_at DESC
    LIMIT 50
  `);
  res.json({ success: true, data: result.rows });
}

export async function getChainDetails(req: Request, res: Response) {
  const { id } = req.params;
  
  const [chain, outlets, subscription] = await Promise.all([
    db.query('SELECT * FROM chains WHERE id = $1', [id]),
    db.query('SELECT * FROM outlets WHERE chain_id = $1', [id]),
    db.query(`
      SELECT s.*, p.name as plan_name 
      FROM subscriptions s
      JOIN plans p ON p.id = s.plan_id
      WHERE s.outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)
      ORDER BY s.created_at DESC LIMIT 1
    `, [id])
  ]);

  if (chain.rows.length === 0) {
    throw new AppError('Chain not found', 404);
  }

  res.json({ 
    success: true, 
    data: {
      chain: chain.rows[0],
      outlets: outlets.rows,
      subscription: subscription.rows[0]
    }
  });
}

export async function getPlatformPayments(req: Request, res: Response) {
  const result = await db.query(`
    SELECT 
      sp.id,
      sp.amount_paise,
      sp.currency,
      sp.status,
      sp.created_at,
      c.name as chain_name,
      p.name as plan_name
    FROM subscription_payments sp
    JOIN chains c ON c.id = sp.chain_id
    JOIN plans p ON p.id = c.plan_id
    ORDER BY sp.created_at DESC
    LIMIT 50
  `);
  res.json({ success: true, data: result.rows });
}

export async function getChainDetails(req: Request, res: Response) {
  const { id } = req.params;
  
  const [chain, outlets, subscription] = await Promise.all([
    db.query('SELECT * FROM chains WHERE id = $1', [id]),
    db.query('SELECT * FROM outlets WHERE chain_id = $1', [id]),
    db.query(`
      SELECT s.*, p.name as plan_name 
      FROM subscriptions s
      JOIN plans p ON p.id = s.plan_id
      WHERE s.outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)
      ORDER BY s.created_at DESC LIMIT 1
    `, [id])
  ]);

  if (chain.rows.length === 0) {
    throw new AppError('Chain not found', 404);
  }

  res.json({ 
    success: true, 
    data: {
      chain: chain.rows[0],
      outlets: outlets.rows,
      subscription: subscription.rows[0]
    }
  });
}

export async function deactivateUser(req: Request, res: Response) {
  const { portal, id } = req.body;
  const table = portal === 'chain' ? 'chain_users' : 'staff';
  
  await db.query(`UPDATE ${table} SET is_active = false WHERE id = $1`, [id]);
  res.json({ success: true, message: 'User deactivated' });
}

export async function resetUserPassword(req: Request, res: Response) {
  const { portal, id, new_password } = req.body;
  const table = portal === 'chain' ? 'chain_users' : 'staff';
  const hashedPassword = await bcrypt.hash(new_password, 12);
  
  await db.query(`UPDATE ${table} SET password_hash = $1 WHERE id = $2`, [hashedPassword, id]);
  res.json({ success: true, message: 'Password reset successful' });
}

export async function getRevenueByPlan(req: Request, res: Response) {
  const result = await db.query(`
    SELECT 
      p.name as plan_name,
      SUM(sp.amount_paise) as total_paise,
      COUNT(sp.id)::int as transaction_count
    FROM subscription_payments sp
    JOIN chains c ON c.id = sp.chain_id
    JOIN plans p ON p.id = c.plan_id
    WHERE sp.status = 'paid'
    GROUP BY p.name
    ORDER BY total_paise DESC
  `);
  res.json({ success: true, data: result.rows });
}

