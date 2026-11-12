import assert from 'node:assert/strict';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { once } from 'node:events';
import test from 'node:test';
import Fastify, { type FastifyInstance } from 'fastify';
import { createVercelHandler } from '../src/vercel.js';

async function withServer(app: FastifyInstance, run: (baseUrl: string) => Promise<void>) {
  const handler = createVercelHandler(async () => app);
  const server = createServer((req: IncomingMessage, res: ServerResponse) => void handler(req, res));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert(address && typeof address === 'object');
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

test('Vercel handler forwards path, query, body, cookies and response headers to Fastify', async () => {
  const app = Fastify({ logger: false });
  app.post('/api/v1/echo', async (request, reply) => {
    reply.header('x-fastify-route', 'echo');
    return { url: request.url, cookie: request.headers.cookie, body: request.body };
  });
  await app.ready();

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/echo?source=web`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: 'session=abc' },
      body: JSON.stringify({ hello: 'cordoba' }),
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-fastify-route'), 'echo');
    assert.deepEqual(await response.json(), {
      url: '/api/v1/echo?source=web',
      cookie: 'session=abc',
      body: { hello: 'cordoba' },
    });
  });
  await app.close();
});

test('Vercel handler hides app bootstrap errors from clients', async () => {
  const handler = createVercelHandler(async () => { throw new Error('secret DATABASE_URL'); });
  const server = createServer((req, res) => void handler(req, res));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert(address && typeof address === 'object');
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/health`);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: 'Internal Server Error' });
  } finally {
    server.close();
    await once(server, 'close');
  }
});
