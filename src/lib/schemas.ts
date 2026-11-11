import { z } from 'zod';

import { REPORT_COMMENT_MAX, TRACKING_KG_MAX } from '@/data/constants';
import { isoToDate, todayISO } from '@/lib/dates';

import type { MaterialKey, ReportType } from '@/types/domain';

/** ----- Formulario de reporte ----- */

export const reportSchema = z.object({
  pointId: z.string().min(1, 'Elegí el punto o contenedor que querés reportar.'),
  type: z.enum(['full', 'damaged', 'available'], {
    errorMap: () => ({ message: 'Seleccioná cómo está el contenedor.' }),
  }),
  comment: z.string().trim().max(REPORT_COMMENT_MAX).optional().default(''),
});

export type ReportFormValues = z.infer<typeof reportSchema>;

/** ----- Formulario de seguimiento ----- */

const MATERIAL_KEYS_SCHEMA = [
  'papel',
  'plastico',
  'vidrio',
  'metal',
  'organico',
  'electronicos',
  'pilas',
] as const satisfies readonly MaterialKey[];

/** Parsea "2,4" y "2.4" a 2.4, como el sitio original. */
export const kgSchema = z
  .string()
  .trim()
  .min(1, 'Ingresá una cantidad mayor a 0 kg.')
  .transform((value) => value.replace(',', '.'))
  .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
    message: 'Ingresá una cantidad mayor a 0 kg.',
  })
  .transform((value) => Number(value))
  .refine((value) => value <= TRACKING_KG_MAX, {
    message: `Por ahora podés registrar hasta ${TRACKING_KG_MAX} kg por vez.`,
  });

export const trackingDateSchema = z
  .string()
  .min(1, 'Elegí la fecha del registro.')
  .refine((value) => isoToDate(value) !== null, { message: 'La fecha no es válida.' })
  .refine((value) => value <= todayISO(), { message: 'La fecha no puede ser futura.' });

export const trackingSchema = z.object({
  material: z.enum(MATERIAL_KEYS_SCHEMA, {
    errorMap: () => ({ message: 'Elegí el material que reciclaste.' }),
  }),
  kg: kgSchema,
  date: trackingDateSchema,
});

export type TrackingFormValues = z.infer<typeof trackingSchema>;

/** ----- Formulario de contacto (feedback) ----- */

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Contanos tu nombre (mínimo 2 letras).').max(60),
  email: z.string().trim().email('Ingresá un email válido.').max(120),
  message: z.string().trim().min(10, 'Escribinos al menos 10 caracteres.').max(500),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

/** Tipos auxiliares de dominio reutilizados por los formularios. */
export type { MaterialKey, ReportType };
