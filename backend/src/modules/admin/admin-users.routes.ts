import type { FastifyPluginAsync } from 'fastify';

import type { AppEnv } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { createRequireAdmin } from '../auth/require-user.js';
import { adminUserIdSchema, promoteAdminSchema } from './admin-users.schemas.js';
import { listAdmins, promoteAdmin, revokeAdmin } from './admin-users.service.js';

interface AdminUserRoutesOptions {
  env: AppEnv;
}

export const adminUserRoutes: FastifyPluginAsync<AdminUserRoutesOptions> = async (app, options) => {
  const requireAdmin = createRequireAdmin(options.env);

  app.get('/admin/admins', {
    preHandler: requireAdmin,
    schema: { tags: ['admin'], summary: 'List active administrators' },
  }, async () => ({ data: await listAdmins(app.db) }));

  app.post('/admin/admins', {
    preHandler: requireAdmin,
    schema: { tags: ['admin'], summary: 'Promote an active verified account to administrator' },
  }, async (request, reply) => {
    const { email } = parse(promoteAdminSchema, request.body);
    if (!request.authUser) throw new AppError(401, 'UNAUTHENTICATED', 'Iniciá sesión para continuar.');
    const promoted = await promoteAdmin(app.db, request.authUser.id, email);
    return reply.code(201).send({ data: promoted });
  });

  app.delete('/admin/admins/:id', {
    preHandler: requireAdmin,
    schema: {
      tags: ['admin'],
      summary: 'Revoke administrator role from another administrator',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
    },
  }, async (request) => {
    const { id } = parse(adminUserIdSchema, request.params);
    if (!request.authUser) throw new AppError(401, 'UNAUTHENTICATED', 'Iniciá sesión para continuar.');
    return { data: await revokeAdmin(app.db, request.authUser.id, id) };
  });
};

function parse<T>(schema: import('zod').ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new AppError(400, 'VALIDATION_ERROR', result.error.issues[0]?.message ?? 'Revisá los datos ingresados.');
  return result.data;
}
