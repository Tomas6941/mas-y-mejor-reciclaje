import { z } from 'zod';

export const promoteAdminSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
});

export const adminUserIdSchema = z.object({
  id: z.string().uuid(),
});
