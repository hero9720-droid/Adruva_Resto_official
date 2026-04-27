import { Router } from 'express';
import * as AnalyticsController from './analytics.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/command-center', AnalyticsController.getCommandCenterData);

export default router;
