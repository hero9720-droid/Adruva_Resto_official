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
router.get('/suppliers/performance', InventoryController.getSupplierPerformance);
router.post('/suppliers',
  requireRole(['outlet_manager']),
  InventoryController.createSupplier
);
router.patch('/suppliers/:id',
  requireRole(['outlet_manager']),
  InventoryController.updateSupplier
);
router.delete('/suppliers/:id',
  requireRole(['outlet_manager']),
  InventoryController.deleteSupplier
);

// Stock Transfers
router.get('/transfers', InventoryController.getTransfers);
router.post('/transfers', 
  requireRole(['outlet_manager', 'chain_owner']), 
  InventoryController.initiateTransfer
);
router.patch('/transfers/:id/status', 
  requireRole(['outlet_manager', 'chain_owner']), 
  InventoryController.completeTransfer
);

export default router;
