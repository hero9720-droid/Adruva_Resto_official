import { z } from 'zod';

export const createReservationSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  guest_name: z.string().min(1).max(100),
  guest_phone: z.string().min(10).max(15),
  table_id: z.string().uuid().optional().nullable(),
  num_guests: z.number().int().min(1),
  reservation_time: z.string().datetime(),
  notes: z.string().optional().nullable(),
});

export const updateReservationStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'arrived', 'seated', 'no_show']),
});
