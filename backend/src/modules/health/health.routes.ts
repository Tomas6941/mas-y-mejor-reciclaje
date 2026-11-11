import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({ status: 'ok' as const }));

  app.get('/health/ready', async (_request, reply) => {
    if (!app.hasDecorator('pgPool')) {
      return reply.code(503).send({ status: 'unavailable' as const });
    }

    try {
      await app.pgPool.query('select 1');
      return { status: 'ready' as const };
    } catch {
      return reply.code(503).send({ status: 'unavailable' as const });
    }
  });
};
