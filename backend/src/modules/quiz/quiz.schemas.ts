import { z } from 'zod';

export const quizAttemptSchema = z.object({
  score: z.coerce.number().int().min(0).max(5),
});

export const QUIZ_TOTAL_QUESTIONS = 5;
