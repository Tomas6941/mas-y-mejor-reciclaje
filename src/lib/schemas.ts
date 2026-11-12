import { z } from 'zod';

import { TRACKING_KG_MAX } from '@/data/constants';
import { isoToDate, todayISO } from '@/lib/dates';

import type { MaterialKey, ReportType } from '@/types/domain';

/** ----- Formulario de reporte ----- */

export const reportSchema = z.object({
  category: z.enum(['container_status', 'suggestion']),
  pointId: z.string().optional().default(''),
  type: z.enum(['full', 'damaged', 'available', 'move_point', 'add_point', 'remove_point']),
  comment: z.string().trim().max(500).optional().default(''),
  suggestedLocation: z.string().trim().max(240).optional().default(''),
  imageData: z.string().max(2_800_000).optional(),
}).superRefine((value, context) => {
  const statusType = ['full', 'damaged', 'available'].includes(value.type);
  if (value.category === 'container_status' && (!value.pointId || !statusType)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['pointId'], message: 'Elegí un punto y su estado.' });
  }
  if (value.category === 'suggestion' && statusType) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['type'], message: 'Elegí una sugerencia válida.' });
  }
  if (value.category === 'suggestion' && value.type !== 'add_point' && !value.pointId) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['pointId'], message: 'Elegí el punto relacionado.' });
  }
  if (value.category === 'suggestion' && value.type === 'add_point' && value.suggestedLocation.trim().length < 4) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['suggestedLocation'], message: 'Indicá dónde sugerís instalarlo.' });
  }
  if (value.imageData && !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value.imageData)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['imageData'], message: 'La imagen debe ser JPG.' });
  }
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
