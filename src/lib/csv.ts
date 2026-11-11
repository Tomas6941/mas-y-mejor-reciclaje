import { MATERIAL_MAP } from '@/data/materials';
import { todayISO } from '@/lib/dates';
import type { TrackingRecord } from '@/types/domain';

/** Escapa un valor para CSV (comillas si hay coma, comillas o saltos). */
export function csvEscape(value: string | number): string {
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

/** Genera el contenido CSV (BOM + CRLF, decimal con coma) de los registros. */
export function recordsToCsv(records: TrackingRecord[]): string {
  const header = ['Material', 'Cantidad (kg)', 'Fecha'];
  const rows = records
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((record) => [
      MATERIAL_MAP[record.material]?.label ?? record.material,
      String(record.kg).replace('.', ','),
      record.date,
    ]);

  return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
}

/** Descarga los registros como ecopunto-registros-YYYY-MM-DD.csv. */
export function downloadRecordsCsv(records: TrackingRecord[]): void {
  const csv = recordsToCsv(records);
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ecopunto-registros-${todayISO()}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
