import { Router } from 'express';
import * as TipsController from './tips.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/:outlet_id/stats', TipsController.getTipPoolStats);
router.post('/:outlet_id/distribute', TipsController.processTipDistribution);
router.get('/staff/:staff_id', TipsController.getStaffTips);

export default router;
