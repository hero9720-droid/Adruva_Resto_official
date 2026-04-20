import { Router } from 'express';
import * as OrdersController from './orders.controller';
import { validateBody } from '../../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema, updateOrderItemStatusSchema } from './orders.schema';
import { verifyToken } from '../../middleware/auth';
import { requireActiveSubscription } from '../../middleware/subscription';
import { requireRole } from '../../middleware/rbac';

const router = Router();

// Public route for Customer QR App
router.post('/public', OrdersController.createPublicOrder);

router.use(verifyToken);
router.use(requireActiveSubscription);

router.post('/', 
  requireRole(['cashier', 'waiter', 'outlet_manager']), 
  validateBody(createOrderSchema), 
  OrdersController.createOrder
);

router.get('/', 
  requireRole(['cashier', 'waiter', 'outlet_manager', 'kitchen']), 
  OrdersController.getOrders
);

router.patch('/:id/status', 
  requireRole(['cashier', 'waiter', 'outlet_manager', 'kitchen']), 
  validateBody(updateOrderStatusSchema), 
  OrdersController.updateOrderStatus
);

router.patch('/items/:itemId/status', 
  requireRole(['kitchen', 'outlet_manager']), 
  validateBody(updateOrderItemStatusSchema), 
  OrdersController.updateItemStatus
);

export default router;
