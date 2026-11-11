import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, Sparkles } from 'lucide-react';
import { ALL_CATEGORY_KEYS, CATEGORIES } from '@/data/categories';
import { getWasteMatches } from '@/lib/wasteSearch';
import { useHashRoute } from '@/hooks/useHashRoute';
import type { WasteCategoryKey } from '@/types/domain';
import { CategoryCard } from './CategoryCard';
import { WasteSearchResult } from './WasteSearchResult';
import { RecyclingQuiz } from './RecyclingQuiz';
import './guide.css';

export default function GuideSection() {
  const { params } = useHashRoute();
  const [query, setQuery] = useState(() => params.get('q') ?? '');
  const [activeCategory, setActiveCategory] = useState<WasteCategoryKey | 'all'>('all');
  const matches = useMemo(() => getWasteMatches(query).slice(0, 8), [query]);
  const categories = ALL_CATEGORY_KEYS.map((key) => CATEGORIES[key]);
  const visibleCategories = activeCategory === 'all' ? categories : categories.filter((category) => category.key === activeCategory);

  useEffect(() => {
    const requested = params.get('q');
    if (requested !== null) setQuery(requested);
  }, [params]);

  return (
    <section className="container-page pb-16 pt-28">
      <header className="mb-9 max-w-3xl"><p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Aprendé a separar</p><h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Guía de reciclaje</h1><p className="mt-3 text-base text-muted sm:text-lg">Cada residuo tiene su lugar. Buscá un material o explorá las categorías para saber cómo prepararlo.</p></header>
      <section className="guide-search-panel mb-10 rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-7" aria-labelledby="waste-search-title">
        <div className="mb-4 flex items-center gap-2"><Search className="size-5 text-primary" aria-hidden="true" /><h2 id="waste-search-title" className="font-display text-xl font-semibold">¿Dónde va este residuo?</h2></div>
        <label className="relative block"><span className="sr-only">Escribí el nombre del residuo</span><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej.: botella, yerba, caja de pizza…" className="h-12 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
        {query.trim() && <div className="mt-4" aria-live="polite"><p className="mb-3 text-sm text-muted">{matches.length ? `Resultados para “${query}”` : 'No encontramos coincidencias exactas. Probá con otra palabra.'}</p><div className="grid gap-3 sm:grid-cols-2">{matches.map((item) => <WasteSearchResult key={item.name} item={item} />)}</div></div>}
      </section>
      <section aria-labelledby="categories-title">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-sm font-semibold text-primary">Separación responsable</p><h2 id="categories-title" className="font-display text-2xl font-semibold sm:text-3xl">Explorá los materiales</h2></div><button type="button" onClick={() => setActiveCategory('all')} className="min-h-11 rounded-full border border-border px-4 text-sm font-medium text-foreground transition hover:bg-surface-soft">Ver todas</button></div>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2" aria-label="Filtrar categorías"><button type="button" onClick={() => setActiveCategory('all')} aria-pressed={activeCategory === 'all'} className={`guide-filter ${activeCategory === 'all' ? 'guide-filter-active' : ''}`}>Todas</button>{categories.map((category) => <button key={category.key} type="button" onClick={() => setActiveCategory(category.key)} aria-pressed={activeCategory === category.key} className={`guide-filter ${activeCategory === category.key ? 'guide-filter-active' : ''}`}>{category.shortLabel}</button>)}</div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleCategories.map((category) => <CategoryCard key={category.key} category={category} />)}</div>
      </section>
      <section className="mt-14" aria-labelledby="quiz-title"><div className="mb-5 flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-foreground"><Sparkles className="size-5" aria-hidden="true" /></span><div><p className="text-sm font-semibold text-primary">Poné a prueba lo que aprendiste</p><h2 id="quiz-title" className="font-display text-2xl font-semibold">Desafío de reciclaje</h2></div></div><RecyclingQuiz /></section>
      <div className="mt-10 flex items-start gap-3 rounded-card border border-border bg-surface-soft p-4 text-sm text-muted"><BookOpen className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><p>Las indicaciones son orientativas. La recepción de ciertos materiales puede variar según el punto verde y las disposiciones locales.</p></div>
    </section>
  );
}
