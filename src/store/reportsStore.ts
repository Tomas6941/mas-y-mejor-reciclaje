import { create } from 'zustand';

import { apiRequest } from '@/lib/api';
import type { RecyclePoint, Report, ReportType } from '@/types/domain';

interface ReportsState {
  reports: Report[];
  loading: boolean;
  fetchReports: () => Promise<void>;
  addReport: (input: { point: RecyclePoint; type: ReportType; comment: string }) => Promise<Report>;
  clearState: () => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  reports: [],
  loading: false,
  fetchReports: async () => {
    set({ loading: true });
    try {
      const reports = await apiRequest<Report[]>('/reports?limit=20');
      set({ reports });
    } finally {
      set({ loading: false });
    }
  },
  addReport: async ({ point, type, comment }) => {
    const created = await apiRequest<Omit<Report, 'pointName'>>('/reports', {
      body: { pointId: point.id, type, comment: comment.slice(0, 180) },
    });
    return { ...created, pointName: point.name };
  },
  clearState: () => set({ reports: [], loading: false }),
}));

export function getSortedReports(reports: Report[]): Report[] {
  return reports.slice().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}
