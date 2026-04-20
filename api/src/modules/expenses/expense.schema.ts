import { z } from 'zod';

export const expenseCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
});

export const expenseSchema = z.object({
  category_id: z.string().uuid(),
  amount_paise: z.number().int().min(1),
  description: z.string().min(1),
  expense_date: z.string().datetime().optional(),
  payment_method: z.enum(['cash', 'bank_transfer', 'card', 'upi']),
  attachment_url: z.string().url().optional().nullable(),
});
