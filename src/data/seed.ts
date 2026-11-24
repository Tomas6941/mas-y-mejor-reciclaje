import type { Report, TrackingRecord } from '@/types/domain';

import { addDays, dateToISO, startOfDay } from '@/lib/dates';

/** Reportes de ejemplo para la primera visita. */
export function createSeedReports(): Report[] {
  const now = Date.now();
  return [
    {
      id: 'seed-report-1',
      pointId: 'c-mercado-norte',
      pointName: 'Contenedor Mercado Norte',
      category: 'container_status',
      type: 'full',
      comment: 'Está desbordado y hay bolsas alrededor.',
      timestamp: new Date(now - 48 * 60 * 1000).toISOString(),
    },
    {
      id: 'seed-report-2',
      pointId: 'c-plaza-guemes',
      pointName: 'Contenedor Plaza Güemes',
      category: 'container_status',
      type: 'damaged',
      comment: 'Le falta la tapa y está sucio.',
      timestamp: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'seed-report-3',
      pointId: 'pv-ciudad-universitaria',
      pointName: 'Punto Verde Ciudad Universitaria',
      category: 'container_status',
      type: 'available',
      comment: 'Limpio y con lugar para dejar reciclables.',
      timestamp: new Date(now - 29 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

/** Registros de seguimiento de ejemplo para la primera visita. */
export function createSeedRecords(): TrackingRecord[] {
  const baseDate = startOfDay(new Date());
  return [
    { id: 'seed-rec-1', material: 'plastico', kg: 2.4, date: dateToISO(baseDate) },
    { id: 'seed-rec-2', material: 'papel', kg: 1.8, date: dateToISO(addDays(baseDate, -1)) },
    { id: 'seed-rec-3', material: 'vidrio', kg: 0.8, date: dateToISO(addDays(baseDate, -1)) },
    { id: 'seed-rec-4', material: 'organico', kg: 3.2, date: dateToISO(addDays(baseDate, -2)) },
    { id: 'seed-rec-5', material: 'plastico', kg: 4.1, date: dateToISO(addDays(baseDate, -8)) },
    { id: 'seed-rec-6', material: 'metal', kg: 1.4, date: dateToISO(addDays(baseDate, -15)) },
    { id: 'seed-rec-7', material: 'papel', kg: 2.7, date: dateToISO(addDays(baseDate, -22)) },
    { id: 'seed-rec-8', material: 'electronicos', kg: 0.9, date: dateToISO(addDays(baseDate, -35)) },
  ];
}
