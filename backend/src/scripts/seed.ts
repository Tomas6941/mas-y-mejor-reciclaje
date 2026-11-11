import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import { loadEnv } from '../config/env.js';
import * as schema from '../db/schema/index.js';
import { seedDatabase } from '../seed.js';

const env = loadEnv();
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required to seed the database.');

const pool = new Pool({ connectionString: env.DATABASE_MIGRATION_URL ?? env.DATABASE_URL, max: 1 });
try {
  await seedDatabase(drizzle({ client: pool, schema }));
  console.info('Córdoba catalog and seed data loaded.');
} catch (error) {
  console.error('Database seed failed.', error instanceof Error ? error.name : 'UnknownError');
  process.exitCode = 1;
} finally {
  await pool.end();
}
