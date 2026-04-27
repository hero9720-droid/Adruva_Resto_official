import { Router } from 'express';
import * as CRMController from './crm.controller';
import { verifyToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);

router.get('/insights', requireRole(['chain_owner', 'outlet_manager']), CRMController.getInsights);
router.post('/segmentation/run', requireRole(['chain_owner']), CRMController.runSegmentation);
router.post('/automation/daily', requireRole(['chain_owner']), CRMController.processAutomated);

// CLV & Predictive Analytics
router.get('/clv/segments', requireRole(['chain_owner']), CRMController.getCLVSegments);
router.get('/clv/at-risk', requireRole(['chain_owner']), CRMController.getAtRiskWhales);
router.post('/clv/sync', requireRole(['chain_owner']), CRMController.syncCLVData);

export default router;
