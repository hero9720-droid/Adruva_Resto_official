import { Router } from 'express';
import * as ExpenseController from './expense.controller';
import { validateBody } from '../../middleware/validate';
import { expenseSchema } from './expense.schema';
import { verifyToken } from '../../middleware/auth';
import { requireActiveSubscription } from '../../middleware/subscription';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireActiveSubscription);
router.use(requireRole(['outlet_manager'])); // Expenses are for managers

router.get('/', ExpenseController.getExpenses);
router.post('/', validateBody(expenseSchema), ExpenseController.createExpense);
router.get('/tax-report', ExpenseController.getTaxReport);

export default router;
