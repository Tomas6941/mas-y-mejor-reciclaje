import { create } from 'zustand';

import { apiRequest } from '@/lib/api';
import type { MaterialKey, TrackingRecord } from '@/types/domain';

interface TrackingState {
  records: TrackingRecord[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  addRecord: (input: { material: MaterialKey; kg: number; date: string }) => Promise<TrackingRecord>;
  clearAll: () => Promise<void>;
  clearState: () => void;
}

let requestVersion = 0;

export const useTrackingStore = create<TrackingState>((set, get) => ({
  records: [],
  loading: false,
  fetchRecords: async () => {
    const version = ++requestVersion;
    set({ loading: true });
    try {
      const result = await apiRequest<TrackingRecord[]>('/me/tracking');
      if (version === requestVersion) set({ records: result });
    } finally {
      if (version === requestVersion) set({ loading: false });
    }
  },
  addRecord: async ({ material, kg, date }) => {
    const version = requestVersion;
    const record = await apiRequest<TrackingRecord>('/me/tracking', {
      body: { material, kg, date },
    });
    if (version === requestVersion) set({ records: [...get().records, record] });
    return record;
  },
  clearAll: async () => {
    await apiRequest<{ deletedCount: number }>('/me/tracking', { method: 'DELETE' });
    set({ records: [] });
  },
  clearState: () => {
    requestVersion += 1;
    set({ records: [], loading: false });
  },
}));
