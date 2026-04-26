import { Router } from 'express';
import * as MarketingController from './marketing.controller';
import { verifyToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['chain_owner', 'marketing_admin']));

router.post('/campaigns', MarketingController.createCampaign);
router.get('/campaigns', MarketingController.getCampaigns);
router.post('/campaigns/:id/execute', MarketingController.executeCampaign);

export default router;
