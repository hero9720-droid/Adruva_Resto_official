import { Router } from 'express';
import * as SuperAdminController from './superadmin.controller';
import { verifyToken } from '../../../middleware/auth';
import { requireRole } from '../../../middleware/rbac';
import { validateBody } from '../../../middleware/validate';
import { createPlanSchema, onboardChainSchema } from './superadmin.schema';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['superadmin']));

router.get('/metrics', SuperAdminController.getGlobalMetrics);
router.get('/health', SuperAdminController.getSystemHealth);

router.get('/plans', SuperAdminController.listPlans);
router.post('/plans', validateBody(createPlanSchema), SuperAdminController.createPlan);

router.get('/chains', SuperAdminController.listAllChains);
router.post('/chains/onboard', validateBody(onboardChainSchema), SuperAdminController.onboardChain);
router.post('/chains/:id/suspend', SuperAdminController.suspendChain);

router.get('/audit-logs', SuperAdminController.getGlobalAuditLogs);
router.get('/revenue-trends', SuperAdminController.getRevenueTrends);

router.get('/crm', SuperAdminController.getPlatformCRM);
router.get('/storage', SuperAdminController.getStorageMetrics);
router.get('/settings', SuperAdminController.getGlobalSettings);
router.post('/settings', SuperAdminController.updateGlobalSettings);

router.get('/payments', SuperAdminController.getPlatformPayments);
router.get('/chains/:id', SuperAdminController.getChainDetails);

router.post('/users/deactivate', SuperAdminController.deactivateUser);
router.post('/users/reset-password', SuperAdminController.resetUserPassword);
router.get('/revenue/by-plan', SuperAdminController.getRevenueByPlan);

export default router;
