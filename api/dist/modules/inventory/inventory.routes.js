"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const InventoryController = __importStar(require("./inventory.controller"));
const RequisitionController = __importStar(require("./requisition.controller"));
const auth_1 = require("../../middleware/auth");
const subscription_1 = require("../../middleware/subscription");
const rbac_1 = require("../../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.verifyToken);
router.use(subscription_1.requireActiveSubscription);
// Stock Requisitions (Indents)
router.get('/requisitions', RequisitionController.getRequisitions);
router.post('/requisitions', (0, rbac_1.requireRole)(['outlet_manager', 'chain_owner']), RequisitionController.createRequisition);
router.patch('/requisitions/:id/status', (0, rbac_1.requireRole)(['outlet_manager', 'chain_owner']), RequisitionController.updateRequisitionStatus);
// Ingredients
router.get('/ingredients', InventoryController.getIngredients);
router.get('/ingredients/low-stock', InventoryController.getLowStockIngredients);
router.post('/ingredients', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.createIngredient);
// Stock Movements
router.get('/movements', InventoryController.getMovements);
router.post('/movements', (0, rbac_1.requireRole)(['outlet_manager', 'kitchen']), InventoryController.recordMovement);
// Suppliers
router.get('/suppliers', InventoryController.getSuppliers);
router.get('/suppliers/performance', InventoryController.getSupplierPerformance);
router.post('/suppliers', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.createSupplier);
router.patch('/suppliers/:id', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.updateSupplier);
router.delete('/suppliers/:id', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.deleteSupplier);
// Stock Transfers
router.get('/transfers', InventoryController.getTransfers);
router.post('/transfers', (0, rbac_1.requireRole)(['outlet_manager', 'chain_owner']), InventoryController.initiateTransfer);
router.patch('/transfers/:id/status', (0, rbac_1.requireRole)(['outlet_manager', 'chain_owner']), InventoryController.completeTransfer);
// AI Forecasting
router.post('/forecast/run', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.triggerForecast);
router.get('/forecast/predictions', InventoryController.getPredictions);
// Auto-Procurement
router.get('/procurement/suggestions', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.getProcurementSuggestions);
router.post('/procurement/generate', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.generateAutoPOs);
// AI Core V3: Smart Wastage
router.get('/ai/wastage-risks', (0, rbac_1.requireRole)(['outlet_manager', 'kitchen']), InventoryController.getWastageRisks);
router.get('/ai/wastage-analytics', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.getWastageAnalytics);
router.post('/ai/predict-usage', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.runPredictiveUsage);
// Central Supply Chain
router.get('/supply/overview', (0, rbac_1.requireRole)(['chain_owner', 'outlet_manager']), InventoryController.getSupplyOverview);
router.post('/supply/production', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.createProductionBatch);
router.post('/supply/dispatch', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.dispatchBatchIndents);
// Vendor RFQ
router.post('/procurement/rfq', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.createRFQ);
router.get('/procurement/rfq/:id', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.getRFQWithBids);
router.post('/vendor/rfq/:id/bid', InventoryController.submitVendorBid);
// Inventory Ledger & Audit
router.get('/ledger/:id', (0, rbac_1.requireRole)(['outlet_manager', 'chain_owner']), InventoryController.getAuditTrail);
router.post('/ledger/reconcile', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.reconcileInventory);
// Sustainability & Waste Impact
router.post('/sustainability/waste', (0, rbac_1.requireRole)(['outlet_manager', 'kitchen']), InventoryController.logWasteImpact);
router.get('/sustainability/report', (0, rbac_1.requireRole)(['chain_owner']), InventoryController.getSustainabilityReport);
exports.default = router;
