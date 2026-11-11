import { ACHIEVEMENT_DEFINITIONS } from '@/data/achievements';
import { formatKg } from '@/lib/format';
import { clamp } from '@/lib/utils';
import type { AchievementMetricKey, AchievementView, TrackingStats } from '@/types/domain';

/** Valor de la métrica de un logro según las stats. */
function metricValue(stats: TrackingStats, metric: AchievementMetricKey): number {
  if (metric === 'plastico') return stats.byMaterial.plastico;
  return stats[metric];
}

/** Calcula valor, progreso y estado de cada logro a partir de las métricas. */
export function getAchievementData(stats: TrackingStats): AchievementView[] {
  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const value = metricValue(stats, definition.metric);
    const target = definition.target;
    const unlocked = value >= target;
    const bounded = Math.min(value, target);

    const progressText =
      definition.unit === 'kg'
        ? `${formatKg(bounded)} / ${formatKg(target)} kg`
        : `${bounded} / ${target} ${definition.unit}`;

    return {
      definition,
      value,
      target,
      unlocked,
      progress: clamp((value / target) * 100, 0, 100),
      progressText,
    };
  });
}

/** Títulos de logros recién desbloqueados (para toasts). */
export function getNewlyUnlockedTitles(
  previous: TrackingStats,
  current: TrackingStats,
): string[] {
  const previousUnlocked = new Set(
    getAchievementData(previous)
      .filter((achievement) => achievement.unlocked)
      .map((achievement) => achievement.definition.id),
  );
  return getAchievementData(current)
    .filter(
      (achievement) => achievement.unlocked && !previousUnlocked.has(achievement.definition.id),
    )
    .map((achievement) => `“${achievement.definition.title}”`);
}
