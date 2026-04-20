"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardChainSchema = exports.createPlanSchema = void 0;
const zod_1 = require("zod");
exports.createPlanSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    monthly_price_paise: zod_1.z.number().int().nonnegative(),
    annual_price_paise: zod_1.z.number().int().nonnegative(),
    max_tables: zod_1.z.number().int().positive(),
    max_staff: zod_1.z.number().int().positive(),
    max_menu_items: zod_1.z.number().int().positive(),
    max_orders_per_month: zod_1.z.number().int().positive(),
    features: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.onboardChainSchema = zod_1.z.object({
    chain_name: zod_1.z.string().min(2),
    outlet_name: zod_1.z.string().min(2),
    plan_id: zod_1.z.string().uuid(),
    admin_name: zod_1.z.string().min(2),
    admin_email: zod_1.z.string().email(),
    admin_password: zod_1.z.string().min(6),
});
