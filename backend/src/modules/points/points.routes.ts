import { and, asc, eq, gt, inArray, type SQL } from 'drizzle-orm';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';

import { materials, pointMaterials, points } from '../../db/schema/index.js';
import { pointIdParamsSchema, pointListQuerySchema } from './points.schemas.js';

const pointSelection = {
  internalId: points.id,
  id: points.publicId,
  name: points.name,
  address: points.address,
  lat: points.latitude,
  lng: points.longitude,
  type: points.type,
  status: points.status,
  hours: points.hours,
};

interface SelectedPoint {
  internalId: string;
  id: string;
  name: string;
  address: string;
  lat: string;
  lng: string;
  type: 'green_point' | 'container';
  status: 'available' | 'near-full' | 'full' | 'damaged';
  hours: string;
}

export const pointRoutes: FastifyPluginAsync = async (app) => {
  app.get('/points', {
    schema: {
      tags: ['points'],
      summary: 'List public recycling points',
      querystring: {
        type: 'object',
        properties: {
          material: { type: 'string', enum: ['papel', 'plastico', 'vidrio', 'metal', 'organico', 'electronicos', 'pilas'] },
          type: { type: 'string', enum: ['green_point', 'container'] },
          status: { type: 'string', enum: ['available', 'near-full', 'full', 'damaged'] },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          cursor: { type: 'string', maxLength: 80 },
        },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    const parsed = pointListQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({
        error: { code: 'INVALID_QUERY', message: 'Los filtros del mapa no son válidos.', requestId: request.id },
      });
    }

    const { material, type, status, limit, cursor } = parsed.data;
    const filters: SQL[] = [];
    filters.push(eq(points.isActive, true));
    if (type) filters.push(eq(points.type, type));
    if (status) filters.push(eq(points.status, status));
    if (cursor) filters.push(gt(points.publicId, cursor));
    if (material) {
      const matchingPointIds = app.db
        .select({ pointId: pointMaterials.pointId })
        .from(pointMaterials)
        .where(eq(pointMaterials.materialKey, material));
      filters.push(inArray(points.id, matchingPointIds));
    }

    const rows = await app.db
      .select(pointSelection)
      .from(points)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(asc(points.publicId))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;
    const data = await addMaterials(app, pageRows);

    return {
      data,
      page: {
        limit,
        nextCursor: hasMore ? pageRows.at(-1)?.id ?? null : null,
      },
    };
  });

  app.get('/points/:id', {
    schema: {
      tags: ['points'],
      summary: 'Get a public recycling point',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', maxLength: 80 } } },
    },
  }, async (request, reply) => {
    const parsed = pointIdParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.code(400).send({
        error: { code: 'INVALID_POINT_ID', message: 'El identificador del punto no es válido.', requestId: request.id },
      });
    }

    const [point] = await app.db
      .select(pointSelection)
      .from(points)
      .where(and(eq(points.publicId, parsed.data.id), eq(points.isActive, true)))
      .limit(1);

    if (!point) {
      return reply.code(404).send({
        error: { code: 'POINT_NOT_FOUND', message: 'No encontramos ese punto de reciclaje.', requestId: request.id },
      });
    }

    const [record] = await addMaterials(app, [point]);
    return { data: record };
  });
};

async function addMaterials(
  app: FastifyInstance,
  pointRows: SelectedPoint[],
) {
  if (pointRows.length === 0) return [];

  const pointIds = pointRows.map((point) => point.internalId);

  const materialRows = pointIds.length
    ? await app.db
        .select({ pointId: pointMaterials.pointId, key: materials.key })
        .from(pointMaterials)
        .innerJoin(materials, eq(pointMaterials.materialKey, materials.key))
        .where(inArray(pointMaterials.pointId, pointIds))
        .orderBy(asc(materials.sortOrder))
    : [];

  const materialKeysByPoint = new Map<string, string[]>();
  for (const row of materialRows) {
    const keys = materialKeysByPoint.get(row.pointId) ?? [];
    keys.push(row.key);
    materialKeysByPoint.set(row.pointId, keys);
  }

  return pointRows.map((point) => ({
    id: point.id,
    name: point.name,
    address: point.address,
    lat: Number(point.lat),
    lng: Number(point.lng),
    type: point.type === 'green_point' ? 'Punto verde' : 'Contenedor',
    materials: materialKeysByPoint.get(point.internalId) ?? [],
    status: point.status,
    hours: point.hours,
  }));
}
