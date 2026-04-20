"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierSchema = exports.stockMovementSchema = exports.ingredientSchema = void 0;
const zod_1 = require("zod");
exports.ingredientSchema = zod_1.z.object({
    category_id: zod_1.z.string().uuid().optional().nullable(),
    name: zod_1.z.string().min(1).max(200),
    unit: zod_1.z.enum(['kg', 'gm', 'ltr', 'ml', 'pcs', 'box', 'pkt']),
    current_stock: zod_1.z.number().nonnegative().default(0),
    min_stock_level: zod_1.z.number().nonnegative().default(0),
    cost_per_unit_paise: zod_1.z.number().int().nonnegative().default(0),
    supplier_id: zod_1.z.string().uuid().optional().nullable(),
});
exports.stockMovementSchema = zod_1.z.object({
    ingredient_id: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['purchase', 'waste', 'adjustment', 'return', 'kitchen_use']),
    quantity: zod_1.z.number(),
    reason: zod_1.z.string().optional().nullable(),
    unit_cost_paise: zod_1.z.number().int().nonnegative().optional(),
});
exports.supplierSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    contact_person: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string().email().optional().nullable(),
    phone: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    gstin: zod_1.z.string().optional().nullable(),
});
