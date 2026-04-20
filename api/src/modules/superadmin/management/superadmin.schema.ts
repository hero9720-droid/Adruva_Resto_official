import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(2),
  monthly_price_paise: z.number().int().nonnegative(),
  annual_price_paise: z.number().int().nonnegative(),
  max_tables: z.number().int().positive(),
  max_staff: z.number().int().positive(),
  max_menu_items: z.number().int().positive(),
  max_orders_per_month: z.number().int().positive(),
  features: z.record(z.any()).optional(),
});

export const onboardChainSchema = z.object({
  chain_name: z.string().min(2),
  outlet_name: z.string().min(2),
  plan_id: z.string().uuid(),
  admin_name: z.string().min(2),
  admin_email: z.string().email(),
  admin_password: z.string().min(6),
});
