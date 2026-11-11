import { AlertTriangle, CheckCircle2, CircleDot, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { STATUS } from '@/data/materials';
import { cn } from '@/lib/utils';
import type { PointStatus } from '@/types/domain';

const STATUS_ICONS: Record<PointStatus, LucideIcon> = {
  available: CheckCircle2,
  'near-full': CircleDot,
  full: XCircle,
  damaged: AlertTriangle,
};

const STATUS_CLASSES: Record<PointStatus, string> = {
  available: 'bg-status-available-soft text-status-available-strong',
  'near-full': 'bg-status-near-full-soft text-status-near-full-strong',
  full: 'bg-status-full-soft text-status-full-strong',
  damaged: 'bg-status-damaged-soft text-status-damaged-strong',
};

export interface StatusPillProps {
  status: PointStatus;
  withIcon?: boolean;
  className?: string;
}

/** Chip de estado de un punto (Disponible, Casi lleno, Lleno, Dañado). */
export function StatusPill({ status, withIcon = true, className }: StatusPillProps) {
  const Icon = STATUS_ICONS[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        STATUS_CLASSES[status],
        className,
      )}
    >
      {withIcon && <Icon className="size-3.5" aria-hidden="true" />}
      {STATUS[status].short}
    </span>
  );
}
