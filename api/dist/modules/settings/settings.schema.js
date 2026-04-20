"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.floorZoneSchema = exports.outletSettingsSchema = void 0;
const zod_1 = require("zod");
exports.outletSettingsSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    address: zod_1.z.string().optional().nullable(),
    phone: zod_1.z.string().optional().nullable(),
    gstin: zod_1.z.string().optional().nullable(),
    currency: zod_1.z.string().default('INR'),
    tax_percentage: zod_1.z.number().min(0).max(100).default(5),
    service_charge_percentage: zod_1.z.number().min(0).max(100).default(0),
    receipt_header: zod_1.z.string().optional().nullable(),
    receipt_footer: zod_1.z.string().optional().nullable(),
    opening_time: zod_1.z.string().optional().nullable(),
    closing_time: zod_1.z.string().optional().nullable(),
});
exports.floorZoneSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50),
    description: zod_1.z.string().optional().nullable(),
});
