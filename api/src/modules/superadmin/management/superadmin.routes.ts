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

export default router;
