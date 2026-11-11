import { addDays, DAY_NAMES, daysBetween, SHORT_DAY_NAMES } from '@/lib/dates';
import { capitalize, pluralize } from '@/lib/utils';

/** Formatea kilogramos con una coma decimal (es-AR). */
export function formatKg(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);
}

/** Formatea números enteros con separador de miles (es-AR). */
export function formatInteger(value: number): string {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Number(value) || 0);
}

/** "Miércoles 11 de noviembre". */
export function formatLongDate(date: Date): string {
  return capitalize(
    new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date),
  );
}

/** "11 nov" (sin punto final). */
export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
  })
    .format(date)
    .replace('.', '');
}

/** "Mié 11 nov, 14:30". */
export function formatDateTime(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return capitalize(
    new Intl.DateTimeFormat('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date),
  );
}

/** "Hace un momento", "Hace 3 horas", "Ayer", "Hace 2 días" o fecha corta. */
export function timeAgo(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (Number.isNaN(diffSeconds)) return '';
  if (diffSeconds < 60) return 'Hace un momento';
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `Hace ${pluralize(minutes, 'minuto', 'minutos')}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${pluralize(hours, 'hora', 'horas')}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${pluralize(days, 'día', 'días')}`;
  return capitalize(
    new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(date),
  );
}

/** Une días de semana: "Lunes y jueves", "Lunes, martes y jueves". */
export function joinDays(dayNumbers: number[]): string {
  const names = [...new Set(dayNumbers)]
    .sort((a, b) => {
      const order = [1, 2, 3, 4, 5, 6, 0];
      return order.indexOf(a) - order.indexOf(b);
    })
    .map((day) => DAY_NAMES[day]);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} y ${names[1].toLowerCase()}`;
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1].toLowerCase()}`;
}

/** "10 al 16 de noviembre" o "31 oct al 6 nov" si cruza meses. */
export function formatWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  if (sameMonth) {
    const month = new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(monday);
    return `${monday.getDate()} al ${sunday.getDate()} de ${month}`;
  }
  return `${formatShortDate(monday)} al ${formatShortDate(sunday)}`;
}

/** "hoy", "mañana" o el día de semana. */
export function formatCompactRelativeDate(date: Date): string {
  const offset = daysBetween(new Date(), date);
  if (offset === 0) return 'hoy';
  if (offset === 1) return 'mañana';
  return new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(date);
}

/** "Hoy, miércoles 11 de noviembre", "Mañana, ..." o fecha larga. */
export function formatNextCollectionDate(date: Date): string {
  const offset = daysBetween(new Date(), date);
  if (offset === 0) return `Hoy, ${formatLongDate(date).toLowerCase()}`;
  if (offset === 1) return `Mañana, ${formatLongDate(date).toLowerCase()}`;
  return formatLongDate(date);
}

/** Etiqueta corta del día (0 = domingo). */
export function shortDayName(day: number): string {
  return SHORT_DAY_NAMES[day] ?? '';
}
