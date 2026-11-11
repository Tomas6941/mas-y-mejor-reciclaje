/* eslint-disable react-refresh/only-export-components -- MATERIAL_ICONS se comparte con las secciones */
import type { LucideIcon } from 'lucide-react';
import { Apple, BatteryCharging, Cpu, CupSoda, Newspaper, Trash2, Wine } from 'lucide-react';

import { MATERIAL_MAP } from '@/data/materials';
import { cn } from '@/lib/utils';
import type { MaterialKey, WasteCategoryKey } from '@/types/domain';

/** Ícono Lucide por material (nada de emojis). */
export const MATERIAL_ICONS: Record<MaterialKey, LucideIcon> = {
  papel: Newspaper,
  plastico: CupSoda,
  vidrio: Wine,
  metal: Trash2,
  organico: Apple,
  electronicos: Cpu,
  pilas: BatteryCharging,
};

/** Clases literales para que Tailwind las detecte (no interpolación). */
const SOFT_CLASSES: Record<WasteCategoryKey, string> = {
  papel: 'bg-material-papel-soft text-material-papel-strong',
  plastico: 'bg-material-plastico-soft text-material-plastico-strong',
  vidrio: 'bg-material-vidrio-soft text-material-vidrio-strong',
  metal: 'bg-material-metal-soft text-material-metal-strong',
  organico: 'bg-material-organico-soft text-material-organico-strong',
  electronicos: 'bg-material-electronicos-soft text-material-electronicos-strong',
  pilas: 'bg-material-pilas-soft text-material-pilas-strong',
  general: 'bg-material-general-soft text-material-general-strong',
};

const OUTLINE_CLASSES: Record<WasteCategoryKey, string> = {
  papel: 'border-material-papel text-material-papel-strong',
  plastico: 'border-material-plastico text-material-plastico-strong',
  vidrio: 'border-material-vidrio text-material-vidrio-strong',
  metal: 'border-material-metal text-material-metal-strong',
  organico: 'border-material-organico text-material-organico-strong',
  electronicos: 'border-material-electronicos text-material-electronicos-strong',
  pilas: 'border-material-pilas text-material-pilas-strong',
  general: 'border-material-general text-material-general-strong',
};

export interface MaterialBadgeProps {
  material: MaterialKey | WasteCategoryKey;
  /** Muestra el ícono además de la etiqueta. */
  withIcon?: boolean;
  /** Variante visual. */
  variant?: 'soft' | 'outline';
  className?: string;
}

/** Chip de material/categoría con su color propio (AA sobre fondo soft). */
export function MaterialBadge({
  material,
  withIcon = true,
  variant = 'soft',
  className,
}: MaterialBadgeProps) {
  const info = MATERIAL_MAP[material as MaterialKey];
  const Icon = material === 'general' ? Trash2 : MATERIAL_ICONS[material as MaterialKey];
  const label = info?.short ?? 'Comunes';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        variant === 'soft' ? SOFT_CLASSES[material] : OUTLINE_CLASSES[material],
        variant === 'outline' && 'border bg-transparent',
        className,
      )}
    >
      {withIcon && Icon && <Icon className="size-3.5" aria-hidden="true" />}
      {label}
    </span>
  );
}
