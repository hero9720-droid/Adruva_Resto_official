import { Router } from 'express';
import * as AuthController from './auth.controller';
import { validateBody } from '../../middleware/validate';
import { loginSchema, inviteSchema, setPasswordSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema';
import { authLimiter } from '../../middleware/rateLimiter';
import { verifyToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', verifyToken, AuthController.logout);

router.post('/invite', verifyToken, requireRole(['outlet_manager']), validateBody(inviteSchema), AuthController.invite);
router.post('/set-password', validateBody(setPasswordSchema), AuthController.setPassword);

router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), AuthController.resetPassword);

export default router;
