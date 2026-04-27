import { Router } from 'express';
import * as ApprovalController from './approval.controller';
import { verifyToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['outlet_manager', 'chain_owner']));

router.get('/pending', ApprovalController.getPendingApprovals);
router.post('/:id/decide', ApprovalController.decideApproval);

export default router;
