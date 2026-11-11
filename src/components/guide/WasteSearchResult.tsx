import { ArrowRight, Recycle } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import { navigate } from '@/lib/routes';
import type { WasteItem } from '@/types/domain';

export function WasteSearchResult({ item }: { item: WasteItem }) {
  const category = CATEGORIES[item.category];
  return (
    <article className="rounded-card border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-sm font-medium text-primary">{category.container}</p></div><Recycle className="size-5 shrink-0 text-primary" aria-hidden="true" /></div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{item.tip ?? category.tip}</p>
      {item.category !== 'general' && <button type="button" onClick={() => navigate(`#/mapa?material=${encodeURIComponent(item.category)}`)} className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">Ver puntos que reciben este material <ArrowRight className="size-4" aria-hidden="true" /></button>}
    </article>
  );
}
