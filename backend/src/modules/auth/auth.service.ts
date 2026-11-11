import { randomBytes } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';

import type { AppEnv } from '../../config/env.js';
import type { Database } from '../../plugins/database.js';
import { authTokens, sessions, userProfiles, users } from '../../db/schema/index.js';
import { AppError, isPostgresUniqueViolation } from '../../lib/errors.js';
import type { EmailProvider } from '../../lib/email.js';
import { createAccountEmail } from '../../lib/email.js';
import { createOneTimeToken, hashOneTimeToken } from '../../lib/one-time-token.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { hashSessionToken } from './require-user.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';
import type { AuthenticatedUser } from './auth.types.js';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const VERIFY_TTL_MS = 60 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;

export interface AuthServiceOptions {
  db: Database;
  env: AppEnv;
  emailProvider: EmailProvider;
}

export class AuthService {
  private dummyHashPromise: Promise<string> | undefined;

  constructor(private readonly options: AuthServiceOptions) {}

  async register(input: RegisterInput): Promise<{ id: string; email: string; role: 'user' }> {
    const passwordHash = await hashPassword(input.password);
    const { token, tokenHash } = createOneTimeToken();
    const now = new Date();

    let user: { id: string; email: string; role: 'user' };
    try {
      user = await this.options.db.transaction(async (tx) => {
        const [created] = await tx
          .insert(users)
          .values({ email: input.email, passwordHash })
          .returning({ id: users.id, email: users.email, role: users.role });

        if (!created || created.role !== 'user') {
          throw new AppError(500, 'USER_CREATE_FAILED', 'No se pudo crear la cuenta.');
        }
        if (input.displayName) {
          await tx.insert(userProfiles).values({ userId: created.id, displayName: input.displayName });
        }

        await tx.insert(authTokens).values({
          userId: created.id,
          purpose: 'email_verification',
          tokenHash,
          expiresAt: new Date(now.getTime() + VERIFY_TTL_MS),
        });

        return { id: created.id, email: created.email, role: 'user' as const };
      });
    } catch (error) {
      if (isPostgresUniqueViolation(error)) {
        throw new AppError(409, 'EMAIL_IN_USE', 'No se pudo crear la cuenta con esos datos.');
      }
      throw error;
    }

    await this.sendAccountEmail(user.email, 'verification', token);
    return user;
  }

  async login(input: LoginInput): Promise<{ user: AuthenticatedUser; sessionToken: string }> {
    const [user] = await this.options.db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        role: users.role,
        status: users.status,
        emailVerifiedAt: users.emailVerifiedAt,
      })
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (!user) {
      await verifyPassword(await this.getDummyPasswordHash(), input.password);
      throw new AppError(401, 'INVALID_CREDENTIALS', 'El correo o la contraseña no son correctos.');
    }

    const passwordMatches = await verifyPassword(user.passwordHash, input.password);
    if (!passwordMatches || user.status !== 'active') {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'El correo o la contraseña no son correctos.');
    }

    const sessionToken = randomBytes(32).toString('base64url');
    const tokenHash = hashSessionToken(sessionToken, this.options.env.SESSION_SECRET);
    const now = new Date();
    await this.options.db.insert(sessions).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
      lastUsedAt: now,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt,
      },
      sessionToken,
    };
  }

  async logout(sessionToken: string | undefined): Promise<void> {
    if (!sessionToken) return;
    const tokenHash = hashSessionToken(sessionToken, this.options.env.SESSION_SECRET);
    await this.options.db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashOneTimeToken(token);
    const now = new Date();

    await this.options.db.transaction(async (tx) => {
      const [consumed] = await tx
        .update(authTokens)
        .set({ usedAt: now })
        .where(
          and(
            eq(authTokens.tokenHash, tokenHash),
            eq(authTokens.purpose, 'email_verification'),
            isNull(authTokens.usedAt),
            gt(authTokens.expiresAt, now),
          ),
        )
        .returning({ userId: authTokens.userId });

      if (!consumed) throw new AppError(400, 'INVALID_TOKEN', 'El enlace venció o ya fue utilizado.');
      await tx
        .update(users)
        .set({ emailVerifiedAt: now, updatedAt: now })
        .where(eq(users.id, consumed.userId));
    });
  }

  async resendVerification(email: string): Promise<void> {
    const [user] = await this.options.db
      .select({ id: users.id, email: users.email, emailVerifiedAt: users.emailVerifiedAt })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user || user.emailVerifiedAt) return;

    const token = await this.createAuthToken(user.id, 'email_verification', VERIFY_TTL_MS);
    await this.sendAccountEmail(user.email, 'verification', token, true);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const [user] = await this.options.db
      .select({ id: users.id, email: users.email, status: users.status })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user || user.status !== 'active') return;

    const token = await this.createAuthToken(user.id, 'password_reset', RESET_TTL_MS);
    await this.sendAccountEmail(user.email, 'password-reset', token, true);
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const passwordHash = await hashPassword(password);
    const tokenHash = hashOneTimeToken(token);
    const now = new Date();

    await this.options.db.transaction(async (tx) => {
      const [consumed] = await tx
        .update(authTokens)
        .set({ usedAt: now })
        .where(
          and(
            eq(authTokens.tokenHash, tokenHash),
            eq(authTokens.purpose, 'password_reset'),
            isNull(authTokens.usedAt),
            gt(authTokens.expiresAt, now),
          ),
        )
        .returning({ userId: authTokens.userId });

      if (!consumed) throw new AppError(400, 'INVALID_TOKEN', 'El enlace venció o ya fue utilizado.');
      await tx
        .update(users)
        .set({ passwordHash, updatedAt: now })
        .where(eq(users.id, consumed.userId));
      await tx.delete(sessions).where(eq(sessions.userId, consumed.userId));
    });
  }

  private async createAuthToken(
    userId: string,
    purpose: 'email_verification' | 'password_reset',
    ttlMs: number,
  ): Promise<string> {
    const { token, tokenHash } = createOneTimeToken();
    await this.options.db.transaction(async (tx) => {
      await tx
        .delete(authTokens)
        .where(and(eq(authTokens.userId, userId), eq(authTokens.purpose, purpose), isNull(authTokens.usedAt)));
      await tx.insert(authTokens).values({
        userId,
        purpose,
        tokenHash,
        expiresAt: new Date(Date.now() + ttlMs),
      });
    });
    return token;
  }

  private async sendAccountEmail(
    email: string,
    kind: 'verification' | 'password-reset',
    token: string,
    suppressFailure = false,
  ): Promise<void> {
    const route = kind === 'verification' ? 'confirmar-email' : 'restablecer-contrasena';
    const url = new URL('/', this.options.env.PUBLIC_APP_URL);
    url.hash = `/${route}?token=${encodeURIComponent(token)}`;

    try {
      await this.options.emailProvider.send({
        to: email,
        ...createAccountEmail(kind, url.toString()),
      });
    } catch {
      if (suppressFailure) return;
      throw new AppError(503, 'EMAIL_UNAVAILABLE', 'No pudimos enviar el correo. Probá de nuevo más tarde.');
    }
  }

  private getDummyPasswordHash(): Promise<string> {
    this.dummyHashPromise ??= hashPassword('invalid-account-password-value');
    return this.dummyHashPromise;
  }
}
