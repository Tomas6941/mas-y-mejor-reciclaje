import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const scheduleIconEnum = pgEnum('schedule_icon', ['recycle', 'leaf', 'trash']);

export const neighborhoods = pgTable('neighborhoods', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const collectionSchedules = pgTable(
  'collection_schedules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    neighborhoodId: uuid('neighborhood_id')
      .notNull()
      .references(() => neighborhoods.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 48 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    icon: scheduleIconEnum('icon').notNull(),
    color: varchar('color', { length: 7 }).notNull(),
    description: varchar('description', { length: 300 }).notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    isActive: boolean('is_active').notNull().default(true),
  },
  (table) => [
    uniqueIndex('collection_schedules_key_by_neighborhood_unique').on(
      table.neighborhoodId,
      table.key,
    ),
    index('collection_schedules_neighborhood_idx').on(table.neighborhoodId),
  ],
);

export const collectionScheduleDays = pgTable(
  'collection_schedule_days',
  {
    scheduleId: uuid('schedule_id')
      .notNull()
      .references(() => collectionSchedules.id, { onDelete: 'cascade' }),
    weekday: smallint('weekday').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.scheduleId, table.weekday] }),
    check('collection_schedule_days_weekday_range', sql`${table.weekday} between 0 and 6`),
  ],
);

export const collectionSchedulesRelations = relations(collectionSchedules, ({ one, many }) => ({
  neighborhood: one(neighborhoods, {
    fields: [collectionSchedules.neighborhoodId],
    references: [neighborhoods.id],
  }),
  days: many(collectionScheduleDays),
}));

export const collectionScheduleDaysRelations = relations(collectionScheduleDays, ({ one }) => ({
  schedule: one(collectionSchedules, {
    fields: [collectionScheduleDays.scheduleId],
    references: [collectionSchedules.id],
  }),
}));
