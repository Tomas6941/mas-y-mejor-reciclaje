import assert from 'node:assert/strict';
import test from 'node:test';

const service = await import('../src/modules/admin/admin-users.service.ts').catch(() => null);

test('normalizes admin email before lookup', () => {
  assert.equal(service?.normalizeAdminEmail('  Admin@Example.COM  '), 'admin@example.com');
});

test('only active accounts with verified email can be promoted', () => {
  assert.doesNotThrow(() => service?.assertPromotableUser({ role: 'user', status: 'active', emailVerifiedAt: new Date() }));
  assert.throws(
    () => service?.assertPromotableUser({ role: 'user', status: 'disabled', emailVerifiedAt: new Date() }),
    (error: { code?: string }) => error.code === 'USER_NOT_ELIGIBLE',
  );
  assert.throws(
    () => service?.assertPromotableUser({ role: 'user', status: 'active', emailVerifiedAt: null }),
    (error: { code?: string }) => error.code === 'USER_NOT_ELIGIBLE',
  );
});

test('refuses revoking the current admin role', () => {
  assert.throws(
    () => service?.assertCanRevokeAdmin({ actorId: 'same', targetId: 'same', activeAdminCount: 2 }),
    (error: { code?: string }) => error.code === 'SELF_REVOKE',
  );
});

test('refuses revoking the last active admin', () => {
  assert.throws(
    () => service?.assertCanRevokeAdmin({ actorId: 'actor', targetId: 'target', activeAdminCount: 1 }),
    (error: { code?: string }) => error.code === 'LAST_ADMIN',
  );
  assert.doesNotThrow(() => service?.assertCanRevokeAdmin({ actorId: 'actor', targetId: 'target', activeAdminCount: 2 }));
});
