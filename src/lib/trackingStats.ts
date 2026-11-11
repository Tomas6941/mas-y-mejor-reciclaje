import { MATERIALS } from '@/data/materials';
import { addDays, dateToISO, daysBetween, isoToDate, todayISO } from '@/lib/dates';
import type { MaterialKey, MaterialTotal, TrackingRecord, TrackingStats } from '@/types/domain';

/** Total de kg por material (todos los materiales, con ceros). */
export function getMaterialTotals(
  records: TrackingRecord[],
): Record<MaterialKey, number> {
  const byMaterial = Object.fromEntries(
    MATERIALS.map((material) => [material.key, 0]),
  ) as Record<MaterialKey, number>;
  records.forEach((record) => {
    if (byMaterial[record.material] !== undefined) {
      byMaterial[record.material] += Number(record.kg) || 0;
    }
  });
  return byMaterial;
}

/** Racha actual: solo cuenta si hay registro hoy o ayer. */
export function getCurrentStreak(records: TrackingRecord[]): number {
  const dates = [...new Set(records.map((record) => record.date).filter(Boolean))]
    .sort()
    .reverse();
  if (!dates.length) return 0;
  const today = todayISO();
  const yesterday = dateToISO(addDays(new Date(), -1));
  let cursor = dates[0] === today ? today : dates[0] === yesterday ? yesterday : '';
  if (!cursor) return 0;
  let streak = 0;
  dates.forEach((date) => {
    if (date === cursor) {
      streak += 1;
      const previous = isoToDate(cursor);
      cursor = previous ? dateToISO(addDays(previous, -1)) : '';
    } else if (date < cursor) {
      // Al no ser consecutiva, se corta la racha actual.
      cursor = '';
    }
  });
  return streak;
}

/** Racha más larga histórica. */
export function getMaxStreak(records: TrackingRecord[]): number {
  const dates = [...new Set(records.map((record) => record.date).filter(Boolean))].sort();
  let maxStreak = 0;
  let current = 0;
  let previousDate: Date | null = null;
  dates.forEach((date) => {
    const parsed = isoToDate(date);
    if (!parsed) return;
    if (previousDate && daysBetween(previousDate, parsed) === 1) {
      current += 1;
    } else {
      current = 1;
    }
    maxStreak = Math.max(maxStreak, current);
    previousDate = parsed;
  });
  return maxStreak;
}

/** Métricas completas de seguimiento. */
export function getTrackingStats(records: TrackingRecord[]): TrackingStats {
  const byMaterial = getMaterialTotals(records);
  const total = Object.values(byMaterial).reduce((sum, value) => sum + value, 0);
  const populatedMaterials = MATERIALS.filter((material) => byMaterial[material.key] > 0);
  const topMaterial =
    populatedMaterials.slice().sort((a, b) => byMaterial[b.key] - byMaterial[a.key])[0] ?? null;
  const thisMonthPrefix = todayISO().slice(0, 7);
  const monthlyTotal = records
    .filter((record) => record.date && record.date.startsWith(thisMonthPrefix))
    .reduce((sum, record) => sum + Number(record.kg), 0);

  return {
    total,
    count: records.length,
    byMaterial,
    populatedMaterials,
    topMaterial,
    distinctMaterials: populatedMaterials.length,
    currentStreak: getCurrentStreak(records),
    maxStreak: getMaxStreak(records),
    monthlyTotal,
  };
}

/** Pares material/kg ordenados de mayor a menor, para gráficos. */
export function getMaterialTotalList(stats: TrackingStats): MaterialTotal[] {
  return stats.populatedMaterials
    .map((material) => ({ material, kg: stats.byMaterial[material.key] }))
    .sort((a, b) => b.kg - a.kg);
}
