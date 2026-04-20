"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseSchema = exports.expenseCategorySchema = void 0;
const zod_1 = require("zod");
exports.expenseCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional().nullable(),
});
exports.expenseSchema = zod_1.z.object({
    category_id: zod_1.z.string().uuid(),
    amount_paise: zod_1.z.number().int().min(1),
    description: zod_1.z.string().min(1),
    expense_date: zod_1.z.string().datetime().optional(),
    payment_method: zod_1.z.enum(['cash', 'bank_transfer', 'card', 'upi']),
    attachment_url: zod_1.z.string().url().optional().nullable(),
});
