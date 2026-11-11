import { addDays, startOfDay } from '@/lib/dates';
import type { NextCollection, Schedule } from '@/types/domain';

/** Parsea la ventana horaria "HH:MM a HH:MM" de un schedule. */
export function getScheduleWindow(schedule: Schedule): { start: number; end: number } | null {
  const match = /(\d{1,2}):(\d{2})\s*(?:a|-)\s*(\d{1,2}):(\d{2})/.exec(
    String(schedule.time || ''),
  );
  if (!match) return null;
  const start = Number(match[1]) * 60 + Number(match[2]);
  const end = Number(match[3]) * 60 + Number(match[4]);
  return { start, end: end < start ? end + 24 * 60 : end };
}

/** Próxima recolección de un barrio: ordena por fecha y minuto de inicio. */
export function getNextCollection(schedules: Schedule[]): NextCollection | null {
  if (!schedules.length) return null;
  const now = new Date();
  const baseDate = startOfDay(now);
  const currentDay = baseDate.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const options: NextCollection[] = [];

  schedules.forEach((schedule) => {
    const windowInfo = getScheduleWindow(schedule);

    schedule.days.forEach((day) => {
      let offset = (day - currentDay + 7) % 7;

      /* Si la recolección de hoy ya terminó, la próxima es dentro de 7 días. */
      if (offset === 0 && windowInfo && currentMinutes >= windowInfo.end) {
        offset = 7;
      }

      options.push({
        schedule,
        date: addDays(baseDate, offset),
        offset,
        startMinutes: windowInfo ? windowInfo.start : 0,
      });
    });
  });

  options.sort((a, b) => {
    const dateDifference = a.date.getTime() - b.date.getTime();
    if (dateDifference !== 0) return dateDifference;
    return a.startMinutes - b.startMinutes;
  });

  return options[0] ?? null;
}
