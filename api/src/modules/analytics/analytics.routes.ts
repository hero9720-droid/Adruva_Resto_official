import { Router } from 'express';
import * as AnalyticsController from './analytics.controller';
import { verifyToken } from '../../middleware/auth';
import { requireActiveSubscription } from '../../middleware/subscription';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireActiveSubscription);
router.use(requireRole(['outlet_manager'])); // Only managers see analytics

router.get('/sales-overview', AnalyticsController.getSalesOverview);
router.get('/top-items', AnalyticsController.getTopItems);
router.get('/staff-performance', AnalyticsController.getStaffPerformance);
router.get('/heatmap', AnalyticsController.getHourlyHeatmap);

export default router;
