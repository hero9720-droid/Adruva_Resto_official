import { Router } from 'express';
import { db } from './lib/db';
import { redis } from './lib/redis';
import authRoutes from './modules/auth/auth.routes';
import chainAuthRoutes from './modules/chain/auth/chainAuth.routes';
import superadminAuthRoutes from './modules/superadmin/auth/superadminAuth.routes';
import menuRoutes from './modules/menu/menu.routes';
import orderRoutes from './modules/orders/orders.routes';
import billingRoutes from './modules/billing/billing.routes';
import staffRoutes from './modules/staff/staff.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import expenseRoutes from './modules/expenses/expense.routes';
import customerRoutes from './modules/customers/customer.routes';
import reservationRoutes from './modules/reservations/reservation.routes';
import settingsRoutes from './modules/settings/settings.routes';
import superadminMgmtRoutes from './modules/superadmin/management/superadmin.routes';
import chainMgmtRoutes from './modules/chain/management/chain.routes';
import recipeRoutes from './modules/recipes/recipe.routes';

const router = Router();

/**
 * @route GET /api/health
 * @desc  System health check
 */
router.get('/health', async (req, res) => {
  let dbStatus = 'connected';
  let redisStatus = 'connected';

  try {
    await db.query('SELECT 1');
  } catch (err) {
    dbStatus = 'disconnected';
  }

  try {
    await redis.ping();
  } catch (err) {
    redisStatus = 'disconnected';
  }

  res.json({
    success: true,
    status: dbStatus === 'connected' && redisStatus === 'connected' ? 'ok' : 'degraded',
    db: dbStatus,
    redis: redisStatus,
    timestamp: new Date().toISOString()
  });
});

// Auth Routes
router.use('/auth', authRoutes);
router.use('/chain/auth', chainAuthRoutes);
router.use('/superadmin/auth', superadminAuthRoutes);

// Business Routes
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/billing', billingRoutes);
router.use('/staff', staffRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/expenses', expenseRoutes);
router.use('/customers', customerRoutes);
router.use('/reservations', reservationRoutes);
router.use('/settings', settingsRoutes);

// Multi-Tenant Management
router.use('/superadmin/mgmt', superadminMgmtRoutes);
router.use('/chain/mgmt', chainMgmtRoutes);
router.use('/recipes', recipeRoutes);

export default router;
