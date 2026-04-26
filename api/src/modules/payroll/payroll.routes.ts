import { Router } from 'express';
import * as PayrollController from './payroll.controller';
import { verifyToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireRole(['chain_owner', 'manager']));

router.post('/config', PayrollController.upsertPayrollConfig);
router.post('/cycles/generate', PayrollController.generatePayrollCycle);
router.get('/cycles', PayrollController.getPayrollCycles);
router.get('/cycles/:cycle_id/payslips', PayrollController.getCyclePayslips);

export default router;
