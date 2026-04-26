import { Router } from 'express';
import * as OperationsController from './operations.controller';
import { verifyToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['outlet_manager', 'admin', 'manager']));

router.post('/:outlet_id/shift-logs', OperationsController.createShiftLog);
router.get('/:outlet_id/shift-logs', OperationsController.getShiftLogs);
router.get('/:outlet_id/handover', OperationsController.getHandoverData);
router.get('/:outlet_id/handover/preview', OperationsController.getHandoverPreview);

export default router;
