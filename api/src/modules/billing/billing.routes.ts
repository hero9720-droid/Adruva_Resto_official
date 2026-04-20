import { Router } from 'express';
import * as BillingController from './billing.controller';
import { verifyToken } from '../../middleware/auth';
import { requireActiveSubscription } from '../../middleware/subscription';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireActiveSubscription);

// Bills list
router.get('/list', BillingController.getBillsList);

router.post('/generate',
  requireRole(['cashier', 'outlet_manager']),
  BillingController.generateBill
);

router.post('/payments',
  requireRole(['cashier', 'outlet_manager']),
  BillingController.recordPayment
);

router.post('/:id/split',
  requireRole(['cashier', 'outlet_manager']),
  BillingController.splitBill
);

router.get('/:id', 
  requireRole(['cashier', 'outlet_manager', 'waiter']), 
  BillingController.getBillDetails
);

export default router;
