import { Router } from 'express';
import * as PricingController from './pricing.controller';
import { verifyToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['chain_owner', 'billing_admin']));

router.post('/rules', PricingController.createPricingRule);
router.get('/history', PricingController.getPricingHistory);

// Dynamic Pricing
router.get('/dynamic/recommendations', requireRole(['outlet_manager', 'chain_owner']), PricingController.getDynamicRecommendations);
router.post('/dynamic/sync', requireRole(['outlet_manager']), PricingController.syncDynamicPrices);
router.post('/recalculate', PricingController.recalculateDynamicPrices);

export default router;
