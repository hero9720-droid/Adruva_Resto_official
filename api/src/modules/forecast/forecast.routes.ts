import { Router } from 'express';
import * as ForecastController from './forecast.controller';
import { verifyToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['chain_owner', 'manager']));

router.post('/:outlet_id/analyze', ForecastController.runPredictiveAnalysis);
router.get('/:outlet_id/summary', ForecastController.getForecastSummary);
router.get('/:outlet_id/procurement', ForecastController.getProcurementPlan);

export default router;
