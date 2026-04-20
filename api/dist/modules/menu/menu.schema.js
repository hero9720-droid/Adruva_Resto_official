"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifierGroupSchema = exports.modifierSchema = exports.variantSchema = exports.menuItemSchema = exports.categorySchema = void 0;
const zod_1 = require("zod");
exports.categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    parent_id: zod_1.z.string().uuid().optional().nullable(),
    icon: zod_1.z.string().optional().nullable(),
    sort_order: zod_1.z.number().int().default(0),
});
exports.menuItemSchema = zod_1.z.object({
    category_id: zod_1.z.string().uuid().optional().nullable(),
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional().nullable(),
    photo_url: zod_1.z.string().url().optional().nullable(),
    base_price_paise: zod_1.z.number().int().nonnegative(),
    cost_price_paise: zod_1.z.number().int().nonnegative().default(0),
    food_type: zod_1.z.enum(['veg', 'non_veg', 'egg', 'vegan']).default('veg'),
    is_available: zod_1.z.boolean().default(true),
    is_featured: zod_1.z.boolean().default(false),
    preparation_time_minutes: zod_1.z.number().int().min(0).default(15),
    sort_order: zod_1.z.number().int().default(0),
});
exports.variantSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    price_paise: zod_1.z.number().int().nonnegative(),
    is_default: zod_1.z.boolean().default(false),
});
exports.modifierSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    extra_price_paise: zod_1.z.number().int().nonnegative().default(0),
});
exports.modifierGroupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    is_required: zod_1.z.boolean().default(false),
    min_select: zod_1.z.number().int().min(0).default(0),
    max_select: zod_1.z.number().int().min(1).default(1),
    modifiers: zod_1.z.array(exports.modifierSchema),
});
