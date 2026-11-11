import { createHash, randomBytes } from 'node:crypto';

export function createOneTimeToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashOneTimeToken(token) };
}

export function hashOneTimeToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
