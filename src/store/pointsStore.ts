import { create } from 'zustand';

import { SEED_POINTS } from '@/data/points';
import { loadArraySeed, storageSet, STORAGE_KEYS } from '@/lib/storage';
import { sanitizePoints } from '@/lib/sanitize';
import type { PointStatus, RecyclePoint } from '@/types/domain';

interface PointsState {
  points: RecyclePoint[];
  /** Actualiza el estado de un punto y persiste la lista completa. */
  setPointStatus: (pointId: string, status: PointStatus) => void;
}

/**
 * Puntos de reciclaje.
 *
 * Formato original: array JSON plano en ecopunto.points.v1. Si lo guardado
 * sanea a vacío, se vuelve a sembrar con los puntos de ejemplo.
 */
function loadInitialPoints(): RecyclePoint[] {
  return loadArraySeed(
    STORAGE_KEYS.points,
    () => SEED_POINTS.map((point) => ({ ...point })),
    (data) => {
      const sanitized = sanitizePoints(data);
      if (!sanitized || !sanitized.length) {
        const seed = SEED_POINTS.map((point) => ({ ...point }));
        storageSet(STORAGE_KEYS.points, seed);
        return seed;
      }
      return sanitized;
    },
  );
}

export const usePointsStore = create<PointsState>((set, get) => ({
  points: loadInitialPoints(),
  setPointStatus: (pointId, status) => {
    const updated = get().points.map((point) =>
      point.id === pointId ? { ...point, status } : point,
    );
    storageSet(STORAGE_KEYS.points, updated);
    set({ points: updated });
  },
}));

/** Busca un punto por id. */
export function getPointById(points: RecyclePoint[], pointId: string): RecyclePoint | null {
  return points.find((point) => point.id === pointId) ?? null;
}
