import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { loadEnv } from '../config/env.js';
import * as schema from '../db/schema/index.js';

const env = loadEnv();
const connectionString = env.DATABASE_MIGRATION_URL ?? env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_MIGRATION_URL or DATABASE_URL is required.');

const pool = new Pool({ connectionString, max: 1 });
try {
  await migrate(drizzle({ client: pool, schema }), { migrationsFolder: './drizzle' });
  console.info('Database migrations applied.');
} catch (error) {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : 'NO_CODE';
  console.error('Database migrations failed.', error instanceof Error ? error.name : 'UnknownError', code);
  process.exitCode = 1;
} finally {
  await pool.end();
}
