import { Clock3, MapPin } from 'lucide-react';
import { MATERIAL_MAP, STATUS } from '@/data/materials';
import type { RecyclePoint } from '@/types/domain';

interface MapPointCardProps { point: RecyclePoint; selected: boolean; onClick: () => void; }

const STATUS_CLASSES = {
  available: 'bg-status-available-soft text-status-available-strong',
  'near-full': 'bg-status-near-full-soft text-status-near-full-strong',
  full: 'bg-status-full-soft text-status-full-strong',
  damaged: 'bg-status-damaged-soft text-status-damaged-strong',
} as const;

export function MapPointCard({ point, selected, onClick }: MapPointCardProps) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={`w-full rounded-card border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${selected ? 'border-primary bg-primary-soft' : 'border-border bg-surface'}`}>
      <div className="flex items-start justify-between gap-3"><span className="font-semibold text-foreground">{point.name}</span><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_CLASSES[point.status]}`}>{STATUS[point.status].short}</span></div>
      <span className="mt-2 flex items-start gap-1.5 text-sm text-muted"><MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />{point.address}</span>
      <span className="mt-2 flex items-center gap-1.5 text-xs text-muted"><Clock3 className="size-3.5" aria-hidden="true" />{point.hours}</span>
      <span className="mt-3 flex flex-wrap gap-1.5">{point.materials.map((key) => <span key={key} className="rounded-full px-2 py-1 text-[11px] font-medium" style={{ backgroundColor: `${MATERIAL_MAP[key].color}18`, color: MATERIAL_MAP[key].colorDark }}>{MATERIAL_MAP[key].short}</span>)}</span>
    </button>
  );
}
