import { and, eq, isNotNull } from 'drizzle-orm';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import { loadEnv } from '../config/env.js';
import { users } from '../db/schema/users.js';
import * as schema from '../db/schema/index.js';

const env = loadEnv();
const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const confirmation = process.env.ADMIN_BOOTSTRAP_CONFIRM;
if (!email || confirmation !== 'I_UNDERSTAND_THIS_GRANTS_ADMIN') {
  throw new Error('Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_CONFIRM=I_UNDERSTAND_THIS_GRANTS_ADMIN to continue.');
}

const connectionString = env.DATABASE_MIGRATION_URL ?? env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_MIGRATION_URL or DATABASE_URL is required.');

const pool = new Pool({ connectionString, max: 1 });
try {
  const db = drizzle({ client: pool, schema });
  const [promoted] = await db
    .update(users)
    .set({ role: 'admin', updatedAt: new Date() })
    .where(and(eq(users.email, email), isNotNull(users.emailVerifiedAt), eq(users.status, 'active')))
    .returning({ id: users.id });

  if (!promoted) throw new Error('No active, verified account matched the configured email.');
  console.info('Administrator role assigned.');
} catch (error) {
  console.error('Admin bootstrap failed.', error instanceof Error ? error.name : 'UnknownError');
  process.exitCode = 1;
} finally {
  await pool.end();
}
