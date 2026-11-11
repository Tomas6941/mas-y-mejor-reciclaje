import { create } from 'zustand';

import { DEFAULT_NEIGHBORHOOD } from '@/data/neighborhoods';
import { apiRequest } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Reminder, Schedule } from '@/types/domain';

export interface CalendarNeighborhood {
  id: string;
  name: string;
}

interface CalendarState {
  neighborhood: string;
  neighborhoods: CalendarNeighborhood[];
  schedules: Record<string, Schedule[]>;
  reminder: Reminder;
  fetchNeighborhoods: () => Promise<void>;
  fetchSchedules: (slug: string) => Promise<void>;
  fetchPreference: () => Promise<void>;
  setNeighborhood: (slug: string) => Promise<void>;
  setReminder: (enabled: boolean) => Promise<void>;
  clearAccountPreference: () => void;
}

const EMPTY_REMINDER: Reminder = { enabled: false, neighborhood: null, createdAt: null };
const DEFAULT_SLUG = toSlug(DEFAULT_NEIGHBORHOOD);

export const useCalendarStore = create<CalendarState>((set, get) => ({
  neighborhood: DEFAULT_SLUG,
  neighborhoods: [],
  schedules: {},
  reminder: EMPTY_REMINDER,
  fetchNeighborhoods: async () => {
    if (get().neighborhoods.length > 0) return;
    const neighborhoods = await apiRequest<CalendarNeighborhood[]>('/neighborhoods');
    const selected = neighborhoods.some((item) => item.id === get().neighborhood)
      ? get().neighborhood
      : neighborhoods.find((item) => item.id === DEFAULT_SLUG)?.id ?? neighborhoods[0]?.id ?? DEFAULT_SLUG;
    set({ neighborhoods, neighborhood: selected });
  },
  fetchSchedules: async (slug) => {
    if (!slug || get().schedules[slug]) return;
    const result = await apiRequest<{ neighborhood: string; schedules: Schedule[] }>(
      `/neighborhoods/${encodeURIComponent(slug)}/schedules`,
    );
    set((state) => ({ schedules: { ...state.schedules, [slug]: result.schedules } }));
  },
  fetchPreference: async () => {
    const result = await apiRequest<{ neighborhood: string | null; reminderEnabled: boolean }>('/me/preferences');
    if (result.neighborhood) set({ neighborhood: result.neighborhood });
    const neighborhood = get().neighborhoods.find((item) => item.id === (result.neighborhood ?? get().neighborhood))?.name ?? null;
    set({ reminder: { enabled: result.reminderEnabled, neighborhood: result.reminderEnabled ? neighborhood : null, createdAt: null } });
  },
  setNeighborhood: async (slug) => {
    if (!get().neighborhoods.some((item) => item.id === slug)) return;
    set({ neighborhood: slug });
    const user = useAuthStore.getState().user;
    if (user?.emailVerifiedAt) {
      await apiRequest('/me/preferences', { method: 'PATCH', body: { neighborhood: slug } });
    }
  },
  setReminder: async (enabled) => {
    const neighborhood = get().neighborhoods.find((item) => item.id === get().neighborhood)?.name ?? null;
    await apiRequest('/me/preferences', { method: 'PATCH', body: { reminderEnabled: enabled } });
    set({
      reminder: {
        enabled,
        neighborhood: enabled ? neighborhood : null,
        createdAt: new Date().toISOString(),
      },
    });
  },
  clearAccountPreference: () => set({ neighborhood: DEFAULT_SLUG, reminder: EMPTY_REMINDER }),
}));

export function getSchedulesFor(neighborhood: string): Schedule[] {
  return useCalendarStore.getState().schedules[neighborhood] ?? [];
}

export function toSlug(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
