import { relations } from 'drizzle-orm';
import { index, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { points } from './points.js';
import { users } from './users.js';

export const reportTypeEnum = pgEnum('report_type', ['full', 'damaged', 'available']);
export const reportReviewStatusEnum = pgEnum('report_review_status', [
  'pending',
  'approved',
  'rejected',
]);

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    pointId: uuid('point_id').notNull().references(() => points.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    type: reportTypeEnum('type').notNull(),
    comment: varchar('comment', { length: 180 }).notNull().default(''),
    status: reportReviewStatusEnum('status').notNull().default('pending'),
    reviewerId: uuid('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('reports_status_created_idx').on(table.status, table.createdAt),
    index('reports_point_created_idx').on(table.pointId, table.createdAt),
    index('reports_author_created_idx').on(table.authorId, table.createdAt),
  ],
);

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 80 }).notNull(),
    entityType: varchar('entity_type', { length: 80 }).notNull(),
    entityId: uuid('entity_id'),
    details: jsonb('details').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('audit_log_entity_created_idx').on(table.entityType, table.entityId, table.createdAt)],
);

export const reportsRelations = relations(reports, ({ one }) => ({
  point: one(points, { fields: [reports.pointId], references: [points.id] }),
  author: one(users, { fields: [reports.authorId], references: [users.id], relationName: 'report_author' }),
  reviewer: one(users, { fields: [reports.reviewerId], references: [users.id], relationName: 'report_reviewer' }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(users, { fields: [auditLog.actorId], references: [users.id] }),
}));
