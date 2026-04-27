import { Router } from 'express';
import * as LoyaltyController from './loyalty.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/my-pass', LoyaltyController.getMyPass);
router.get('/tiers', LoyaltyController.getTiers);
router.post('/reevaluate/:id', LoyaltyController.forceReevaluate);

export default router;
