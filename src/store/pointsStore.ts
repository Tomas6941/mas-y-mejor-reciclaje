import { create } from 'zustand';

import { apiRequest } from '@/lib/api';
import type { RecyclePoint } from '@/types/domain';

interface PointsState {
  points: RecyclePoint[];
  loading: boolean;
  fetchPoints: () => Promise<void>;
  clearState: () => void;
}

export const usePointsStore = create<PointsState>((set) => ({
  points: [],
  loading: false,
  fetchPoints: async () => {
    set({ loading: true });
    try {
      const points = await apiRequest<RecyclePoint[]>('/points?limit=100');
      set({ points });
    } finally {
      set({ loading: false });
    }
  },
  clearState: () => set({ points: [], loading: false }),
}));

export function getPointById(points: RecyclePoint[], pointId: string): RecyclePoint | null {
  return points.find((point) => point.id === pointId) ?? null;
}
