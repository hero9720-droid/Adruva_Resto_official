import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1).max(200),
  parent_id: z.string().uuid().optional().nullable(),
  icon: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
  tax_slab_id: z.string().uuid().optional().nullable(),
});

export const menuItemSchema = z.object({
  category_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
  base_price_paise: z.number().int().nonnegative(),
  cost_price_paise: z.number().int().nonnegative().default(0),
  food_type: z.enum(['veg', 'non_veg', 'egg', 'vegan']).default('veg'),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  preparation_time_minutes: z.number().int().min(0).default(15),
  sort_order: z.number().int().default(0),
  tax_slab_id: z.string().uuid().optional().nullable(),
});

export const variantSchema = z.object({
  name: z.string().min(1).max(100),
  price_paise: z.number().int().nonnegative(),
  is_default: z.boolean().default(false),
});

export const modifierSchema = z.object({
  name: z.string().min(1).max(100),
  extra_price_paise: z.number().int().nonnegative().default(0),
});

export const modifierGroupSchema = z.object({
  name: z.string().min(1).max(100),
  is_required: z.boolean().default(false),
  min_select: z.number().int().min(0).default(0),
  max_select: z.number().int().min(1).default(1),
  modifiers: z.array(modifierSchema),
});
