import { relations, sql } from 'drizzle-orm';
import { check, index, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { points } from './points.js';
import { users } from './users.js';

export const reportCategoryEnum = pgEnum('report_category', ['container_status', 'suggestion']);
export const reportTypeEnum = pgEnum('report_type', [
  'full', 'damaged', 'available', 'move_point', 'add_point', 'remove_point',
]);
export const reportReviewStatusEnum = pgEnum('report_review_status', [
  'pending',
  'approved',
  'rejected',
]);

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    pointId: uuid('point_id').references(() => points.id, { onDelete: 'set null' }),
    authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    category: reportCategoryEnum('category').notNull().default('container_status'),
    type: reportTypeEnum('type').notNull(),
    comment: varchar('comment', { length: 500 }).notNull().default(''),
    suggestedLocation: varchar('suggested_location', { length: 240 }),
    imageData: text('image_data'),
    status: reportReviewStatusEnum('status').notNull().default('pending'),
    reviewerId: uuid('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('reports_category_type_consistency', sql`(
      (${table.category} = 'container_status' and ${table.type} in ('full', 'damaged', 'available') and ${table.pointId} is not null)
      or (${table.category} = 'suggestion' and ${table.type} = 'add_point' and ${table.pointId} is null)
      or (${table.category} = 'suggestion' and ${table.type} in ('move_point', 'remove_point') and ${table.pointId} is not null)
    )`),
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
