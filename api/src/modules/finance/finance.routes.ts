import { Router } from 'express';
import * as FinanceController from './finance.controller';
import { verifyToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);

// Tax Slab Management
router.get('/tax-slabs', requireRole(['chain_owner', 'outlet_manager', 'billing_admin']), FinanceController.getTaxSlabs);
router.post('/tax-slabs', requireRole(['chain_owner', 'outlet_manager']), FinanceController.createTaxSlab);

// Compliance & Reporting
router.get('/tax-summary', requireRole(['chain_owner', 'outlet_manager', 'billing_admin']), FinanceController.getTaxSummary);
router.patch('/compliance-info', requireRole(['chain_owner', 'outlet_manager']), FinanceController.updateComplianceInfo);

// P&L & Forecasting
router.get('/pnl/live', requireRole(['chain_owner', 'outlet_manager']), FinanceController.getLivePnL);
router.get('/projections/cashflow', requireRole(['chain_owner', 'outlet_manager']), FinanceController.getFinancialProjections);

export default router;
