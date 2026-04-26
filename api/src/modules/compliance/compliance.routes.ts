import { Router } from 'express';
import * as ComplianceController from './compliance.controller';
import { verifyToken } from '../../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/standards/:chain_id', ComplianceController.getStandards);
router.post('/:outlet_id/audits', ComplianceController.submitAudit);
router.get('/:outlet_id/history', ComplianceController.getAuditHistory);
router.get('/:outlet_id/stats', ComplianceController.getComplianceStats);

export default router;
