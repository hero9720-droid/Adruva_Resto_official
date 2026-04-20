"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderItemStatusSchema = exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const orderItemSchema = zod_1.z.object({
    menu_item_id: zod_1.z.string().uuid(),
    variant_id: zod_1.z.string().uuid().optional().nullable(),
    quantity: zod_1.z.number().int().min(1),
    unit_price_paise: zod_1.z.number().int().nonnegative(),
    modifiers_json: zod_1.z.array(zod_1.z.any()).optional().default([]),
    notes: zod_1.z.string().optional().nullable(),
});
exports.createOrderSchema = zod_1.z.object({
    order_type: zod_1.z.enum(['dine_in', 'takeaway', 'delivery', 'qr', 'room_service']),
    session_id: zod_1.z.string().uuid().optional().nullable(),
    table_id: zod_1.z.string().uuid().optional().nullable(),
    room_id: zod_1.z.string().uuid().optional().nullable(),
    customer_id: zod_1.z.string().uuid().optional().nullable(),
    waiter_id: zod_1.z.string().uuid().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
    items: zod_1.z.array(orderItemSchema).min(1),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['draft', 'confirmed', 'preparing', 'ready', 'served', 'cancelled']),
});
exports.updateOrderItemStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'preparing', 'ready', 'served']),
});
