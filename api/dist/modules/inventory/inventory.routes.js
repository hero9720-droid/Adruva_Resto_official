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
const auth_1 = require("../../middleware/auth");
const subscription_1 = require("../../middleware/subscription");
const rbac_1 = require("../../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.verifyToken);
router.use(subscription_1.requireActiveSubscription);
// Ingredients
router.get('/ingredients', InventoryController.getIngredients);
router.get('/ingredients/low-stock', InventoryController.getLowStockIngredients);
router.post('/ingredients', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.createIngredient);
// Stock Movements
router.get('/movements', InventoryController.getMovements);
router.post('/movements', (0, rbac_1.requireRole)(['outlet_manager', 'kitchen']), InventoryController.recordMovement);
// Suppliers
router.get('/suppliers', InventoryController.getSuppliers);
router.post('/suppliers', (0, rbac_1.requireRole)(['outlet_manager']), InventoryController.createSupplier);
exports.default = router;
