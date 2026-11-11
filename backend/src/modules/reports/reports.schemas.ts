import { z } from 'zod';

export const createReportSchema = z.object({
  pointId: z.string().trim().min(1).max(80),
  type: z.enum(['full', 'damaged', 'available']),
  comment: z.string().trim().max(180).default(''),
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
