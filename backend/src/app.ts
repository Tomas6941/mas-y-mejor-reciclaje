import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify, { LogController, type FastifyInstance } from 'fastify';

import type { AppEnv } from './config/env.js';
import { AppError } from './lib/errors.js';
import { databasePlugin } from './plugins/database.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { pointRoutes } from './modules/points/points.routes.js';
import { scheduleRoutes } from './modules/schedules/schedules.routes.js';
import { trackingRoutes } from './modules/tracking/tracking.routes.js';
import { quizRoutes } from './modules/quiz/quiz.routes.js';
import { preferenceRoutes } from './modules/preferences/preferences.routes.js';
import { reportRoutes } from './modules/reports/reports.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { adminUserRoutes } from './modules/admin/admin-users.routes.js';
import { healthRoutes } from './modules/health/health.routes.js';

export interface BuildAppOptions {
  env?: AppEnv;
  logger?: boolean;
}

export async function buildApp({ env, logger = true }: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: logger
      ? {
          redact: {
            paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie'],
            censor: '[REDACTED]',
          },
        }
      : false,
    bodyLimit: 3_000_000,
    requestIdHeader: 'x-request-id',
    logController: new LogController({ requestIdLogLabel: 'requestId' }),
  });

  const allowedOrigin = env?.WEB_ORIGIN ?? 'http://localhost:5173';

  await app.register(helmet, { global: true });
  await app.register(cors, { origin: allowedOrigin, credentials: true });
  await app.register(cookie);
  await app.register(rateLimit, { global: true, max: 120, timeWindow: '1 minute' });
  await app.register(swagger, {
    openapi: {
      info: { title: 'EcoPunto API', version: '1.0.0' },
      servers: [{ url: '/api/v1' }],
    },
  });
  if (env?.NODE_ENV !== 'production') {
    await app.register(swaggerUi, { routePrefix: '/api/docs' });
  }
  app.decorateRequest('authUser', null);

  app.setErrorHandler((error, request, reply) => {
    const normalizedError = error instanceof Error ? error : new Error('Unknown request error');
    const statusCandidate =
      'statusCode' in normalizedError && typeof normalizedError.statusCode === 'number'
        ? normalizedError.statusCode
        : undefined;
    const statusCode = error instanceof AppError
      ? error.statusCode
      : statusCandidate && statusCandidate >= 400
        ? statusCandidate
        : 500;
    const code = error instanceof AppError
      ? error.code
      : statusCode >= 500
        ? 'INTERNAL_ERROR'
        : 'REQUEST_ERROR';

    if (statusCode >= 500) {
      request.log.error({ requestId: request.id, errorName: normalizedError.name }, 'Request failed');
    }

    return reply.status(statusCode).send({
      error: {
        code,
        message: error instanceof AppError
          ? error.message
          : statusCode >= 500
            ? 'Ocurrió un error inesperado.'
            : 'La solicitud no es válida.',
        requestId: request.id,
      },
    });
  });

  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      error: { code: 'NOT_FOUND', message: 'No encontramos ese recurso.', requestId: request.id },
    });
  });

  if (env?.DATABASE_URL) {
    await app.register(databasePlugin, { connectionString: env.DATABASE_URL });
    app.addHook('onRequest', async (request) => {
      const method = request.method.toUpperCase();
      const isReadOnly = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
      if (!isReadOnly && request.headers.origin && request.headers.origin !== allowedOrigin) {
        throw new AppError(403, 'INVALID_ORIGIN', 'La solicitud no es válida.');
      }
    });
    await app.register(authRoutes, { prefix: '/api/v1', env });
    await app.register(pointRoutes, { prefix: '/api/v1' });
    await app.register(scheduleRoutes, { prefix: '/api/v1' });
    await app.register(trackingRoutes, { prefix: '/api/v1', env });
    await app.register(quizRoutes, { prefix: '/api/v1', env });
    await app.register(preferenceRoutes, { prefix: '/api/v1', env });
    await app.register(reportRoutes, { prefix: '/api/v1', env });
    await app.register(adminRoutes, { prefix: '/api/v1', env });
    await app.register(adminUserRoutes, { prefix: '/api/v1', env });
  }

  await app.register(healthRoutes, { prefix: '/api/v1' });
  return app;
}
