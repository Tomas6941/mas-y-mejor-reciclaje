import type { IncomingMessage, ServerResponse } from 'node:http';
import type { FastifyInstance } from 'fastify';

import { buildApp } from './app.js';
import { loadEnv } from './config/env.js';

export type AppResolver = () => Promise<FastifyInstance>;

/** Adapt a Node request to Fastify without opening a listening socket. */
export function createVercelHandler(resolveApp: AppResolver) {
  return async function vercelHandler(request: IncomingMessage, response: ServerResponse): Promise<void> {
    try {
      const app = await resolveApp();
      app.server.emit('request', request, response);
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      console.error({ errorName }, 'Vercel API function failed to initialize');
      if (response.headersSent) {
        response.destroy();
        return;
      }
      response.statusCode = 500;
      response.setHeader('content-type', 'application/json; charset=utf-8');
      response.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  };
}

let appPromise: Promise<FastifyInstance> | undefined;

async function getProductionApp(): Promise<FastifyInstance> {
  if (!appPromise) {
    appPromise = (async () => {
      const env = loadEnv({ ...process.env, NODE_ENV: 'production' });
      if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required to start the API.');
      const app = await buildApp({ env });
      await app.ready();
      return app;
    })().catch((error: unknown) => {
      appPromise = undefined;
      throw error;
    });
  }
  return appPromise;
}

export const vercelHandler = createVercelHandler(getProductionApp);
