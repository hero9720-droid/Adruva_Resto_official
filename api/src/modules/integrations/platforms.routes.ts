import { Router } from 'express';
import * as PlatformsController from './platforms.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/:outlet_id/status', PlatformsController.getPlatformStatus);
router.patch('/:outlet_id/:platform_name/toggle', PlatformsController.togglePlatform);
router.patch('/items/:item_id/sync', PlatformsController.syncMenuItemStatus);
router.get('/:outlet_id/orders', PlatformsController.getAggregatedOrders);

export default router;
