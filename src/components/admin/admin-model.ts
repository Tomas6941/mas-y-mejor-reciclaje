import type { AuthUser } from '@/store/authStore';
import type { RecyclePoint, Schedule } from '@/types/domain';
import type { AdminPointInput, AdminScheduleInput } from './admin-api';

export function isAdmin(user: Pick<AuthUser, 'role'> | null): boolean {
  return user?.role === 'admin';
}

export function toAdminPointInput(point: RecyclePoint): AdminPointInput {
  return {
    id: point.id,
    name: point.name,
    address: point.address,
    lat: point.lat,
    lng: point.lng,
    type: point.type === 'Punto verde' ? 'green_point' : 'container',
    status: point.status,
    hours: point.hours,
    materials: point.materials,
  };
}

export function toScheduleInput(schedule: Schedule): AdminScheduleInput {
  const match = /^(\d{2}:\d{2}) a (\d{2}:\d{2})$/.exec(schedule.time);
  if (!match) throw new Error('El rango horario no tiene un formato válido.');
  const [, startTime, endTime] = match;
  return {
    key: schedule.key,
    name: schedule.name,
    icon: schedule.icon,
    color: schedule.color,
    description: schedule.description,
    days: schedule.days,
    startTime,
    endTime,
  };
}
