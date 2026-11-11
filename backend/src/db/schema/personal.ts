import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  numeric,
  pgTable,
  date,
  smallint,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { materials } from './catalog.js';
import { neighborhoods } from './schedules.js';
import { users } from './users.js';

export const trackingEntries = pgTable(
  'tracking_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    materialKey: varchar('material_key', { length: 32 })
      .notNull()
      .references(() => materials.key, { onDelete: 'restrict' }),
    kilograms: numeric('kilograms', { precision: 8, scale: 2 }).notNull(),
    recordDate: date('record_date', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('tracking_entries_kilograms_range', sql`${table.kilograms} > 0 and ${table.kilograms} <= 1000`),
    index('tracking_entries_user_date_idx').on(table.userId, table.recordDate),
  ],
);

export const quizAttempts = pgTable(
  'quiz_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    score: smallint('score').notNull(),
    total: smallint('total').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('quiz_attempts_total_range', sql`${table.total} between 1 and 100`),
    check('quiz_attempts_score_range', sql`${table.score} >= 0 and ${table.score} <= ${table.total}`),
    index('quiz_attempts_user_completed_idx').on(table.userId, table.completedAt),
  ],
);

export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  neighborhoodId: uuid('neighborhood_id').references(() => neighborhoods.id, { onDelete: 'set null' }),
  reminderEnabled: boolean('reminder_enabled').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const trackingEntriesRelations = relations(trackingEntries, ({ one }) => ({
  user: one(users, { fields: [trackingEntries.userId], references: [users.id] }),
  material: one(materials, {
    fields: [trackingEntries.materialKey],
    references: [materials.key],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, { fields: [quizAttempts.userId], references: [users.id] }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
  neighborhood: one(neighborhoods, {
    fields: [userPreferences.neighborhoodId],
    references: [neighborhoods.id],
  }),
}));
