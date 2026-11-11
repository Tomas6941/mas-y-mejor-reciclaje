import { and, eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import type { AppEnv } from '../../config/env.js';
import {
  auditLog,
  collectionScheduleDays,
  collectionSchedules,
  neighborhoods,
  pointMaterials,
  points,
} from '../../db/schema/index.js';
import { AppError } from '../../lib/errors.js';
import { createRequireAdmin } from '../auth/require-user.js';
import {
  adminCreatePointSchema,
  adminNeighborhoodParamsSchema,
  adminPointIdSchema,
  adminSchedulesSchema,
  adminUpdatePointSchema,
} from './admin.schemas.js';

interface AdminRoutesOptions {
  env: AppEnv;
}

export const adminRoutes: FastifyPluginAsync<AdminRoutesOptions> = async (app, options) => {
  const requireAdmin = createRequireAdmin(options.env);

  app.post('/admin/points', { preHandler: requireAdmin }, async (request, reply) => {
    const input = parse(adminCreatePointSchema, request.body);
    const created = await app.db.transaction(async (tx) => {
      const [point] = await tx.insert(points).values({
        publicId: input.id,
        name: input.name,
        address: input.address,
        latitude: String(input.lat),
        longitude: String(input.lng),
        type: input.type,
        status: input.status,
        hours: input.hours,
      }).returning({ id: points.id, publicId: points.publicId });
      if (!point) throw new AppError(500, 'POINT_CREATE_FAILED', 'No se pudo guardar el punto.');
      if (input.materials.length > 0) {
        await tx.insert(pointMaterials).values(input.materials.map((materialKey) => ({
          pointId: point.id,
          materialKey,
        })));
      }
      await tx.insert(auditLog).values({
        actorId: request.authUser!.id,
        action: 'point.created',
        entityType: 'point',
        entityId: point.id,
      });
      return point;
    });

    return reply.code(201).send({ data: created });
  });

  app.patch('/admin/points/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = parse(adminPointIdSchema, request.params);
    const input = parse(adminUpdatePointSchema, request.body);
    const [existing] = await app.db.select({ id: points.id }).from(points).where(eq(points.publicId, id)).limit(1);
    if (!existing) throw new AppError(404, 'POINT_NOT_FOUND', 'No encontramos ese punto de reciclaje.');

    const updated = await app.db.transaction(async (tx) => {
      const pointUpdate: Partial<typeof points.$inferInsert> = { updatedAt: new Date() };
      if (input.name !== undefined) pointUpdate.name = input.name;
      if (input.address !== undefined) pointUpdate.address = input.address;
      if (input.lat !== undefined) pointUpdate.latitude = String(input.lat);
      if (input.lng !== undefined) pointUpdate.longitude = String(input.lng);
      if (input.type !== undefined) pointUpdate.type = input.type;
      if (input.status !== undefined) pointUpdate.status = input.status;
      if (input.hours !== undefined) pointUpdate.hours = input.hours;

      const [point] = await tx.update(points).set(pointUpdate).where(eq(points.id, existing.id)).returning({
        id: points.id,
        publicId: points.publicId,
        updatedAt: points.updatedAt,
      });
      if (!point) throw new AppError(404, 'POINT_NOT_FOUND', 'No encontramos ese punto de reciclaje.');

      if (input.materials !== undefined) {
        await tx.delete(pointMaterials).where(eq(pointMaterials.pointId, point.id));
        if (input.materials.length > 0) {
          await tx.insert(pointMaterials).values(input.materials.map((materialKey) => ({
            pointId: point.id,
            materialKey,
          })));
        }
      }
      await tx.insert(auditLog).values({
        actorId: request.authUser!.id,
        action: 'point.updated',
        entityType: 'point',
        entityId: point.id,
        details: { fields: Object.keys(input) },
      });
      return point;
    });

    return { data: updated };
  });

  app.delete('/admin/points/:id', { preHandler: requireAdmin }, async (request) => {
    const { id } = parse(adminPointIdSchema, request.params);
    const point = await app.db.transaction(async (tx) => {
      const [updated] = await tx.update(points)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(eq(points.publicId, id), eq(points.isActive, true)))
        .returning({ id: points.id, publicId: points.publicId });
      if (!updated) throw new AppError(404, 'POINT_NOT_FOUND', 'No encontramos ese punto activo.');

      await tx.insert(auditLog).values({
        actorId: request.authUser!.id,
        action: 'point.archived',
        entityType: 'point',
        entityId: updated.id,
      });
      return updated;
    });
    return { data: { id: point.publicId, archived: true } };
  });

  app.put('/admin/neighborhoods/:slug/schedules', { preHandler: requireAdmin }, async (request) => {
    const { slug } = parse(adminNeighborhoodParamsSchema, request.params);
    const input = parse(adminSchedulesSchema, request.body);
    const neighborhood = await app.db.transaction(async (tx) => {
      const [storedNeighborhood] = await tx.insert(neighborhoods)
        .values({ slug, name: input.name, isActive: true })
        .onConflictDoUpdate({
          target: neighborhoods.slug,
          set: { name: input.name, isActive: true, updatedAt: new Date() },
        })
        .returning({ id: neighborhoods.id, name: neighborhoods.name, slug: neighborhoods.slug });
      if (!storedNeighborhood) throw new AppError(500, 'NEIGHBORHOOD_SAVE_FAILED', 'No se pudo guardar el barrio.');

      await tx.delete(collectionSchedules).where(eq(collectionSchedules.neighborhoodId, storedNeighborhood.id));
      for (const schedule of input.schedules) {
        const [created] = await tx.insert(collectionSchedules).values({
          neighborhoodId: storedNeighborhood.id,
          key: schedule.key,
          name: schedule.name,
          icon: schedule.icon,
          color: schedule.color,
          description: schedule.description,
          startTime: `${schedule.startTime}:00`,
          endTime: `${schedule.endTime}:00`,
          isActive: true,
        }).returning({ id: collectionSchedules.id });
        if (!created) throw new AppError(500, 'SCHEDULE_SAVE_FAILED', 'No se pudo guardar el horario.');
        if (schedule.days.length > 0) {
          await tx.insert(collectionScheduleDays).values(schedule.days.map((weekday) => ({
            scheduleId: created.id,
            weekday,
          })));
        }
      }

      await tx.insert(auditLog).values({
        actorId: request.authUser!.id,
        action: 'neighborhood.schedules_replaced',
        entityType: 'neighborhood',
        entityId: storedNeighborhood.id,
        details: { scheduleCount: input.schedules.length },
      });
      return storedNeighborhood;
    });

    return { data: neighborhood };
  });

  app.delete('/admin/neighborhoods/:slug', { preHandler: requireAdmin }, async (request) => {
    const { slug } = parse(adminNeighborhoodParamsSchema, request.params);
    const neighborhood = await app.db.transaction(async (tx) => {
      const [updated] = await tx.update(neighborhoods)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(eq(neighborhoods.slug, slug), eq(neighborhoods.isActive, true)))
        .returning({ id: neighborhoods.id, slug: neighborhoods.slug });
      if (!updated) throw new AppError(404, 'NEIGHBORHOOD_NOT_FOUND', 'No encontramos ese barrio activo.');

      await tx.insert(auditLog).values({
        actorId: request.authUser!.id,
        action: 'neighborhood.archived',
        entityType: 'neighborhood',
        entityId: updated.id,
      });
      return updated;
    });
    return { data: { slug: neighborhood.slug, archived: true } };
  });
};

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', result.error.issues[0]?.message ?? 'Revisá los datos ingresados.');
  }
  return result.data;
}
