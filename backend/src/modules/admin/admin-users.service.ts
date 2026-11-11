import { and, asc, eq, isNotNull } from 'drizzle-orm';

import { auditLog, users } from '../../db/schema/index.js';
import { AppError } from '../../lib/errors.js';
import type { Database } from '../../plugins/database.js';

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function assertPromotableUser(user: {
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  emailVerifiedAt: Date | null;
}): void {
  if (user.status !== 'active' || !user.emailVerifiedAt) {
    throw new AppError(404, 'USER_NOT_ELIGIBLE', 'No se encontró una cuenta activa con correo verificado.');
  }
  if (user.role === 'admin') {
    throw new AppError(409, 'ALREADY_ADMIN', 'Esta cuenta ya tiene permisos de administrador.');
  }
}

export function assertCanRevokeAdmin(input: {
  actorId: string;
  targetId: string;
  activeAdminCount: number;
}): void {
  if (input.actorId === input.targetId) {
    throw new AppError(409, 'SELF_REVOKE', 'No podés quitar tu propio rol desde este panel.');
  }
  if (input.activeAdminCount <= 1) {
    throw new AppError(409, 'LAST_ADMIN', 'Debe quedar al menos un administrador activo.');
  }
}

export async function listAdmins(db: Database) {
  return db
    .select({ id: users.id, email: users.email, emailVerifiedAt: users.emailVerifiedAt, createdAt: users.createdAt })
    .from(users)
    .where(and(eq(users.role, 'admin'), eq(users.status, 'active')))
    .orderBy(asc(users.email));
}

export async function promoteAdmin(db: Database, actorId: string, email: string) {
  const normalizedEmail = normalizeAdminEmail(email);
  return db.transaction(async (tx) => {
    await lockActiveAdmins(tx);
    const [target] = await tx
      .select({ id: users.id, email: users.email, role: users.role, status: users.status, emailVerifiedAt: users.emailVerifiedAt })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!target) throw new AppError(404, 'USER_NOT_ELIGIBLE', 'No se encontró una cuenta activa con correo verificado.');
    assertPromotableUser(target);

    const [promoted] = await tx
      .update(users)
      .set({ role: 'admin', updatedAt: new Date() })
      .where(and(eq(users.id, target.id), eq(users.role, 'user'), eq(users.status, 'active'), isNotNull(users.emailVerifiedAt)))
      .returning({ id: users.id, email: users.email, emailVerifiedAt: users.emailVerifiedAt, createdAt: users.createdAt });

    if (!promoted) throw new AppError(409, 'ALREADY_ADMIN', 'Esta cuenta ya tiene permisos de administrador.');
    await tx.insert(auditLog).values({ actorId, action: 'admin.promoted', entityType: 'user', entityId: promoted.id });
    return promoted;
  });
}

export async function revokeAdmin(db: Database, actorId: string, targetId: string) {
  return db.transaction(async (tx) => {
    const activeAdmins = await lockActiveAdmins(tx);
    const targetExists = activeAdmins.some((admin) => admin.id === targetId);
    if (!targetExists) throw new AppError(404, 'ADMIN_NOT_FOUND', 'No encontramos un administrador activo con ese identificador.');
    assertCanRevokeAdmin({ actorId, targetId, activeAdminCount: activeAdmins.length });

    const [revoked] = await tx
      .update(users)
      .set({ role: 'user', updatedAt: new Date() })
      .where(and(eq(users.id, targetId), eq(users.role, 'admin'), eq(users.status, 'active')))
      .returning({ id: users.id });

    if (!revoked) throw new AppError(404, 'ADMIN_NOT_FOUND', 'No encontramos un administrador activo con ese identificador.');
    await tx.insert(auditLog).values({ actorId, action: 'admin.revoked', entityType: 'user', entityId: revoked.id });
    return { id: revoked.id, role: 'user' as const };
  });
}

async function lockActiveAdmins(tx: Parameters<Parameters<Database['transaction']>[0]>[0]) {
  return tx
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, 'admin'), eq(users.status, 'active')))
    .orderBy(asc(users.id))
    .for('update');
}
