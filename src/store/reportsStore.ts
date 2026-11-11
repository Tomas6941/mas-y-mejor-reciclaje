import { create } from 'zustand';

import { createSeedReports } from '@/data/seed';
import { REPORT_TO_STATUS } from '@/data/materials';
import { loadArraySeed, storageSet, STORAGE_KEYS } from '@/lib/storage';
import { sanitizeReports } from '@/lib/sanitize';
import { makeId } from '@/lib/utils';
import { usePointsStore } from '@/store/pointsStore';
import type { RecyclePoint, Report, ReportType } from '@/types/domain';

interface ReportsState {
  reports: Report[];
  /**
   * Agrega un reporte al inicio de la lista, actualiza el estado del punto y
   * persiste ambas claves (points y reports), igual que el sitio original.
   */
  addReport: (input: { point: RecyclePoint; type: ReportType; comment: string }) => Report;
}

/**
 * Reportes de la comunidad.
 *
 * Formato original: array JSON plano en ecopunto.reports.v1. Si la persona
 * borró sus datos, la lista queda vacía (no se vuelve a sembrar).
 */
export const useReportsStore = create<ReportsState>((set, get) => ({
  reports: loadArraySeed(
    STORAGE_KEYS.reports,
    createSeedReports,
    (data) => sanitizeReports(data) ?? [],
  ),
  addReport: ({ point, type, comment }) => {
    const report: Report = {
      id: makeId('report'),
      pointId: point.id,
      pointName: point.name,
      type,
      comment: comment.slice(0, 180),
      timestamp: new Date().toISOString(),
    };

    const updated = [report, ...get().reports];
    storageSet(STORAGE_KEYS.reports, updated);
    set({ reports: updated });

    usePointsStore.getState().setPointStatus(point.id, REPORT_TO_STATUS[type]);
    return report;
  },
}));

/** Reportes ordenados del más reciente al más viejo (ya vienen así). */
export function getSortedReports(reports: Report[]): Report[] {
  return reports.slice().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}
