import type { userRoleEnum, users } from '../../db/schema/users.js';

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type UserRecord = typeof users.$inferSelect;

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  emailVerifiedAt: Date | null;
}

declare module 'fastify' {
  interface FastifyRequest {
    authUser: AuthenticatedUser | null;
  }
}
