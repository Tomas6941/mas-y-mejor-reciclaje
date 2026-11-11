import { and, asc, eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';

import {
  collectionScheduleDays,
  collectionSchedules,
  neighborhoods,
} from '../../db/schema/index.js';
import { neighborhoodIdParamsSchema } from './schedules.schemas.js';

export const scheduleRoutes: FastifyPluginAsync = async (app) => {
  app.get('/neighborhoods', {
    schema: { tags: ['schedules'], summary: 'List active Córdoba neighborhoods' },
  }, async () => {
    const data = await app.db
      .select({ id: neighborhoods.slug, name: neighborhoods.name })
      .from(neighborhoods)
      .where(eq(neighborhoods.isActive, true))
      .orderBy(asc(neighborhoods.name));

    return { data };
  });

  app.get('/neighborhoods/:id/schedules', {
    schema: {
      tags: ['schedules'],
      summary: 'Get collection schedules for a neighborhood',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', maxLength: 80 } } },
    },
  }, async (request, reply) => {
    const parsed = neighborhoodIdParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.code(400).send({
        error: { code: 'INVALID_NEIGHBORHOOD_ID', message: 'El barrio indicado no es válido.', requestId: request.id },
      });
    }

    const [neighborhood] = await app.db
      .select({ id: neighborhoods.id, slug: neighborhoods.slug, name: neighborhoods.name })
      .from(neighborhoods)
      .where(and(eq(neighborhoods.slug, parsed.data.id), eq(neighborhoods.isActive, true)))
      .limit(1);

    if (!neighborhood) {
      return reply.code(404).send({
        error: { code: 'NEIGHBORHOOD_NOT_FOUND', message: 'No encontramos ese barrio.', requestId: request.id },
      });
    }

    const scheduleRows = await app.db
      .select({
        id: collectionSchedules.id,
        key: collectionSchedules.key,
        name: collectionSchedules.name,
        icon: collectionSchedules.icon,
        color: collectionSchedules.color,
        description: collectionSchedules.description,
        startTime: collectionSchedules.startTime,
        endTime: collectionSchedules.endTime,
        weekday: collectionScheduleDays.weekday,
      })
      .from(collectionSchedules)
      .leftJoin(
        collectionScheduleDays,
        eq(collectionSchedules.id, collectionScheduleDays.scheduleId),
      )
      .where(and(
        eq(collectionSchedules.neighborhoodId, neighborhood.id),
        eq(collectionSchedules.isActive, true),
      ))
      .orderBy(asc(collectionSchedules.key), asc(collectionScheduleDays.weekday));

    const bySchedule = new Map<string, {
      key: string;
      name: string;
      icon: 'recycle' | 'leaf' | 'trash';
      color: string;
      description: string;
      days: number[];
      time: string;
      startTime: string;
    }>();

    for (const row of scheduleRows) {
      const schedule = bySchedule.get(row.id) ?? {
        key: row.key,
        name: row.name,
        icon: row.icon,
        color: row.color,
        description: row.description,
        days: [],
        time: `${formatTime(row.startTime)} a ${formatTime(row.endTime)}`,
        startTime: formatTime(row.startTime),
      };
      if (row.weekday !== null) schedule.days.push(row.weekday);
      bySchedule.set(row.id, schedule);
    }

    return { data: { neighborhood: neighborhood.name, schedules: [...bySchedule.values()] } };
  });
};

function formatTime(value: string): string {
  return value.slice(0, 5);
}
