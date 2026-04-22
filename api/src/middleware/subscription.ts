import { Request, Response, NextFunction } from 'express';
import { db } from '../lib/db';
import { redis } from '../lib/redis';
import { AppError } from '../lib/errors';

/**
 * Subscription status matrix:
 * 'trial'      → full access until trial_ends_at
 * 'active'     → full access
 * 'expiring'   → full access + show renewal banner in UI
 * 'grace'      → full access for grace_period_days after expiry
 * 'restricted' → READ-ONLY access (GET endpoints only)
 * 'suspended'  → ALL access blocked (403 on every endpoint)
 */
export async function requireActiveSubscription(
  req: Request, res: Response, next: NextFunction
) {
  // SuperAdmin routes bypass this middleware entirely
  if (req.user?.role === 'superadmin') return next();
  // Chain-app routes have their own chain-level check
  if (req.user?.role === 'chain_owner') return next();

  const outlet_id = req.user?.outlet_id;
  if (!outlet_id) {
    throw new AppError(401, 'Authentication required', 'UNAUTHENTICATED');
  }

  const cacheKey = `sub_status:${outlet_id}`;
  let status = await redis.get(cacheKey);

  if (!status) {
    const result = await db.query(
      `SELECT s.status, o.grace_period_days
       FROM subscriptions s
       JOIN outlets o ON o.id = s.outlet_id
       WHERE s.outlet_id = $1`,
      [outlet_id]
    );
    
    if (result.rows.length === 0) {
      // No subscription record — treat as trial to allow access
      // (happens during dev / fresh outlet setup)
      status = 'trial';
    } else {
      status = result.rows[0].status;
    }
    await redis.setex(cacheKey, 60, status!); // Cache for 60 seconds
  }

  if (status === 'suspended') {
    throw new AppError(403, 'Your subscription is suspended. Please contact support.', 'SUBSCRIPTION_SUSPENDED');
  }

  // Restricted outlets: only GET requests allowed
  if (status === 'restricted' && req.method !== 'GET') {
    return res.status(403).json({
      success: false,
      error: 'Your subscription has expired. Please renew to create or modify data.',
      code: 'SUBSCRIPTION_RESTRICTED',
      show_renewal_modal: true
    });
  }

  req.subscriptionStatus = status as string;
  next();
}
