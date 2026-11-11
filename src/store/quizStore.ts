import { create } from 'zustand';

import { storageGet, storageSet, STORAGE_KEYS } from '@/lib/storage';
import { validateQuizResult } from '@/lib/sanitize';
import { todayISO } from '@/lib/dates';
import type { QuizResultState } from '@/types/domain';

interface QuizState {
  result: QuizResultState;
  /** Guarda un intento terminado y devuelve si es un nuevo récord. */
  recordAttempt: (score: number) => boolean;
}

/**
 * Resultado del mini quiz.
 *
 * Formato original: objeto JSON {best, attempts, lastScore, lastDate}.
 * Valores inválidos caen en los defaults sin escribir nada.
 */
function loadInitialQuizResult(): QuizResultState {
  return validateQuizResult(storageGet<unknown>(STORAGE_KEYS.quiz, null));
}

export const useQuizStore = create<QuizState>((set, get) => ({
  result: loadInitialQuizResult(),
  recordAttempt: (score) => {
    const previous = get().result;
    const previousBest = Number(previous.best) || 0;
    const isNewBest = score > previousBest;
    const result: QuizResultState = {
      best: Math.max(previousBest, score),
      attempts: (Number(previous.attempts) || 0) + 1,
      lastScore: score,
      lastDate: todayISO(),
    };
    storageSet(STORAGE_KEYS.quiz, result);
    set({ result });
    return isNewBest;
  },
}));
