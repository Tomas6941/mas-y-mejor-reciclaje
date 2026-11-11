import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { MATERIALS, MATERIAL_MAP } from '@/data/materials';
import { MAP_CENTER, MAP_ZOOM } from '@/data/constants';
import { navigate } from '@/lib/routes';
import { useHashRoute } from '@/hooks/useHashRoute';
import { usePointsStore } from '@/store';
import type { MaterialKey, PointStatus } from '@/types/domain';
import { MapCanvas } from './MapCanvas';
import { MapPointCard } from './MapPointCard';
import './map.css';

const STATUS_OPTIONS: { value: PointStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos los estados' }, { value: 'available', label: 'Disponible' },
  { value: 'near-full', label: 'Casi lleno' }, { value: 'full', label: 'Lleno' },
  { value: 'damaged', label: 'Dañado' },
];

export default function MapSection() {
  const { points } = usePointsStore();
  const { params } = useHashRoute();
  const [query, setQuery] = useState('');
  const [material, setMaterial] = useState<MaterialKey | 'all'>('all');
  const [status, setStatus] = useState<PointStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const requested = params.get('material');
    const validMaterial = MATERIALS.find((item) => item.key === requested)?.key;
    setMaterial(validMaterial ?? 'all');
    setSelectedId(null);
  }, [params]);

  const filteredPoints = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es-AR');
    return points.filter((point) => {
      const matchesQuery = !normalized || point.name.toLocaleLowerCase('es-AR').includes(normalized) || point.address.toLocaleLowerCase('es-AR').includes(normalized);
      return matchesQuery && (material === 'all' || point.materials.includes(material)) && (status === 'all' || point.status === status);
    });
  }, [points, query, material, status]);
  const selectedPoint = filteredPoints.find((point) => point.id === selectedId) ?? null;

  return (
    <section className="container-page pb-16 pt-28">
      <header className="mb-8 max-w-3xl"><p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">EcoPunto Córdoba</p><h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Encontrá dónde reciclar</h1><p className="mt-3 text-base text-muted sm:text-lg">Explorá puntos verdes y contenedores. Filtrá por material y consultá el estado informado de cada punto.</p></header>
      <div className="mb-5 grid gap-3 rounded-bento border border-border bg-surface p-4 shadow-soft sm:grid-cols-[minmax(0,1fr)_220px_220px] sm:p-5">
        <label className="relative block"><span className="sr-only">Buscar por nombre o dirección</span><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Barrio, dirección o punto verde…" className="h-11 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
        <label className="flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4"><SlidersHorizontal className="size-4 shrink-0 text-muted" aria-hidden="true" /><span className="sr-only">Filtrar por material</span><select value={material} onChange={(event) => { setMaterial(event.target.value as MaterialKey | 'all'); setSelectedId(null); }} className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"><option value="all">Todos los materiales</option>{MATERIALS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
        <label className="flex h-11 items-center rounded-full border border-border bg-background px-4"><span className="sr-only">Filtrar por estado</span><select value={status} onChange={(event) => setStatus(event.target.value as PointStatus | 'all')} className="w-full bg-transparent text-sm text-foreground outline-none">{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted" aria-live="polite"><strong className="text-foreground">{filteredPoints.length}</strong> {filteredPoints.length === 1 ? 'punto encontrado' : 'puntos encontrados'}</p>{material !== 'all' && <button type="button" onClick={() => setMaterial('all')} className="text-sm font-medium text-primary hover:underline">Limpiar filtro de {MATERIAL_MAP[material].short}</button>}</div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
        <div className="overflow-hidden rounded-bento border border-border bg-surface shadow-soft"><div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5"><div className="flex items-center gap-2"><MapPin className="size-4 text-primary" aria-hidden="true" /><h2 className="font-semibold">Mapa de Córdoba</h2></div><span className="text-xs text-muted">OpenStreetMap</span></div><MapCanvas points={filteredPoints} selectedId={selectedId} onSelect={setSelectedId} center={MAP_CENTER} zoom={MAP_ZOOM} /><div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border px-4 py-3 text-xs text-muted sm:px-5"><span className="font-medium text-foreground">Materiales:</span>{MATERIALS.map((item) => <span key={item.key} className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.short}</span>)}</div></div>
        <aside className="space-y-3" aria-label="Listado de puntos de reciclaje"><div className="flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Puntos de reciclaje</h2><span className="text-xs text-muted">Seleccioná para ubicar</span></div>{filteredPoints.length ? filteredPoints.map((point) => <MapPointCard key={point.id} point={point} selected={selectedId === point.id} onClick={() => setSelectedId(point.id)} />) : <div className="rounded-card border border-dashed border-border bg-surface-soft px-5 py-10 text-center"><MapPin className="mx-auto size-8 text-muted" aria-hidden="true" /><p className="mt-3 font-semibold">No encontramos puntos</p><p className="mt-1 text-sm text-muted">Probá con otro barrio o quitá algún filtro.</p><button type="button" onClick={() => { setQuery(''); setMaterial('all'); setStatus('all'); }} className="mt-4 text-sm font-semibold text-primary hover:underline">Limpiar búsqueda</button></div>}{selectedPoint && <button type="button" onClick={() => navigate(`#/reportar?point=${encodeURIComponent(selectedPoint.id)}`)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover">Reportar este punto <ArrowUpRight className="size-4" aria-hidden="true" /></button>}</aside>
      </div>
      <p className="mt-5 text-xs leading-relaxed text-muted">La ubicación y los horarios son datos de referencia de la aplicación. Confirmá la recepción de materiales y el horario antes de acercarte.</p>
    </section>
  );
}
