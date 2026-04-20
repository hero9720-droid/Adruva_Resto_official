"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redeemPointsSchema = exports.earnPointsSchema = exports.customerSchema = void 0;
const zod_1 = require("zod");
exports.customerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    phone: zod_1.z.string().min(10).max(15),
    email: zod_1.z.string().email().optional().nullable(),
    date_of_birth: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
});
exports.earnPointsSchema = zod_1.z.object({
    customer_id: zod_1.z.string().uuid(),
    bill_id: zod_1.z.string().uuid(),
    points: zod_1.z.number().int().min(1),
});
exports.redeemPointsSchema = zod_1.z.object({
    customer_id: zod_1.z.string().uuid(),
    points: zod_1.z.number().int().min(1),
    order_id: zod_1.z.string().uuid(),
});
