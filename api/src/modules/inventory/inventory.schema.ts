import { z } from 'zod';

export const ingredientSchema = z.object({
  category_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(200),
  unit: z.enum(['kg', 'gm', 'ltr', 'ml', 'pcs', 'box', 'pkt']),
  current_stock: z.number().nonnegative().default(0),
  min_stock_level: z.number().nonnegative().default(0),
  cost_per_unit_paise: z.number().int().nonnegative().default(0),
  supplier_id: z.string().uuid().optional().nullable(),
});

export const stockMovementSchema = z.object({
  ingredient_id: z.string().uuid(),
  type: z.enum(['purchase', 'waste', 'adjustment', 'return', 'kitchen_use']),
  quantity: z.number(),
  reason: z.string().optional().nullable(),
  unit_cost_paise: z.number().int().nonnegative().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(1).max(200),
  contact_person: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
});
