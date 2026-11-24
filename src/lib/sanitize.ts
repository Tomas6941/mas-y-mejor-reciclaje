import { NEIGHBORHOODS } from '@/data/neighborhoods';
import { MATERIAL_MAP, REPORT_TO_STATUS, STATUS } from '@/data/materials';
import { isoToDate } from '@/lib/dates';
import { clamp, makeId } from '@/lib/utils';
import type { MaterialKey, QuizResultState, RecyclePoint, Reminder, Report, TrackingRecord } from '@/types/domain';

const STATUS_REPORT_TYPES = ['full', 'damaged', 'available'] as const;

/** Sanea puntos guardados; null si no es un array. */
export function sanitizePoints(data: unknown): RecyclePoint[] | null {
  if (!Array.isArray(data)) return null;
  return data
    .filter(
      (point): point is Record<string, unknown> =>
        Boolean(point) &&
        typeof (point as Record<string, unknown>).name === 'string' &&
        Number.isFinite(Number((point as Record<string, unknown>).lat)) &&
        Number.isFinite(Number((point as Record<string, unknown>).lng)),
    )
    .map((point, index) => ({
      id: String(point.id || `point-${index}`),
      name: String(point.name),
      address: String(point.address || 'Córdoba, Argentina'),
      lat: Number(point.lat),
      lng: Number(point.lng),
      type: point.type === 'Contenedor' ? 'Contenedor' : 'Punto verde',
      materials: Array.isArray(point.materials)
        ? (point.materials.filter((material) => MATERIAL_MAP[material as MaterialKey]) as MaterialKey[])
        : [],
      status: STATUS[point.status as RecyclePoint['status']] ? (point.status as RecyclePoint['status']) : 'available',
      hours: String(point.hours || 'Consultar horario'),
    }));
}

/** Sanea reportes guardados; null si no es un array. */
export function sanitizeReports(data: unknown): Report[] | null {
  if (!Array.isArray(data)) return null;
  return data
    .filter(
      (report): report is Record<string, unknown> =>
        Boolean(report) &&
        typeof report.id !== 'undefined' &&
        typeof report.pointId !== 'undefined' &&
        STATUS_REPORT_TYPES.includes(report.type as typeof STATUS_REPORT_TYPES[number]) &&
        REPORT_TO_STATUS[report.type as typeof STATUS_REPORT_TYPES[number]] !== undefined,
    )
    .map((report) => {
      const timestamp = new Date(String(report.timestamp));
      return {
        id: String(report.id),
        pointId: String(report.pointId),
        pointName: String(report.pointName || 'Punto de reciclaje'),
        category: 'container_status' as const,
        type: report.type as Report['type'],
        comment: String(report.comment || '').slice(0, 500),
        timestamp: Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString(),
      };
    })
    .filter((report) => report.timestamp !== null)
    .map((report) => ({ ...report, timestamp: report.timestamp! }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/** Sanea registros de seguimiento; null si no es un array. */
export function sanitizeRecords(data: unknown): TrackingRecord[] | null {
  if (!Array.isArray(data)) return null;
  return data
    .filter(
      (record): record is Record<string, unknown> =>
        Boolean(record) &&
        MATERIAL_MAP[record.material as MaterialKey] !== undefined &&
        Number(record.kg) > 0 &&
        isoToDate(String(record.date)) !== null,
    )
    .map((record) => ({
      id: String(record.id || makeId('record')),
      material: record.material as MaterialKey,
      kg: Math.round(Number(record.kg) * 100) / 100,
      date: String(record.date),
    }));
}

/** Sanea el barrio guardado; devuelve null si es inválido. */
export function validateNeighborhood(data: unknown): string | null {
  return typeof data === 'string' && NEIGHBORHOODS[data] ? data : null;
}

/** Sanea el recordatorio guardado. */
export function validateReminder(data: unknown): Reminder {
  if (data && typeof data === 'object') {
    const stored = data as Record<string, unknown>;
    if (typeof stored.enabled === 'boolean') {
      return {
        enabled: stored.enabled,
        neighborhood:
          typeof stored.neighborhood === 'string' && NEIGHBORHOODS[stored.neighborhood]
            ? stored.neighborhood
            : null,
        createdAt: typeof stored.createdAt === 'string' ? stored.createdAt : null,
      };
    }
  }
  return { enabled: false, neighborhood: null, createdAt: null };
}

/** Sanea el resultado del quiz guardado. */
export function validateQuizResult(data: unknown): QuizResultState {
  if (!data || typeof data !== 'object') {
    return { best: 0, attempts: 0, lastScore: null, lastDate: null };
  }
  const stored = data as Record<string, unknown>;
  const lastScoreNumber = Number(stored.lastScore);
  return {
    best: clamp(Number(stored.best) || 0, 0, 5),
    attempts: Math.max(0, Number(stored.attempts) || 0),
    lastScore: Number.isFinite(lastScoreNumber) ? clamp(lastScoreNumber, 0, 5) : null,
    lastDate: typeof stored.lastDate === 'string' ? stored.lastDate : null,
  };
}
