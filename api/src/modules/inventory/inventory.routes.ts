import { Router } from 'express';
import * as InventoryController from './inventory.controller';
import * as RequisitionController from './requisition.controller';
import { verifyToken } from '../../middleware/auth';
import { requireActiveSubscription } from '../../middleware/subscription';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(verifyToken);
router.use(requireActiveSubscription);

// Stock Requisitions (Indents)
router.get('/requisitions', RequisitionController.getRequisitions);
router.post('/requisitions', 
  requireRole(['outlet_manager', 'chain_owner']), 
  RequisitionController.createRequisition
);
router.patch('/requisitions/:id/status', 
  requireRole(['outlet_manager', 'chain_owner']), 
  RequisitionController.updateRequisitionStatus
);

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

// AI Forecasting
router.post('/forecast/run', 
  requireRole(['outlet_manager']), 
  InventoryController.triggerForecast
);
router.get('/forecast/predictions', InventoryController.getPredictions);

// Auto-Procurement
router.get('/procurement/suggestions', requireRole(['outlet_manager']), InventoryController.getProcurementSuggestions);
router.post('/procurement/generate', requireRole(['outlet_manager']), InventoryController.generateAutoPOs);

// AI Core V3: Smart Wastage
router.get('/ai/wastage-risks', requireRole(['outlet_manager', 'kitchen']), InventoryController.getWastageRisks);
router.get('/ai/wastage-analytics', requireRole(['outlet_manager']), InventoryController.getWastageAnalytics);
router.post('/ai/predict-usage', requireRole(['outlet_manager']), InventoryController.runPredictiveUsage);

// Central Supply Chain
router.get('/supply/overview', requireRole(['chain_owner', 'outlet_manager']), InventoryController.getSupplyOverview);
router.post('/supply/production', requireRole(['outlet_manager']), InventoryController.createProductionBatch);
router.post('/supply/dispatch', requireRole(['outlet_manager']), InventoryController.dispatchBatchIndents);

// Vendor RFQ
router.post('/procurement/rfq', requireRole(['outlet_manager']), InventoryController.createRFQ);
router.get('/procurement/rfq/:id', requireRole(['outlet_manager']), InventoryController.getRFQWithBids);
router.post('/vendor/rfq/:id/bid', InventoryController.submitVendorBid);

// Inventory Ledger & Audit
router.get('/ledger/:id', requireRole(['outlet_manager', 'chain_owner']), InventoryController.getAuditTrail);
router.post('/ledger/reconcile', requireRole(['outlet_manager']), InventoryController.reconcileInventory);

// Sustainability & Waste Impact
router.post('/sustainability/waste', requireRole(['outlet_manager', 'kitchen']), InventoryController.logWasteImpact);
router.get('/sustainability/report', requireRole(['chain_owner']), InventoryController.getSustainabilityReport);

export default router;
