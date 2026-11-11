import { create } from 'zustand';

import { apiRequest } from '@/lib/api';
import type { QuizResultState } from '@/types/domain';

interface QuizAttemptResponse extends QuizResultState {
  isNewBest: boolean;
}

interface QuizState {
  result: QuizResultState;
  fetchResult: () => Promise<void>;
  recordAttempt: (correctAnswers: number) => Promise<boolean>;
  clearState: () => void;
}

const EMPTY_RESULT: QuizResultState = {
  best: 0,
  attempts: 0,
  lastScore: null,
  lastDate: null,
};

let requestVersion = 0;

function fromApi(value: Omit<QuizAttemptResponse, 'isNewBest'>): QuizResultState {
  return {
    best: value.best * 20,
    attempts: value.attempts,
    lastScore: value.lastScore === null ? null : value.lastScore * 20,
    lastDate: value.lastDate,
  };
}

export const useQuizStore = create<QuizState>((set) => ({
  result: EMPTY_RESULT,
  fetchResult: async () => {
    const version = ++requestVersion;
    const result = await apiRequest<Omit<QuizAttemptResponse, 'isNewBest'>>('/me/quiz-attempts');
    if (version === requestVersion) set({ result: fromApi(result) });
  },
  recordAttempt: async (correctAnswers) => {
    const version = requestVersion;
    const result = await apiRequest<QuizAttemptResponse>('/me/quiz-attempts', {
      body: { score: correctAnswers },
    });
    if (version === requestVersion) set({ result: fromApi(result) });
    return result.isNewBest;
  },
  clearState: () => {
    requestVersion += 1;
    set({ result: EMPTY_RESULT });
  },
}));
