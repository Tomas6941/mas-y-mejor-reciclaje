/**
 * Acceso a localStorage con manejo de errores.
 *
 * Las claves y formatos son los mismos del sitio original para no perder
 * datos guardados por las personas que ya usan EcoPunto.
 */

export const STORAGE_KEYS = {
  points: 'ecopunto.points.v1',
  reports: 'ecopunto.reports.v1',
  records: 'ecopunto.records.v1',
  neighborhood: 'ecopunto.neighborhood.v1',
  reminder: 'ecopunto.reminder.v1',
  quiz: 'ecopunto.quiz.v1',
  theme: 'ecopunto.theme.v1',
} as const;

/** Centinela: la clave no existe (distinto de null válido). */
export const NO_DATA = Symbol('sin-datos');

let storageAvailable = true;

export function isStorageAvailable(): boolean {
  return storageAvailable;
}

/** Lee y parsea JSON; ante cualquier error devuelve el fallback. */
export function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    storageAvailable = false;
    return fallback;
  }
}

/** Lee el valor crudo de una clave, sin parsear. */
export function storageGetRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    storageAvailable = false;
    return null;
  }
}

/** Guarda un valor serializado a JSON. */
export function storageSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    storageAvailable = false;
    return false;
  }
}

/** Guarda un string crudo (usado por el tema). */
export function storageSetRaw(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    storageAvailable = false;
    return false;
  }
}

/**
 * Carga un array desde storage. Si no hay un array guardado, siembra los datos
 * iniciales y los persiste. Si hay array guardado, lo sanea; si el resultado
 * de sanear es vacío/nulo se devuelve lo que indique `sanitize`.
 */
export function loadArraySeed<T>(
  key: string,
  seedFactory: () => T[],
  sanitize: (data: unknown) => T[] | null,
): T[] {
  const stored = storageGet<unknown>(key, NO_DATA);
  if (Array.isArray(stored)) {
    return sanitize(stored) ?? [];
  }
  const seed = seedFactory();
  storageSet(key, seed);
  return seed;
}
