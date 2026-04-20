import { Router } from 'express';
import * as SuperAdminAuthController from './superadminAuth.controller';
import { superadminAuthLimiter } from '../../../middleware/rateLimiter';
import { verifyToken } from '../../../middleware/auth';

const router = Router();

router.post('/login', superadminAuthLimiter, SuperAdminAuthController.login);
router.post('/2fa/setup', verifyToken, SuperAdminAuthController.setup2FA);
router.post('/2fa/verify', verifyToken, SuperAdminAuthController.verify2FA);

export default router;
