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
import roomRoutes from './modules/rooms/rooms.routes';
import feedbackRoutes from './modules/feedback/feedback.routes';
import maintenanceRoutes from './modules/maintenance/maintenance.routes';
import marketingRoutes from './modules/marketing/marketing.routes';
import trainingRoutes from './modules/training/training.routes';
import pricingRoutes from './modules/pricing/pricing.routes';
import deliveryRoutes from './modules/delivery/delivery.routes';
import financeRoutes from './modules/finance/finance.routes';
import payrollRoutes from './modules/payroll/payroll.routes';
import forecastRoutes from './modules/forecast/forecast.routes';
import operationsRoutes from './modules/operations/operations.routes';
import referralRoutes from './modules/marketing/referral.routes';
import supplierRoutes from './modules/inventory/suppliers.routes';
import complianceRoutes from './modules/compliance/compliance.routes';
import tipRoutes from './modules/payroll/tips.routes';
import platformRoutes from './modules/integrations/platforms.routes';
import menuAIRoutes from './modules/menu/menu.ai.routes';
import brandRoutes from './modules/brand/brand.routes';
import geoRoutes from './modules/marketing/geo.routes';
import pestRoutes from './modules/compliance/pest.routes';
import publicQrRoutes from './modules/public/qr.routes';
import searchRoutes from './modules/search/search.routes';

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
router.use('/rooms', roomRoutes);

// Multi-Tenant Management
router.use('/superadmin/mgmt', superadminMgmtRoutes);
router.use('/chain/mgmt', chainMgmtRoutes);
router.use('/recipes', recipeRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/marketing', marketingRoutes);
router.use('/training', trainingRoutes);
router.use('/pricing', pricingRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/finance', financeRoutes);
router.use('/payroll', payrollRoutes);
router.use('/forecast', forecastRoutes);
router.use('/operations', operationsRoutes);
router.use('/marketing/referrals', referralRoutes);
router.use('/inventory/suppliers', supplierRoutes);
router.use('/compliance', complianceRoutes);
router.use('/payroll/tips', tipRoutes);
router.use('/integrations/platforms', platformRoutes);
router.use('/menu/ai', menuAIRoutes);
router.use('/brand', brandRoutes);
router.use('/marketing/geo', geoRoutes);
router.use('/compliance/pest', pestRoutes);
router.use('/search', searchRoutes);

// Public Routes (No Auth)
router.use('/qr', publicQrRoutes);

export default router;
