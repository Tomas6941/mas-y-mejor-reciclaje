import { buildApp } from './app.js';
import { loadEnv } from './config/env.js';

const env = loadEnv();
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required to start the API server.');
const app = await buildApp({ env });

try {
  await app.listen({ host: env.HOST, port: env.PORT });
} catch (error) {
  const startupError = error instanceof Error ? error : new Error('Unknown server startup error');
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : undefined;
  app.log.error({ errorName: startupError.name, errorCode: code, errorMessage: startupError.message }, 'Server failed to start');
  await app.close();
  process.exitCode = 1;
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().then(() => process.exit(0));
  });
}
