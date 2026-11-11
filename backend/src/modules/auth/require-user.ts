import { createHmac } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import type { FastifyRequest, preHandlerHookHandler } from 'fastify';

import type { AppEnv } from '../../config/env.js';
import { sessions, users } from '../../db/schema/index.js';
import { AppError } from '../../lib/errors.js';
import type { AuthenticatedUser } from './auth.types.js';

export function getSessionCookieName(env: AppEnv): string {
  return env.NODE_ENV === 'production' ? '__Host-ecopunto_session' : 'ecopunto_session';
}

export function hashSessionToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token, 'utf8').digest('hex');
}

async function loadAuthenticatedUser(request: FastifyRequest, env: AppEnv): Promise<AuthenticatedUser> {
    const cookieName = getSessionCookieName(env);
    const token = request.cookies[cookieName];
    if (!token) throw new AppError(401, 'UNAUTHENTICATED', 'Iniciá sesión para continuar.');

    const tokenHash = hashSessionToken(token, env.SESSION_SECRET);
    const now = new Date();
    const [row] = await request.server.db
      .select({
        sessionId: sessions.id,
        userId: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
        emailVerifiedAt: users.emailVerifiedAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
      .limit(1);

    if (!row || row.status !== 'active') {
      throw new AppError(401, 'UNAUTHENTICATED', 'La sesión venció. Iniciá sesión de nuevo.');
    }

    const authUser = {
      id: row.userId,
      email: row.email,
      role: row.role,
      emailVerifiedAt: row.emailVerifiedAt,
    } satisfies AuthenticatedUser;
    request.authUser = authUser;

    void request.server.db
      .update(sessions)
      .set({ lastUsedAt: now })
      .where(eq(sessions.id, row.sessionId))
      .catch(() => undefined);
    return authUser;
}

export function createRequireUser(env: AppEnv): preHandlerHookHandler {
  return async (request) => {
    await loadAuthenticatedUser(request, env);
  };
}

export function createRequireVerifiedUser(env: AppEnv): preHandlerHookHandler {
  return async (request) => {
    const user = await loadAuthenticatedUser(request, env);
    if (!user.emailVerifiedAt) {
      throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Confirmá tu correo para usar esta función.');
    }
  };
}

export function createRequireAdmin(env: AppEnv): preHandlerHookHandler {
  return async (request) => {
    const user = await loadAuthenticatedUser(request, env);
    if (user.role !== 'admin') {
      throw new AppError(403, 'FORBIDDEN', 'No tenés permisos para realizar esta acción.');
    }
  };
}
