"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitBillSchema = exports.recordPaymentSchema = exports.createBillSchema = void 0;
const zod_1 = require("zod");
exports.createBillSchema = zod_1.z.object({
    order_ids: zod_1.z.array(zod_1.z.string().uuid()).min(1),
    discount_paise: zod_1.z.number().int().min(0).default(0),
    discount_reason: zod_1.z.string().optional().nullable(),
    service_charge_paise: zod_1.z.number().int().min(0).default(0),
    tax_paise: zod_1.z.number().int().min(0).default(0),
});
exports.recordPaymentSchema = zod_1.z.object({
    bill_id: zod_1.z.string().uuid(),
    payment_method: zod_1.z.enum(['cash', 'card', 'upi', 'on_account', 'complimentary']),
    amount_paise: zod_1.z.number().int().min(1),
    transaction_id: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
});
exports.splitBillSchema = zod_1.z.object({
    bill_id: zod_1.z.string().uuid(),
    split_type: zod_1.z.enum(['equal', 'by_item']),
    num_splits: zod_1.z.number().int().min(2).optional(),
});
