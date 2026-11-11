import { desc, eq, max, sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';

import type { AppEnv } from '../../config/env.js';
import { quizAttempts } from '../../db/schema/index.js';
import { AppError } from '../../lib/errors.js';
import { createRequireVerifiedUser } from '../auth/require-user.js';
import { QUIZ_TOTAL_QUESTIONS, quizAttemptSchema } from './quiz.schemas.js';

interface PersonalRoutesOptions {
  env: AppEnv;
}

export const quizRoutes: FastifyPluginAsync<PersonalRoutesOptions> = async (app, options) => {
  const requireVerifiedUser = createRequireVerifiedUser(options.env);

  app.get('/me/quiz-attempts', { preHandler: requireVerifiedUser }, async (request) => {
    const userId = request.authUser!.id;
    const [summary] = await app.db
      .select({
        best: max(quizAttempts.score),
        attempts: sql<number>`count(*)::int`,
      })
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId));

    const [latest] = await app.db
      .select({ score: quizAttempts.score, completedAt: quizAttempts.completedAt })
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.completedAt))
      .limit(1);

    return {
      data: {
        best: summary?.best ?? 0,
        attempts: summary?.attempts ?? 0,
        lastScore: latest?.score ?? null,
        lastDate: latest ? dateInCordoba(latest.completedAt) : null,
      },
    };
  });

  app.post('/me/quiz-attempts', { preHandler: requireVerifiedUser }, async (request, reply) => {
    const parsed = quizAttemptSchema.safeParse(request.body);
    if (!parsed.success) throw new AppError(400, 'INVALID_QUIZ_ATTEMPT', 'El resultado del cuestionario no es válido.');

    const userId = request.authUser!.id;
    const [previous] = await app.db
      .select({ best: max(quizAttempts.score) })
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId));
    const [created] = await app.db
      .insert(quizAttempts)
      .values({ userId, score: parsed.data.score, total: QUIZ_TOTAL_QUESTIONS })
      .returning({ score: quizAttempts.score, completedAt: quizAttempts.completedAt });

    const [summary] = await app.db
      .select({ attempts: sql<number>`count(*)::int` })
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId));

    return reply.code(201).send({
      data: {
        isNewBest: parsed.data.score > (previous?.best ?? 0),
        best: Math.max(parsed.data.score, previous?.best ?? 0),
        attempts: summary?.attempts ?? 1,
        lastScore: created!.score,
        lastDate: dateInCordoba(created!.completedAt),
      },
    });
  });
};

function dateInCordoba(value: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Cordoba',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value);
}
