import fp from 'fastify-plugin';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { FastifyPluginAsync } from 'fastify';

import * as schema from '../db/schema/index.js';

export type Database = NodePgDatabase<typeof schema>;

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
    pgPool: Pool;
  }
}

interface DatabasePluginOptions {
  connectionString: string;
}

const databasePluginImplementation: FastifyPluginAsync<DatabasePluginOptions> = async (app, options) => {
  const pool = new Pool({
    connectionString: options.connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
  });

  pool.on('error', (error) => {
    app.log.error({ errorName: error.name }, 'PostgreSQL idle client error');
  });

  app.decorate('pgPool', pool);
  app.decorate('db', drizzle({ client: pool, schema }));
  app.addHook('onClose', async () => {
    await pool.end();
  });
};

export const databasePlugin = fp(databasePluginImplementation, {
  name: 'ecopunto-database',
});
