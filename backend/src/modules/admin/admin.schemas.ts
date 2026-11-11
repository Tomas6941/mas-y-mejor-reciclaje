import { z } from 'zod';

export const adminPointIdSchema = z.object({
  id: z.string().trim().min(1).max(80),
});

const pointInputSchema = z.object({
  id: z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(160),
  address: z.string().trim().min(1).max(240),
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  type: z.enum(['green_point', 'container']),
  status: z.enum(['available', 'near-full', 'full', 'damaged']),
  hours: z.string().trim().min(1).max(160),
  materials: z.array(z.enum(['papel', 'plastico', 'vidrio', 'metal', 'organico', 'electronicos', 'pilas'])).max(7),
});

export const adminCreatePointSchema = pointInputSchema;
export const adminUpdatePointSchema = pointInputSchema.omit({ id: true }).partial().refine(
  (value) => Object.keys(value).length > 0,
  'Incluí al menos un campo para actualizar.',
);

const scheduleInputSchema = z.object({
  key: z.string().trim().min(1).max(48).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(100),
  icon: z.enum(['recycle', 'leaf', 'trash']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  description: z.string().trim().min(1).max(300),
  startTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  days: z.array(z.number().int().min(0).max(6)).max(7),
});

export const adminNeighborhoodParamsSchema = z.object({
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const adminSchedulesSchema = z.object({
  name: z.string().trim().min(1).max(100),
  schedules: z.array(scheduleInputSchema).max(20),
}).refine((value) => new Set(value.schedules.map((item) => item.key)).size === value.schedules.length, {
  message: 'Los horarios no pueden repetir claves.',
});
