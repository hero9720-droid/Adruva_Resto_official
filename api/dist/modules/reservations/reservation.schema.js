"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReservationStatusSchema = exports.createReservationSchema = void 0;
const zod_1 = require("zod");
exports.createReservationSchema = zod_1.z.object({
    customer_id: zod_1.z.string().uuid().optional().nullable(),
    guest_name: zod_1.z.string().min(1).max(100),
    guest_phone: zod_1.z.string().min(10).max(15),
    table_id: zod_1.z.string().uuid().optional().nullable(),
    num_guests: zod_1.z.number().int().min(1),
    reservation_time: zod_1.z.string().datetime(),
    notes: zod_1.z.string().optional().nullable(),
});
exports.updateReservationStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'confirmed', 'cancelled', 'arrived', 'seated', 'no_show']),
});
