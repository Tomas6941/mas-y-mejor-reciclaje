import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as schema from './db/schema/index.js';
import {
  collectionScheduleDays,
  collectionSchedules,
  materials,
  neighborhoods,
  pointMaterials,
  points,
} from './db/schema/index.js';

type SeedDatabase = NodePgDatabase<typeof schema>;

interface SeedMaterial {
  key: string;
  label: string;
  short: string;
  color: string;
  colorDark: string;
}

interface SeedPoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'Punto verde' | 'Contenedor';
  materials: string[];
  status: 'available' | 'near-full' | 'full' | 'damaged';
  hours: string;
}

interface SeedSchedule {
  key: string;
  name: string;
  icon: 'recycle' | 'leaf' | 'trash';
  color: string;
  description: string;
  days: number[];
  time: string;
  startTime: string;
}

type SeedNeighborhoods = Record<string, SeedSchedule[]>;

async function readJson<T>(fileName: string): Promise<T> {
  const url = new URL(`./seed-data/${fileName}`, import.meta.url);
  return JSON.parse(await readFile(fileURLToPath(url), 'utf8')) as T;
}

export async function seedDatabase(db: SeedDatabase): Promise<void> {
  const [materialSeeds, pointSeeds, neighborhoodSeeds] = await Promise.all([
    readJson<SeedMaterial[]>('materials.json'),
    readJson<SeedPoint[]>('points.json'),
    readJson<SeedNeighborhoods>('neighborhoods.json'),
  ]);

  await db.transaction(async (tx) => {
    for (const [sortOrder, material] of materialSeeds.entries()) {
      await tx
        .insert(materials)
        .values({
          key: material.key,
          label: material.label,
          shortLabel: material.short,
          color: material.color,
          colorDark: material.colorDark,
          sortOrder,
        })
        .onConflictDoUpdate({
          target: materials.key,
          set: {
            label: material.label,
            shortLabel: material.short,
            color: material.color,
            colorDark: material.colorDark,
            sortOrder,
          },
        });
    }

    for (const point of pointSeeds) {
      const [inserted] = await tx
        .insert(points)
        .values({
          publicId: point.id,
          name: point.name,
          address: point.address,
          latitude: String(point.lat),
          longitude: String(point.lng),
          type: point.type === 'Punto verde' ? 'green_point' : 'container',
          status: point.status,
          hours: point.hours,
        })
        .onConflictDoNothing({ target: points.publicId })
        .returning({ id: points.id });

      const [stored] = inserted
        ? [inserted]
        : await tx.select({ id: points.id }).from(points).where(eq(points.publicId, point.id)).limit(1);
      if (!stored) throw new Error(`Could not seed point ${point.id}`);
      if (inserted && point.materials.length > 0) {
        await tx.insert(pointMaterials).values(
          point.materials.map((materialKey) => ({ pointId: stored.id, materialKey })),
        );
      }
    }

    for (const [name, schedules] of Object.entries(neighborhoodSeeds)) {
      const slug = slugify(name);
      const [insertedNeighborhood] = await tx
        .insert(neighborhoods)
        .values({ slug, name })
        .onConflictDoNothing({ target: neighborhoods.slug })
        .returning({ id: neighborhoods.id });
      const [neighborhood] = insertedNeighborhood
        ? [insertedNeighborhood]
        : await tx.select({ id: neighborhoods.id }).from(neighborhoods).where(eq(neighborhoods.slug, slug)).limit(1);

      if (!neighborhood) throw new Error(`Could not seed neighborhood ${name}`);

      for (const schedule of schedules) {
        const [, endTime] = schedule.time.split(' a ');
        const [createdSchedule] = await tx
          .insert(collectionSchedules)
          .values({
            neighborhoodId: neighborhood.id,
            key: schedule.key,
            name: schedule.name,
            icon: schedule.icon,
            color: schedule.color,
            description: schedule.description,
            startTime: `${schedule.startTime}:00`,
            endTime: `${endTime ?? schedule.startTime}:00`,
          })
          .onConflictDoNothing({
            target: [collectionSchedules.neighborhoodId, collectionSchedules.key],
          })
          .returning({ id: collectionSchedules.id });
        const [storedSchedule] = createdSchedule
          ? [createdSchedule]
          : await tx
              .select({ id: collectionSchedules.id })
              .from(collectionSchedules)
              .where(and(
                eq(collectionSchedules.neighborhoodId, neighborhood.id),
                eq(collectionSchedules.key, schedule.key),
              ))
              .limit(1);

        if (!storedSchedule) throw new Error(`Could not seed schedule ${slug}/${schedule.key}`);
        if (createdSchedule && schedule.days.length > 0) {
          await tx.insert(collectionScheduleDays).values(
            schedule.days.map((weekday) => ({ scheduleId: storedSchedule.id, weekday })),
          );
        }
      }
    }
  });
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
