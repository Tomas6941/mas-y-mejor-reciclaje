import { z } from 'zod';

export const neighborhoodPreferenceSchema = z.object({
  neighborhood: z.string().trim().min(1).max(80).optional(),
  reminderEnabled: z.boolean().optional(),
}).refine((value) => value.neighborhood !== undefined || value.reminderEnabled !== undefined);
