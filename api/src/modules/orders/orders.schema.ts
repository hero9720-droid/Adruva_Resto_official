import { z } from 'zod';

const orderItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  variant_id: z.string().uuid().optional().nullable(),
  quantity: z.number().int().min(1),
  unit_price_paise: z.number().int().nonnegative(),
  modifiers_json: z.array(z.any()).optional().default([]),
  notes: z.string().optional().nullable(),
});

export const createOrderSchema = z.object({
  order_type: z.enum(['dine_in', 'takeaway', 'delivery', 'qr', 'room_service']),
  session_id: z.string().uuid().optional().nullable(),
  table_id: z.string().uuid().optional().nullable(),
  room_id: z.string().uuid().optional().nullable(),
  customer_id: z.string().uuid().optional().nullable(),
  waiter_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['draft', 'confirmed', 'preparing', 'ready', 'served', 'cancelled']),
});

export const updateOrderItemStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'served']),
});
