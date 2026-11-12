import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '../..');
const functionPaths = [
  'api/v1/[route].js',
  'api/v1/[route]/[subroute].js',
  'api/v1/[route]/[subroute]/[third].js',
  'api/v1/[route]/[subroute]/[third]/[fourth].js',
];

test('Vercel has a function entry for every API path depth used by Fastify', () => {
  for (const path of functionPaths) {
    const absolutePath = resolve(repositoryRoot, path);
    assert.ok(existsSync(absolutePath), `Missing Vercel entrypoint: ${path}`);
    assert.match(readFileSync(absolutePath, 'utf8'), /vercelHandler/);
  }
});
