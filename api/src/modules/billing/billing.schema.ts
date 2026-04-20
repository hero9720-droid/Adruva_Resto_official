import { z } from 'zod';

export const createBillSchema = z.object({
  order_ids: z.array(z.string().uuid()).min(1),
  discount_paise: z.number().int().min(0).default(0),
  discount_reason: z.string().optional().nullable(),
  service_charge_paise: z.number().int().min(0).default(0),
  tax_paise: z.number().int().min(0).default(0),
});

export const recordPaymentSchema = z.object({
  bill_id: z.string().uuid(),
  payment_method: z.enum(['cash', 'card', 'upi', 'on_account', 'complimentary']),
  amount_paise: z.number().int().min(1),
  transaction_id: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const splitBillSchema = z.object({
  bill_id: z.string().uuid(),
  split_type: z.enum(['equal', 'by_item']),
  num_splits: z.number().int().min(2).optional(),
});
