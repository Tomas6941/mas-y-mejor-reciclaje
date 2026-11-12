import { z } from 'zod';

export const createReportSchema = z.object({
  category: z.enum(['container_status', 'suggestion']),
  pointId: z.string().trim().max(80).optional().default(''),
  type: z.enum(['full', 'damaged', 'available', 'move_point', 'add_point', 'remove_point']),
  comment: z.string().trim().max(500).default(''),
  suggestedLocation: z.string().trim().max(240).optional().default(''),
  imageData: z.string().max(2_800_000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/).optional(),
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
  if (value.category === 'suggestion' && value.type === 'add_point' && value.suggestedLocation.length < 4) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['suggestedLocation'], message: 'Indicá dónde sugerís instalarlo.' });
  }
});

export const reportListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().trim().min(1).max(200).optional(),
});

export const reportReviewSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
});

export const adminReportQueueQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const reportIdParamsSchema = z.object({
  id: z.string().uuid(),
});
