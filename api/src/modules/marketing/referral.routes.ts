import { Router } from 'express';
import * as ReferralController from './referral.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/stats/:chain_id', ReferralController.getReferralStats);
router.post('/setup/:customer_id', ReferralController.setupReferralCode);

export default router;
