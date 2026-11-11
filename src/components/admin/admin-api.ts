import { apiRequest } from '@/lib/api';
import type { RecyclePoint, ReportType, Schedule } from '@/types/domain';

export type AdminReportStatus = 'pending' | 'approved' | 'rejected';

export interface AdminReport {
  id: string;
  pointId: string;
  pointName: string;
  authorId: string;
  type: ReportType;
  comment: string;
  status: AdminReportStatus;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  email: string;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface Neighborhood {
  id: string;
  name: string;
}

export interface AdminPointInput {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'green_point' | 'container';
  status: RecyclePoint['status'];
  hours: string;
  materials: RecyclePoint['materials'];
}

export interface AdminScheduleInput extends Omit<Schedule, 'time' | 'startTime'> {
  startTime: string;
  endTime: string;
}

export function fetchAdminReports(status: AdminReportStatus): Promise<AdminReport[]> {
  return apiRequest(`/admin/reports?status=${status}&limit=50`);
}

export function reviewAdminReport(id: string, decision: 'approved' | 'rejected') {
  return apiRequest<{ id: string; status: AdminReportStatus }>(`/admin/reports/${encodeURIComponent(id)}`, {
    method: 'PATCH', body: { decision },
  });
}

export function fetchAdminPoints(): Promise<RecyclePoint[]> {
  return apiRequest('/points?limit=100');
}

export function createAdminPoint(input: AdminPointInput) {
  return apiRequest<{ id: string; publicId: string }>('/admin/points', { body: input });
}

export function updateAdminPoint(id: string, input: Partial<Omit<AdminPointInput, 'id'>>) {
  return apiRequest(`/admin/points/${encodeURIComponent(id)}`, { method: 'PATCH', body: input });
}

export function archiveAdminPoint(id: string) {
  return apiRequest(`/admin/points/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function fetchNeighborhoods(): Promise<Neighborhood[]> {
  return apiRequest('/neighborhoods');
}

export function fetchAdminSchedules(slug: string): Promise<{ neighborhood: string; schedules: Schedule[] }> {
  return apiRequest(`/neighborhoods/${encodeURIComponent(slug)}/schedules`);
}

export function saveAdminSchedules(slug: string, input: { name: string; schedules: AdminScheduleInput[] }) {
  return apiRequest(`/admin/neighborhoods/${encodeURIComponent(slug)}/schedules`, { method: 'PUT', body: input });
}

export function archiveAdminNeighborhood(slug: string) {
  return apiRequest(`/admin/neighborhoods/${encodeURIComponent(slug)}`, { method: 'DELETE' });
}

export function fetchAdmins(): Promise<AdminUser[]> {
  return apiRequest('/admin/admins');
}

export function promoteAdmin(email: string) {
  return apiRequest('/admin/admins', { body: { email } });
}

export function revokeAdmin(id: string) {
  return apiRequest(`/admin/admins/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
