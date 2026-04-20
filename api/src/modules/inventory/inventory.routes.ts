import { Router } from 'express';
import * as InventoryController from './inventory.controller';
import { verifyToken } from '../../middleware/auth';
import { requireActiveSubscription } from '../../middleware/subscription';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireActiveSubscription);

// Ingredients
router.get('/ingredients',          InventoryController.getIngredients);
router.get('/ingredients/low-stock', InventoryController.getLowStockIngredients);
router.post('/ingredients',
  requireRole(['outlet_manager']),
  InventoryController.createIngredient
);

// Stock Movements
router.get('/movements',   InventoryController.getMovements);
router.post('/movements',
  requireRole(['outlet_manager', 'kitchen']),
  InventoryController.recordMovement
);

// Suppliers
router.get('/suppliers',   InventoryController.getSuppliers);
router.post('/suppliers',
  requireRole(['outlet_manager']),
  InventoryController.createSupplier
);

export default router;
