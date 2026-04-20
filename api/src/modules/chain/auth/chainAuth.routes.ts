import { Router } from 'express';
import * as ChainAuthController from './chainAuth.controller';
import { authLimiter } from '../../../middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, ChainAuthController.login);
router.post('/refresh', ChainAuthController.refresh);

export default router;
