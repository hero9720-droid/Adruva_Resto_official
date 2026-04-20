"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shiftSchema = exports.attendanceSchema = void 0;
const zod_1 = require("zod");
exports.attendanceSchema = zod_1.z.object({
    clock_in_time: zod_1.z.string().datetime().optional(),
    clock_out_time: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional().nullable(),
});
exports.shiftSchema = zod_1.z.object({
    opening_cash_paise: zod_1.z.number().int().min(0),
    closing_cash_paise: zod_1.z.number().int().min(0).optional(),
    notes: zod_1.z.string().optional().nullable(),
});
