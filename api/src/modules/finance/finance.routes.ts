import { Router } from 'express';
import * as FinanceController from './finance.controller';
import { verifyToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['chain_owner', 'billing_admin']));

router.post('/tax-slabs', FinanceController.createTaxSlab);
router.get('/tax-slabs', FinanceController.getTaxSlabs);
router.get('/tax-report', FinanceController.getTaxLiabilityReport);

export default router;
