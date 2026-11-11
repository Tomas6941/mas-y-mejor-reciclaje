import { and, eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';

import type { AppEnv } from '../../config/env.js';
import { neighborhoods, userPreferences } from '../../db/schema/index.js';
import { AppError } from '../../lib/errors.js';
import { createRequireVerifiedUser } from '../auth/require-user.js';
import { neighborhoodPreferenceSchema } from './preferences.schemas.js';

interface PersonalRoutesOptions {
  env: AppEnv;
}

export const preferenceRoutes: FastifyPluginAsync<PersonalRoutesOptions> = async (app, options) => {
  const requireVerifiedUser = createRequireVerifiedUser(options.env);

  app.get('/me/preferences', { preHandler: requireVerifiedUser }, async (request) => {
    const [row] = await app.db
      .select({ neighborhood: neighborhoods.slug, reminderEnabled: userPreferences.reminderEnabled })
      .from(userPreferences)
      .leftJoin(neighborhoods, eq(userPreferences.neighborhoodId, neighborhoods.id))
      .where(eq(userPreferences.userId, request.authUser!.id))
      .limit(1);

    return { data: { neighborhood: row?.neighborhood ?? null, reminderEnabled: row?.reminderEnabled ?? false } };
  });

  app.patch('/me/preferences', { preHandler: requireVerifiedUser }, async (request) => {
    const parsed = neighborhoodPreferenceSchema.safeParse(request.body);
    if (!parsed.success) throw new AppError(400, 'INVALID_PREFERENCE', 'Elegí un barrio válido.');

    const neighborhoodSlug = parsed.data.neighborhood;
    const [neighborhood] = neighborhoodSlug ? await app.db
      .select({ id: neighborhoods.id, slug: neighborhoods.slug })
      .from(neighborhoods)
      .where(and(eq(neighborhoods.slug, neighborhoodSlug), eq(neighborhoods.isActive, true)))
      .limit(1) : [];
    if (neighborhoodSlug && !neighborhood) throw new AppError(400, 'UNKNOWN_NEIGHBORHOOD', 'Ese barrio no está disponible.');

    const [existing] = await app.db
      .select({ neighborhoodId: userPreferences.neighborhoodId, neighborhood: neighborhoods.slug, reminderEnabled: userPreferences.reminderEnabled })
      .from(userPreferences)
      .leftJoin(neighborhoods, eq(userPreferences.neighborhoodId, neighborhoods.id))
      .where(eq(userPreferences.userId, request.authUser!.id))
      .limit(1);
    const nextNeighborhoodId = neighborhood ? neighborhood.id : existing?.neighborhoodId ?? null;
    const nextReminderEnabled = parsed.data.reminderEnabled ?? existing?.reminderEnabled ?? false;

    await app.db
      .insert(userPreferences)
      .values({ userId: request.authUser!.id, neighborhoodId: nextNeighborhoodId, reminderEnabled: nextReminderEnabled })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { neighborhoodId: nextNeighborhoodId, reminderEnabled: nextReminderEnabled, updatedAt: new Date() },
      });

    return { data: { neighborhood: neighborhood?.slug ?? existing?.neighborhood ?? null, reminderEnabled: nextReminderEnabled } };
  });
};
