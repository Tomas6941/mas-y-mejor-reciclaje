import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { materials } from './catalog.js';

export const pointTypeEnum = pgEnum('point_type', ['green_point', 'container']);
export const pointStatusEnum = pgEnum('point_status', [
  'available',
  'near-full',
  'full',
  'damaged',
]);

export const points = pgTable(
  'points',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    publicId: varchar('public_id', { length: 80 }).notNull().unique(),
    name: varchar('name', { length: 160 }).notNull(),
    address: varchar('address', { length: 240 }).notNull(),
    latitude: numeric('latitude', { precision: 9, scale: 6 }).notNull(),
    longitude: numeric('longitude', { precision: 9, scale: 6 }).notNull(),
    type: pointTypeEnum('type').notNull(),
    status: pointStatusEnum('status').notNull().default('available'),
    hours: varchar('hours', { length: 160 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('points_latitude_range', sql`${table.latitude} between -90 and 90`),
    check('points_longitude_range', sql`${table.longitude} between -180 and 180`),
    index('points_status_idx').on(table.status),
  ],
);

export const pointMaterials = pgTable(
  'point_materials',
  {
    pointId: uuid('point_id').notNull().references(() => points.id, { onDelete: 'cascade' }),
    materialKey: varchar('material_key', { length: 32 })
      .notNull()
      .references(() => materials.key, { onDelete: 'restrict' }),
  },
  (table) => [primaryKey({ columns: [table.pointId, table.materialKey] })],
);

export const pointsRelations = relations(points, ({ many }) => ({
  materials: many(pointMaterials),
}));

export const pointMaterialsRelations = relations(pointMaterials, ({ one }) => ({
  point: one(points, { fields: [pointMaterials.pointId], references: [points.id] }),
  material: one(materials, {
    fields: [pointMaterials.materialKey],
    references: [materials.key],
  }),
}));
