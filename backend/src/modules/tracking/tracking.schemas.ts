import { z } from 'zod';

export const materialSchema = z.enum([
  'papel',
  'plastico',
  'vidrio',
  'metal',
  'organico',
  'electronicos',
  'pilas',
]);

const localDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
  }, 'La fecha no es válida.')
  .refine((value) => value <= todayInCordoba(), 'La fecha no puede ser futura.');

export const trackingEntrySchema = z.object({
  material: materialSchema,
  kg: z.coerce.number().finite().gt(0).max(1000),
  date: localDateSchema,
});

export const trackingIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export function todayInCordoba(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Cordoba',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
