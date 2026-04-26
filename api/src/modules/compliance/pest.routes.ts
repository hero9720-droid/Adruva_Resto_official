import { Router } from 'express';
import * as PestController from './pest.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/:outlet_id/logs', PestController.getPestLogs);
router.post('/:outlet_id/logs', PestController.logPestService);
router.get('/:outlet_id/alerts', PestController.getPestAlerts);
router.patch('/alerts/:alert_id/resolve', PestController.resolvePestAlert);

export default router;
