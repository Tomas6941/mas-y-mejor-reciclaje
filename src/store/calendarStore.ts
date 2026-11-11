import { create } from 'zustand';

import { DEFAULT_NEIGHBORHOOD, NEIGHBORHOODS } from '@/data/neighborhoods';
import { storageGet, storageSet, STORAGE_KEYS } from '@/lib/storage';
import { validateNeighborhood, validateReminder } from '@/lib/sanitize';
import type { Reminder } from '@/types/domain';

interface CalendarState {
  neighborhood: string;
  reminder: Reminder;
  /** Cambia de barrio; si hay recordatorio activo, también lo actualiza. */
  setNeighborhood: (neighborhood: string) => void;
  /** Activa/desactiva el recordatorio del barrio actual. */
  setReminder: (enabled: boolean) => void;
}

/**
 * Barrio y recordatorio de recolección.
 *
 * neighborhood se guarda como string JSON con comillas (formato original);
 * reminder como objeto {enabled, neighborhood, createdAt}.
 */
function loadInitialNeighborhood(): string {
  const stored = storageGet<string | null>(STORAGE_KEYS.neighborhood, null);
  if (typeof stored === 'string' && NEIGHBORHOODS[stored]) return stored;
  storageSet(STORAGE_KEYS.neighborhood, DEFAULT_NEIGHBORHOOD);
  return DEFAULT_NEIGHBORHOOD;
}

function loadInitialReminder(): Reminder {
  return validateReminder(storageGet<unknown>(STORAGE_KEYS.reminder, null));
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  neighborhood: loadInitialNeighborhood(),
  reminder: loadInitialReminder(),
  setNeighborhood: (neighborhood) => {
    if (!NEIGHBORHOODS[neighborhood]) return;
    storageSet(STORAGE_KEYS.neighborhood, neighborhood);

    let reminder = get().reminder;
    if (reminder.enabled) {
      reminder = { ...reminder, neighborhood };
      storageSet(STORAGE_KEYS.reminder, reminder);
    }
    set({ neighborhood, reminder });
  },
  setReminder: (enabled) => {
    const reminder: Reminder = {
      enabled,
      neighborhood: enabled ? get().neighborhood : null,
      createdAt: new Date().toISOString(),
    };
    storageSet(STORAGE_KEYS.reminder, reminder);
    set({ reminder });
  },
}));

/** Horarios del barrio seleccionado. */
export function getSchedulesFor(neighborhood: string) {
  return NEIGHBORHOODS[neighborhood] ?? [];
}

/** ¿El barrio guardado sigue siendo válido? (helper para migraciones) */
export function isValidNeighborhood(value: unknown): value is string {
  return validateNeighborhood(value) !== null;
}
