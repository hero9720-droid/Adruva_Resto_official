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
const MenuController = __importStar(require("./menu.controller"));
const ModifiersController = __importStar(require("./modifiers.controller"));
const UploadController = __importStar(require("./upload.controller"));
const validate_1 = require("../../middleware/validate");
const menu_schema_1 = require("./menu.schema");
const auth_1 = require("../../middleware/auth");
const subscription_1 = require("../../middleware/subscription");
const rbac_1 = require("../../middleware/rbac");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// ── PUBLIC — No auth (Customer QR App) ────────────────────────────────────────
router.get('/public/:outletSlug', MenuController.getPublicMenu);
// ── Protected — All routes below require auth ──────────────────────────────────
router.use(auth_1.verifyToken);
router.use(subscription_1.requireActiveSubscription);
// Stats (plan limit bar)
router.get('/stats', MenuController.getMenuStats);
// Categories
router.get('/categories', MenuController.getCategories);
router.post('/categories', (0, rbac_1.requireRole)(['outlet_manager']), (0, validate_1.validateBody)(menu_schema_1.categorySchema), MenuController.createCategory);
router.patch('/categories/:id', (0, rbac_1.requireRole)(['outlet_manager']), MenuController.updateCategory);
router.delete('/categories/:id', (0, rbac_1.requireRole)(['outlet_manager']), MenuController.deleteCategory);
// Menu Items
router.get('/items', MenuController.getMenuItems);
router.post('/items', (0, rbac_1.requireRole)(['outlet_manager']), (0, validate_1.validateBody)(menu_schema_1.menuItemSchema), MenuController.createMenuItem);
router.patch('/items/:id', (0, rbac_1.requireRole)(['outlet_manager']), MenuController.updateMenuItem);
router.delete('/items/:id', (0, rbac_1.requireRole)(['outlet_manager']), MenuController.deleteMenuItem);
// Variants & Modifiers
router.post('/items/variants', (0, rbac_1.requireRole)(['outlet_manager']), (0, validate_1.validateBody)(zod_1.z.object({ menu_item_id: zod_1.z.string().uuid(), variants: zod_1.z.array(menu_schema_1.variantSchema) })), ModifiersController.addVariants);
router.post('/items/modifier-groups', (0, rbac_1.requireRole)(['outlet_manager']), (0, validate_1.validateBody)(menu_schema_1.modifierGroupSchema.extend({ menu_item_id: zod_1.z.string().uuid() })), ModifiersController.addModifierGroup);
// Uploads
router.get('/upload-url', (0, rbac_1.requireRole)(['outlet_manager', 'cashier']), UploadController.getUploadUrl);
exports.default = router;
