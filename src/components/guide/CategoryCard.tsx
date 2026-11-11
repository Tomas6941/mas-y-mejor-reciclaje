import { Check, Lightbulb, X } from 'lucide-react';
import { MATERIAL_ICONS } from '@/components/ui/material-badge';
import type { WasteCategory } from '@/types/domain';

export function CategoryCard({ category }: { category: WasteCategory }) {
  const Icon = category.key === 'general' ? X : MATERIAL_ICONS[category.key];
  return (
    <article className="overflow-hidden rounded-card border border-border bg-surface shadow-soft">
      <div className="flex items-start gap-3 border-b border-border p-5"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><Icon className="size-5" aria-hidden="true" /></span><div><h3 className="font-display text-lg font-semibold">{category.label}</h3><p className="mt-1 text-xs font-semibold text-primary">{category.container}</p></div></div>
      <div className="p-5"><p className="text-sm leading-relaxed text-muted">{category.description}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary"><Check className="size-3.5" /> Sí va</h4><ul className="space-y-1.5 text-sm text-foreground">{category.yes.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-danger"><X className="size-3.5" /> No va</h4><ul className="space-y-1.5 text-sm text-muted">{category.no.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
        <div className="mt-5 flex gap-2 rounded-xl bg-accent-soft p-3 text-sm text-accent-foreground"><Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><p>{category.tip}</p></div>
      </div>
    </article>
  );
}
