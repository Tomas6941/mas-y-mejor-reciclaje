import { and, desc, eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';

import type { AppEnv } from '../../config/env.js';
import { trackingEntries } from '../../db/schema/index.js';
import { AppError } from '../../lib/errors.js';
import { createRequireVerifiedUser } from '../auth/require-user.js';
import { trackingEntrySchema, trackingIdParamsSchema } from './tracking.schemas.js';

interface PersonalRoutesOptions {
  env: AppEnv;
}

export const trackingRoutes: FastifyPluginAsync<PersonalRoutesOptions> = async (app, options) => {
  const requireVerifiedUser = createRequireVerifiedUser(options.env);

  app.get('/me/tracking', { preHandler: requireVerifiedUser }, async (request) => {
    const rows = await app.db
      .select({
        id: trackingEntries.id,
        material: trackingEntries.materialKey,
        kg: trackingEntries.kilograms,
        date: trackingEntries.recordDate,
      })
      .from(trackingEntries)
      .where(eq(trackingEntries.userId, request.authUser!.id))
      .orderBy(desc(trackingEntries.recordDate), desc(trackingEntries.createdAt));

    return {
      data: rows.map((row) => ({ ...row, kg: Number(row.kg) })),
    };
  });

  app.post('/me/tracking', { preHandler: requireVerifiedUser }, async (request, reply) => {
    const parsed = trackingEntrySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(400, 'INVALID_TRACKING_ENTRY', 'Revisá el material, los kilos y la fecha.');
    }

    const [created] = await app.db
      .insert(trackingEntries)
      .values({
        userId: request.authUser!.id,
        materialKey: parsed.data.material,
        kilograms: parsed.data.kg.toFixed(2),
        recordDate: parsed.data.date,
      })
      .returning({
        id: trackingEntries.id,
        material: trackingEntries.materialKey,
        kg: trackingEntries.kilograms,
        date: trackingEntries.recordDate,
      });

    return reply.code(201).send({
      data: { ...created, kg: Number(created!.kg) },
    });
  });

  app.delete('/me/tracking/:id', { preHandler: requireVerifiedUser }, async (request) => {
    const parsed = trackingIdParamsSchema.safeParse(request.params);
    if (!parsed.success) throw new AppError(400, 'INVALID_TRACKING_ID', 'El registro indicado no es válido.');

    const [deleted] = await app.db
      .delete(trackingEntries)
      .where(and(eq(trackingEntries.id, parsed.data.id), eq(trackingEntries.userId, request.authUser!.id)))
      .returning({ id: trackingEntries.id });
    if (!deleted) throw new AppError(404, 'TRACKING_ENTRY_NOT_FOUND', 'No encontramos ese registro.');

    return { data: { id: deleted.id, deleted: true } };
  });

  app.delete('/me/tracking', { preHandler: requireVerifiedUser }, async (request) => {
    const deleted = await app.db
      .delete(trackingEntries)
      .where(eq(trackingEntries.userId, request.authUser!.id))
      .returning({ id: trackingEntries.id });

    return { data: { deletedCount: deleted.length } };
  });
};
