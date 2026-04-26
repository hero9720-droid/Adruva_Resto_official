import { Router } from 'express';
import * as PricingController from './pricing.controller';
import { verifyToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['chain_owner', 'billing_admin']));

router.post('/rules', PricingController.createPricingRule);
router.get('/rules', PricingController.getPricingRules);
router.post('/recalculate', PricingController.recalculateDynamicPrices);

export default router;
