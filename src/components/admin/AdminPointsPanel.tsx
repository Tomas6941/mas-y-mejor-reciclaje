import { Edit3, LoaderCircle, MapPin, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { MATERIALS } from '@/data/materials';
import type { MaterialKey, PointStatus, RecyclePoint } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toAdminPointInput } from './admin-model';
import { archiveAdminPoint, createAdminPoint, updateAdminPoint } from './admin-api';
import { AdminConfirmDialog } from './AdminConfirmDialog';
import { adminGlass } from './admin-style';

const statuses: { value: PointStatus; label: string }[] = [
  { value: 'available', label: 'Disponible' }, { value: 'near-full', label: 'Casi lleno' },
  { value: 'full', label: 'Lleno' }, { value: 'damaged', label: 'Dañado' },
];

interface PointDraft {
  id: string; name: string; address: string; lat: string; lng: string;
  type: 'green_point' | 'container'; status: PointStatus; hours: string; materials: MaterialKey[];
}
const emptyDraft = (): PointDraft => ({ id: '', name: '', address: '', lat: '', lng: '', type: 'green_point', status: 'available', hours: '', materials: [] });

export function AdminPointsPanel({ points, onUpdated }: { points: RecyclePoint[]; onUpdated: () => void }) {
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RecyclePoint | null>(null);
  const [draft, setDraft] = useState<PointDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState<RecyclePoint | null>(null);
  const [archiveBusy, setArchiveBusy] = useState(false);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return points.filter((point) => !normalized || `${point.name} ${point.address} ${point.id}`.toLowerCase().includes(normalized));
  }, [points, query]);

  function openCreate() { setEditing(null); setDraft(emptyDraft()); setDialogOpen(true); }
  function openEdit(point: RecyclePoint) {
    const apiPoint = toAdminPointInput(point);
    setEditing(point);
    setDraft({ ...apiPoint, lat: String(apiPoint.lat), lng: String(apiPoint.lng) });
    setDialogOpen(true);
  }
  function update<K extends keyof PointDraft>(key: K, value: PointDraft[K]) { setDraft((current) => ({ ...current, [key]: value })); }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lat = Number(draft.lat); const lng = Number(draft.lng);
    if (!draft.name.trim() || !draft.address.trim() || !draft.hours.trim() || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      toast.error('Revisá el nombre, la dirección, los horarios y las coordenadas.'); return;
    }
    const slug = draft.id.trim() || slugify(draft.name);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) { toast.error('El identificador debe usar letras, números y guiones.'); return; }
    setSaving(true);
    try {
      const payload = { id: slug, name: draft.name.trim(), address: draft.address.trim(), lat, lng, type: draft.type, status: draft.status, hours: draft.hours.trim(), materials: draft.materials };
      if (editing) {
        await updateAdminPoint(editing.id, { name: payload.name, address: payload.address, lat, lng, type: payload.type, status: payload.status, hours: payload.hours, materials: payload.materials });
        toast.success('Punto actualizado.');
      } else {
        await createAdminPoint(payload);
        toast.success('Punto agregado.');
      }
      setDialogOpen(false); onUpdated();
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : 'No pudimos guardar el punto.'); }
    finally { setSaving(false); }
  }

  async function archive() {
    if (!archiving) return;
    setArchiveBusy(true);
    try { await archiveAdminPoint(archiving.id); toast.success('Punto archivado.'); setArchiving(null); onUpdated(); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : 'No pudimos archivar el punto.'); }
    finally { setArchiveBusy(false); }
  }

  return <div className="space-y-4">
    <div className={`flex flex-col justify-between gap-3 rounded-[24px] p-4 sm:flex-row sm:items-center sm:p-5 ${adminGlass}`}><div><p className="text-sm text-slate-300">Catálogo público de Córdoba</p><p className="mt-1 text-xs text-slate-500">Los puntos archivados dejan de mostrarse en el mapa.</p></div><Button onClick={openCreate} className="bg-blue-500 text-white hover:bg-blue-400"><Plus size={15} />Agregar punto</Button></div>
    <section className={`overflow-hidden rounded-[26px] ${adminGlass}`}>
      <div className="flex flex-col justify-between gap-3 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:px-6"><div><h3 className="font-display text-lg font-semibold">Puntos de reciclaje</h3><p className="mt-1 text-xs text-slate-500">{filtered.length} de {points.length} puntos activos</p></div><div className="relative sm:w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nombre o dirección" aria-label="Buscar puntos" className="h-10 border-white/10 bg-white/[0.035] pl-9 text-slate-100 placeholder:text-slate-500 focus-visible:border-blue-300/50 focus-visible:ring-blue-300/20" /></div></div>
      {filtered.length === 0 ? <div className="grid min-h-56 place-items-center px-6 text-center"><div><MapPin size={21} className="mx-auto text-slate-500" /><p className="mt-3 text-sm text-slate-300">{points.length ? 'No hay coincidencias.' : 'Todavía no hay puntos activos.'}</p><p className="mt-1 text-xs text-slate-500">Podés agregar un punto desde el botón superior.</p></div></div>
        : <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((point) => <article key={point.id} className="rounded-2xl border border-white/[0.065] bg-white/[0.025] p-4 transition hover:border-blue-300/15 hover:bg-white/[0.04]"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl border border-blue-300/10 bg-blue-400/[0.07] text-blue-200"><MapPin size={17} /></span><div className="min-w-0"><h4 className="truncate font-medium text-slate-100">{point.name}</h4><p className="mt-1 truncate text-[11px] text-slate-500">{point.address}</p></div></div><span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-medium ${point.status === 'available' ? 'border-emerald-300/10 bg-emerald-300/[0.05] text-emerald-100' : point.status === 'damaged' ? 'border-rose-300/10 bg-rose-300/[0.05] text-rose-100' : 'border-amber-300/10 bg-amber-300/[0.05] text-amber-100'}`}>{statuses.find((item) => item.value === point.status)?.label}</span></div><div className="mt-4 flex flex-wrap gap-1.5">{point.materials.slice(0, 4).map((key) => <span key={key} className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[10px] text-slate-400">{MATERIALS.find((item) => item.key === key)?.short ?? key}</span>)}{point.materials.length > 4 && <span className="px-1 py-1 text-[10px] text-slate-500">+{point.materials.length - 4}</span>}</div><div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3"><span className="text-[10px] text-slate-600">{point.type} · {point.lat.toFixed(3)}, {point.lng.toFixed(3)}</span><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label={`Editar ${point.name}`} onClick={() => openEdit(point)} className="size-8 text-slate-400 hover:bg-blue-300/10 hover:text-blue-100"><Edit3 size={14} /></Button><Button variant="ghost" size="icon" aria-label={`Archivar ${point.name}`} onClick={() => setArchiving(point)} className="size-8 text-slate-500 hover:bg-rose-300/10 hover:text-rose-100"><Trash2 size={14} /></Button></div></div></article>)}</div>}
    </section>

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#111b2b] text-slate-100 sm:max-w-2xl"><DialogTitle>{editing ? 'Editar punto' : 'Agregar punto'}</DialogTitle><DialogDescription className="text-slate-400">Los datos guardados aparecen en el mapa para toda la comunidad.</DialogDescription><form onSubmit={(event) => void save(event)} className="mt-5 grid gap-4 sm:grid-cols-2">
      {!editing && <Field label="Identificador" hint="Se sugiere desde el nombre." ><Input required value={draft.id} onChange={(event) => update('id', event.target.value || slugify(draft.name))} placeholder={slugify(draft.name || 'nuevo-punto')} className="border-white/10 bg-white/[0.04] text-slate-100 placeholder:text-slate-600" /></Field>}
      <Field label="Nombre"><Input required value={draft.name} onChange={(event) => { update('name', event.target.value); if (!editing && !draft.id) update('id', slugify(event.target.value)); }} className="border-white/10 bg-white/[0.04] text-slate-100" /></Field>
      <Field label="Dirección" className="sm:col-span-2"><Input required value={draft.address} onChange={(event) => update('address', event.target.value)} className="border-white/10 bg-white/[0.04] text-slate-100" /></Field>
      <Field label="Latitud"><Input required type="number" step="any" value={draft.lat} onChange={(event) => update('lat', event.target.value)} className="border-white/10 bg-white/[0.04] text-slate-100" /></Field>
      <Field label="Longitud"><Input required type="number" step="any" value={draft.lng} onChange={(event) => update('lng', event.target.value)} className="border-white/10 bg-white/[0.04] text-slate-100" /></Field>
      <Field label="Tipo"><Select value={draft.type} onValueChange={(value) => update('type', value as PointDraft['type'])}><SelectTrigger className="border-white/10 bg-white/[0.04] text-slate-100"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="green_point">Punto verde</SelectItem><SelectItem value="container">Contenedor</SelectItem></SelectContent></Select></Field>
      <Field label="Estado"><Select value={draft.status} onValueChange={(value) => update('status', value as PointStatus)}><SelectTrigger className="border-white/10 bg-white/[0.04] text-slate-100"><SelectValue /></SelectTrigger><SelectContent>{statuses.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></Field>
      <Field label="Horarios" className="sm:col-span-2"><Input required value={draft.hours} onChange={(event) => update('hours', event.target.value)} placeholder="Lunes a viernes, 9:00 a 17:00" className="border-white/10 bg-white/[0.04] text-slate-100 placeholder:text-slate-600" /></Field>
      <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-medium">Materiales aceptados</legend><div className="grid gap-2 sm:grid-cols-2">{MATERIALS.map((material) => <label key={material.key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs text-slate-300"><input type="checkbox" checked={draft.materials.includes(material.key)} onChange={(event) => update('materials', event.target.checked ? [...draft.materials, material.key] : draft.materials.filter((key) => key !== material.key))} className="accent-blue-400" />{material.label}</label>)}</div></fieldset>
      <div className="flex justify-end gap-2 pt-1 sm:col-span-2"><Button variant="outline" type="button" onClick={() => setDialogOpen(false)} className="border-white/10 bg-white/[0.025] text-slate-300">Cancelar</Button><Button type="submit" disabled={saving} className="bg-blue-500 text-white hover:bg-blue-400">{saving ? <LoaderCircle size={15} className="animate-spin" /> : null}{editing ? 'Guardar cambios' : 'Crear punto'}</Button></div>
    </form></DialogContent></Dialog>

    <AdminConfirmDialog open={Boolean(archiving)} onOpenChange={(open) => !open && setArchiving(null)} title="Archivar este punto?" description={`“${archiving?.name ?? ''}” dejará de aparecer en el mapa público. Sus reportes asociados se conservan.`} confirmLabel={archiveBusy ? 'Archivando…' : 'Archivar punto'} busy={archiveBusy} onConfirm={() => void archive()} />
  </div>;
}

function Field({ label, children, hint, className = '' }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return <div className={`space-y-2 ${className}`}><Label className="text-slate-300">{label}</Label>{children}{hint && <p className="text-[10px] text-slate-500">{hint}</p>}</div>;
}

function slugify(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
