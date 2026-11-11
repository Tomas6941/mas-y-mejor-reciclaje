import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const materials = pgTable('materials', {
  key: varchar('key', { length: 32 }).primaryKey(),
  label: varchar('label', { length: 100 }).notNull(),
  shortLabel: varchar('short_label', { length: 40 }).notNull(),
  color: varchar('color', { length: 7 }).notNull(),
  colorDark: varchar('color_dark', { length: 7 }).notNull(),
  sortOrder: integer('sort_order').notNull().unique(),
});
