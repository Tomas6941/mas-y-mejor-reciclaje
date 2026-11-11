/**
 * Fechas locales, sin conversiones UTC para evitar corrimientos de día.
 * Todos los helpers usan el reloj local del dispositivo, como el sitio original.
 */

/** Primer instante del día local. */
export function startOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Suma días a una fecha local (copia). */
export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

/** Fecha local en formato YYYY-MM-DD. */
export function dateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parsea YYYY-MM-DD como fecha local; null si es inválida. */
export function isoToDate(isoDate: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate))) return null;
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

/** Hoy en formato YYYY-MM-DD. */
export function todayISO(): string {
  return dateToISO(new Date());
}

/** Días completos entre dos fechas. */
export function daysBetween(start: Date, end: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / oneDay);
}

/** Lunes 00:00 de la semana de `date`. */
export function getWeekStart(date: Date = new Date()): Date {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(date, diff));
}

/** Nombres largos de días (0 = domingo). */
export const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;

/** Nombres cortos de días (0 = domingo). */
export const SHORT_DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

/** Semana en orden de calendario, lunes primero. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
