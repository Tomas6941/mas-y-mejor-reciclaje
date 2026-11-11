import { and, desc, eq, lt, or } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import type { AppEnv } from '../../config/env.js';
import { auditLog, points, reports } from '../../db/schema/index.js';
import { AppError } from '../../lib/errors.js';
import { createRequireAdmin, createRequireVerifiedUser } from '../auth/require-user.js';
import {
  createReportSchema,
  adminReportQueueQuerySchema,
  reportIdParamsSchema,
  reportListQuerySchema,
  reportReviewSchema,
} from './reports.schemas.js';

interface ReportRoutesOptions {
  env: AppEnv;
}

interface ReportCursor {
  createdAt: Date;
  id: string;
}

export const reportRoutes: FastifyPluginAsync<ReportRoutesOptions> = async (app, options) => {
  const requireVerifiedUser = createRequireVerifiedUser(options.env);
  const requireAdmin = createRequireAdmin(options.env);

  app.get('/admin/reports', {
    preHandler: requireAdmin,
    schema: { tags: ['admin'], summary: 'List reports for moderation' },
  }, async (request) => {
    const query = parse(adminReportQueueQuerySchema, request.query);
    const rows = await app.db
      .select({
        id: reports.id,
        pointId: points.publicId,
        pointName: points.name,
        authorId: reports.authorId,
        type: reports.type,
        comment: reports.comment,
        status: reports.status,
        timestamp: reports.createdAt,
      })
      .from(reports)
      .innerJoin(points, eq(reports.pointId, points.id))
      .where(eq(reports.status, query.status ?? 'pending'))
      .orderBy(desc(reports.createdAt))
      .limit(query.limit ?? 50);
    return { data: rows };
  });

  app.get('/reports', {
    schema: { tags: ['reports'], summary: 'List approved community reports' },
  }, async (request) => {
    const query = parse(reportListQuerySchema, request.query);
    const limit = query.limit ?? 20;
    const cursor = query.cursor ? decodeCursor(query.cursor) : null;
    const cursorFilter = cursor
      ? or(
          lt(reports.createdAt, cursor.createdAt),
          and(eq(reports.createdAt, cursor.createdAt), lt(reports.id, cursor.id)),
        )
      : undefined;
    const rows = await app.db
      .select({
        id: reports.id,
        pointId: points.publicId,
        pointName: points.name,
        type: reports.type,
        comment: reports.comment,
        timestamp: reports.createdAt,
      })
      .from(reports)
      .innerJoin(points, eq(reports.pointId, points.id))
      .where(cursorFilter ? and(eq(reports.status, 'approved'), cursorFilter) : eq(reports.status, 'approved'))
      .orderBy(desc(reports.createdAt), desc(reports.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const last = data.at(-1);
    return {
      data,
      page: {
        limit,
        nextCursor: hasMore && last ? encodeCursor({ createdAt: last.timestamp, id: last.id }) : null,
      },
    };
  });

  app.post('/reports', {
    preHandler: requireVerifiedUser,
    config: { rateLimit: { max: 5, timeWindow: 60 * 60 * 1000 } },
    schema: { tags: ['reports'], summary: 'Submit a point status report' },
  }, async (request, reply) => {
    const input = parse(createReportSchema, request.body);
    const [point] = await app.db
      .select({ id: points.id, publicId: points.publicId })
      .from(points)
      .where(eq(points.publicId, input.pointId))
      .limit(1);
    if (!point) throw new AppError(404, 'POINT_NOT_FOUND', 'No encontramos ese punto de reciclaje.');
    if (!request.authUser) throw new AppError(401, 'UNAUTHENTICATED', 'Iniciá sesión para continuar.');

    const [created] = await app.db
      .insert(reports)
      .values({
        pointId: point.id,
        authorId: request.authUser.id,
        type: input.type,
        comment: input.comment,
      })
      .returning({ id: reports.id, type: reports.type, comment: reports.comment, timestamp: reports.createdAt });

    return reply.code(201).send({
      data: {
        ...created,
        pointId: point.publicId,
        status: 'pending' as const,
      },
    });
  });

  app.patch('/admin/reports/:id', {
    preHandler: requireAdmin,
    schema: { tags: ['admin'], summary: 'Approve or reject a community report' },
  }, async (request) => {
    const { id } = parse(reportIdParamsSchema, request.params);
    const { decision } = parse(reportReviewSchema, request.body);
    if (!request.authUser) throw new AppError(401, 'UNAUTHENTICATED', 'Iniciá sesión para continuar.');
    const now = new Date();

    const result = await app.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(reports)
        .set({ status: decision, reviewerId: request.authUser!.id, reviewedAt: now })
        .where(and(eq(reports.id, id), eq(reports.status, 'pending')))
        .returning({ id: reports.id, pointId: reports.pointId, status: reports.status });

      if (!updated) {
        const [existing] = await tx.select({ id: reports.id }).from(reports).where(eq(reports.id, id)).limit(1);
        if (!existing) throw new AppError(404, 'REPORT_NOT_FOUND', 'No encontramos ese reporte.');
        throw new AppError(409, 'REPORT_ALREADY_REVIEWED', 'Ese reporte ya fue revisado.');
      }

      await tx.insert(auditLog).values({
        actorId: request.authUser!.id,
        action: decision === 'approved' ? 'report.approved' : 'report.rejected',
        entityType: 'report',
        entityId: updated.id,
        details: { pointId: updated.pointId },
      });
      return updated;
    });

    return { data: result };
  });
};

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', result.error.issues[0]?.message ?? 'Revisá los datos ingresados.');
  }
  return result.data;
}

function encodeCursor(cursor: ReportCursor): string {
  return Buffer.from(`${cursor.createdAt.toISOString()}|${cursor.id}`).toString('base64url');
}

function decodeCursor(encoded: string): ReportCursor {
  let decoded: string;
  try {
    decoded = Buffer.from(encoded, 'base64url').toString('utf8');
  } catch {
    throw new AppError(400, 'INVALID_CURSOR', 'El cursor de reportes no es válido.');
  }

  const [timestamp, id, extra] = decoded.split('|');
  const date = timestamp ? new Date(timestamp) : null;
  if (extra !== undefined || !date || Number.isNaN(date.getTime()) || !z.string().uuid().safeParse(id).success) {
    throw new AppError(400, 'INVALID_CURSOR', 'El cursor de reportes no es válido.');
  }
  return { createdAt: date, id: id! };
}
