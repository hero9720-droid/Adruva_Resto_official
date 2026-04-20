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
const OrdersController = __importStar(require("./orders.controller"));
const validate_1 = require("../../middleware/validate");
const orders_schema_1 = require("./orders.schema");
const auth_1 = require("../../middleware/auth");
const subscription_1 = require("../../middleware/subscription");
const rbac_1 = require("../../middleware/rbac");
const router = (0, express_1.Router)();
// Public route for Customer QR App
router.post('/public', OrdersController.createPublicOrder);
router.use(auth_1.verifyToken);
router.use(subscription_1.requireActiveSubscription);
router.post('/', (0, rbac_1.requireRole)(['cashier', 'waiter', 'outlet_manager']), (0, validate_1.validateBody)(orders_schema_1.createOrderSchema), OrdersController.createOrder);
router.get('/', (0, rbac_1.requireRole)(['cashier', 'waiter', 'outlet_manager', 'kitchen']), OrdersController.getOrders);
router.patch('/:id/status', (0, rbac_1.requireRole)(['cashier', 'waiter', 'outlet_manager', 'kitchen']), (0, validate_1.validateBody)(orders_schema_1.updateOrderStatusSchema), OrdersController.updateOrderStatus);
router.patch('/items/:itemId/status', (0, rbac_1.requireRole)(['kitchen', 'outlet_manager']), (0, validate_1.validateBody)(orders_schema_1.updateOrderItemStatusSchema), OrdersController.updateItemStatus);
exports.default = router;
