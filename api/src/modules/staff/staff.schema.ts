import { z } from 'zod';

export const attendanceSchema = z.object({
  clock_in_time: z.string().datetime().optional(),
  clock_out_time: z.string().datetime().optional(),
  notes: z.string().optional().nullable(),
});

export const shiftSchema = z.object({
  opening_cash_paise: z.number().int().min(0),
  closing_cash_paise: z.number().int().min(0).optional(),
  notes: z.string().optional().nullable(),
});
