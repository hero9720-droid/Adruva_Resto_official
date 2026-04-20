import { z } from 'zod';

export const outletSettingsSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  currency: z.string().default('INR'),
  tax_percentage: z.number().min(0).max(100).default(5),
  service_charge_percentage: z.number().min(0).max(100).default(0),
  receipt_header: z.string().optional().nullable(),
  receipt_footer: z.string().optional().nullable(),
  opening_time: z.string().optional().nullable(),
  closing_time: z.string().optional().nullable(),
});

export const floorZoneSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional().nullable(),
});
