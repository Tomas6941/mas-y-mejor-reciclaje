import { create } from 'zustand';

import { apiRequest } from '@/lib/api';
import type { RecyclePoint, Report, ReportCategory, ReportType } from '@/types/domain';

interface ReportsState {
  reports: Report[];
  loading: boolean;
  fetchReports: () => Promise<void>;
  addReport: (input: { point: RecyclePoint | null; category: ReportCategory; type: ReportType; comment: string; suggestedLocation: string; suggestedName?: string; suggestedLat?: number; suggestedLng?: number; imageData?: string }) => Promise<Report>;
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
  addReport: async ({ point, category, type, comment, suggestedLocation, suggestedName, suggestedLat, suggestedLng, imageData }) => {
    const created = await apiRequest<Omit<Report, 'pointName'> & { pointName?: string | null }>('/reports', {
      body: { pointId: point?.id ?? '', category, type, comment, suggestedLocation, suggestedName, suggestedLat, suggestedLng, imageData },
    });
    return { ...created, pointName: point?.name ?? null };
  },
  clearState: () => set({ reports: [], loading: false }),
}));

export function getSortedReports(reports: Report[]): Report[] {
  return reports.slice().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}
