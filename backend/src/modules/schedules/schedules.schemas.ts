import { z } from 'zod';

export const neighborhoodIdParamsSchema = z.object({
  id: z.string().trim().min(1).max(80),
});
