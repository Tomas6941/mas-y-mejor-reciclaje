import { create } from 'zustand';

import { createSeedRecords } from '@/data/seed';
import { loadArraySeed, storageSet, STORAGE_KEYS } from '@/lib/storage';
import { sanitizeRecords } from '@/lib/sanitize';
import { makeId } from '@/lib/utils';
import type { MaterialKey, TrackingRecord } from '@/types/domain';

interface TrackingState {
  records: TrackingRecord[];
  /** Agrega un registro y lo persiste. */
  addRecord: (input: { material: MaterialKey; kg: number; date: string }) => TrackingRecord;
  /** Borra todos los registros (queda persistido el array vacío). */
  clearAll: () => void;
}

/**
 * Registros de seguimiento.
 *
 * Formato original: array JSON plano en ecopunto.records.v1. Si la persona
 * los borró, la lista queda vacía (no se vuelve a sembrar).
 */
export const useTrackingStore = create<TrackingState>((set, get) => ({
  records: loadArraySeed(
    STORAGE_KEYS.records,
    createSeedRecords,
    (data) => sanitizeRecords(data) ?? [],
  ),
  addRecord: ({ material, kg, date }) => {
    const record: TrackingRecord = {
      id: makeId('record'),
      material,
      kg: Math.round(kg * 100) / 100,
      date,
    };
    const updated = [...get().records, record];
    storageSet(STORAGE_KEYS.records, updated);
    set({ records: updated });
    return record;
  },
  clearAll: () => {
    storageSet(STORAGE_KEYS.records, []);
    set({ records: [] });
  },
}));
