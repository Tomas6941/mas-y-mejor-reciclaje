import type { AchievementDefinition } from '@/types/domain';

/** Definiciones de logros del seguimiento. */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-kg',
    title: 'Primer kilo',
    description: 'Registrá al menos 1 kg reciclado.',
    icon: 'sprout',
    metric: 'total',
    target: 1,
    unit: 'kg',
  },
  {
    id: 'plastic-10',
    title: 'Plástico en serio',
    description: 'Acumulá 10 kg de plástico.',
    icon: 'cup',
    metric: 'plastico',
    target: 10,
    unit: 'kg',
  },
  {
    id: 'five-records',
    title: 'Constancia',
    description: 'Completá 5 registros de reciclaje.',
    icon: 'calendar',
    metric: 'count',
    target: 5,
    unit: 'registros',
  },
  {
    id: 'diverse-materials',
    title: 'Mezcla perfecta',
    description: 'Reciclá al menos 4 materiales distintos.',
    icon: 'palette',
    metric: 'distinctMaterials',
    target: 4,
    unit: 'materiales',
  },
  {
    id: 'streak-7',
    title: 'Racha verde',
    description: 'Alcanzá 7 días consecutivos reciclando.',
    icon: 'flame',
    metric: 'maxStreak',
    target: 7,
    unit: 'dias',
  },
  {
    id: 'club-50',
    title: 'Club de los 50',
    description: 'Llegá a 50 kg reciclados en total.',
    icon: 'trophy',
    metric: 'total',
    target: 50,
    unit: 'kg',
  },
];
