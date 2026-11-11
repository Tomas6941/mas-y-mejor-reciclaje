import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import type { AppEnv } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import type { EmailProvider } from '../../lib/email.js';
import { SmtpEmailProvider } from '../../lib/email.js';
import { emailSchema, loginSchema, registerSchema, resetPasswordSchema, tokenSchema } from './auth.schemas.js';
import { AuthService } from './auth.service.js';
import { createRequireUser, getSessionCookieName } from './require-user.js';

interface AuthRoutesOptions {
  env: AppEnv;
  emailProvider?: EmailProvider;
}

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const authRoutes: FastifyPluginAsync<AuthRoutesOptions> = async (app, options) => {
  const provider = options.emailProvider ?? createEmailProvider(options.env);
  const auth = new AuthService({ db: app.db, env: options.env, emailProvider: provider });
  const cookieName = getSessionCookieName(options.env);
  const requireUser = createRequireUser(options.env);

  app.post('/auth/register', {
    config: { rateLimit: { max: 5, timeWindow: 60 * 60 * 1000 } },
    schema: { tags: ['auth'], summary: 'Create a user account' },
  }, async (request, reply) => {
    const body = parseBody(registerSchema, request.body);
    const user = await auth.register(body);
    return reply.code(201).send({ data: { user, verificationRequired: true } });
  });

  app.post('/auth/login', {
    config: { rateLimit: { max: 10, timeWindow: 60 * 1000 } },
    schema: { tags: ['auth'], summary: 'Create a user session' },
  }, async (request, reply) => {
    const body = parseBody(loginSchema, request.body);
    const result = await auth.login(body);
    reply.setCookie(cookieName, result.sessionToken, {
      httpOnly: true,
      secure: options.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return { data: { user: result.user } };
  });

  app.get('/auth/me', {
    preHandler: requireUser,
    schema: { tags: ['auth'], summary: 'Get the current session user' },
  }, async (request) => ({ data: { user: request.authUser } }));

  app.post('/auth/logout', {
    schema: { tags: ['auth'], summary: 'Revoke the current session' },
  }, async (request, reply) => {
    await auth.logout(request.cookies[cookieName]);
    reply.clearCookie(cookieName, {
      httpOnly: true,
      secure: options.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return { data: { loggedOut: true } };
  });

  app.post('/auth/verify-email', {
    config: { rateLimit: { max: 10, timeWindow: 60 * 60 * 1000 } },
    schema: { tags: ['auth'], summary: 'Verify an email address' },
  }, async (request) => {
    const { token } = parseBody(tokenSchema, request.body);
    await auth.verifyEmail(token);
    return { data: { verified: true } };
  });

  app.post('/auth/resend-verification', {
    config: { rateLimit: { max: 3, timeWindow: 60 * 60 * 1000 } },
    schema: { tags: ['auth'], summary: 'Resend the verification email' },
  }, async (request, reply) => {
    const { email } = parseBody(emailSchema, request.body);
    await auth.resendVerification(email);
    return reply.code(202).send(replyAccepted());
  });

  app.post('/auth/forgot-password', {
    config: { rateLimit: { max: 3, timeWindow: 60 * 60 * 1000 } },
    schema: { tags: ['auth'], summary: 'Request a password reset link' },
  }, async (request, reply) => {
    const { email } = parseBody(emailSchema, request.body);
    await auth.requestPasswordReset(email);
    return reply.code(202).send(replyAccepted());
  });

  app.post('/auth/reset-password', {
    config: { rateLimit: { max: 5, timeWindow: 60 * 60 * 1000 } },
    schema: { tags: ['auth'], summary: 'Set a new password using a reset link' },
  }, async (request) => {
    const { token, password } = parseBody(resetPasswordSchema, request.body);
    await auth.resetPassword(token, password);
    return { data: { passwordReset: true } };
  });
};

function createEmailProvider(env: AppEnv): EmailProvider {
  if (env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM) return SmtpEmailProvider.fromEnv(env);
  return {
    async send() {
      throw new AppError(503, 'EMAIL_UNAVAILABLE', 'El envío de correo no está configurado.');
    },
  };
}

function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Revisá los datos ingresados.';
    throw new AppError(400, 'VALIDATION_ERROR', message);
  }
  return parsed.data;
}

function replyAccepted() {
  return { data: { accepted: true } };
}
