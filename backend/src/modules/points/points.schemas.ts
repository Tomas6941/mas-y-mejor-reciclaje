import { z } from 'zod';

export const materialKeySchema = z.enum([
  'papel',
  'plastico',
  'vidrio',
  'metal',
  'organico',
  'electronicos',
  'pilas',
]);

export const pointTypeSchema = z.enum(['green_point', 'container']);
export const pointStatusSchema = z.enum(['available', 'near-full', 'full', 'damaged']);

export const pointListQuerySchema = z.object({
  material: materialKeySchema.optional(),
  type: pointTypeSchema.optional(),
  status: pointStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().trim().min(1).max(80).optional(),
});

export const pointIdParamsSchema = z.object({
  id: z.string().trim().min(1).max(80),
});

export type PointListQuery = z.infer<typeof pointListQuerySchema>;
