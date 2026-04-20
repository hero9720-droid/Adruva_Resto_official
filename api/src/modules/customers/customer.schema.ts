import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const earnPointsSchema = z.object({
  customer_id: z.string().uuid(),
  bill_id: z.string().uuid(),
  points: z.number().int().min(1),
});

export const redeemPointsSchema = z.object({
  customer_id: z.string().uuid(),
  points: z.number().int().min(1),
  order_id: z.string().uuid(),
});
