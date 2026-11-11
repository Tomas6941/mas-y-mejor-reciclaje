import { AlertTriangle, CalendarDays, Clock3, LoaderCircle, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Schedule, ScheduleIcon } from '@/types/domain';
import { archiveAdminNeighborhood, fetchAdminSchedules, saveAdminSchedules, type Neighborhood } from './admin-api';
import { toScheduleInput } from './admin-model';
import { AdminConfirmDialog } from './AdminConfirmDialog';
import { adminGlass } from './admin-style';

const dayLabels = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

export function AdminSchedulesPanel({ neighborhoods, onUpdated }: { neighborhoods: Neighborhood[]; onUpdated: () => void }) {
  const [selected, setSelected] = useState(neighborhoods[0]?.id ?? '');
  const [name, setName] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!selected && neighborhoods[0]) setSelected(neighborhoods[0].id);
    if (selected && !neighborhoods.some((item) => item.id === selected) && neighborhoods[0]) setSelected(neighborhoods[0].id);
  }, [neighborhoods, selected]);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    setLoading(true); setError(false);
    void fetchAdminSchedules(selected).then((result) => {
      if (!active) return;
      setName(result.neighborhood);
      setSchedules(result.schedules);
    }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selected, retryToken]);

  function updateSchedule(index: number, patch: Partial<Schedule>) {
    setSchedules((current) => current.map((schedule, i) => i === index ? { ...schedule, ...patch } : schedule));
  }

  async function save() {
    if (!selected || !name.trim()) { toast.error('El barrio necesita un nombre.'); return; }
    if (schedules.some((schedule) => !schedule.name.trim() || !schedule.description.trim() || schedule.days.length === 0 || !/^\d{2}:\d{2} a \d{2}:\d{2}$/.test(schedule.time))) {
      toast.error('Completá nombre, descripción, días y rango horario en cada tarjeta.'); return;
    }
    setSaving(true);
    try {
      await saveAdminSchedules(selected, { name: name.trim(), schedules: schedules.map(toScheduleInput) });
      toast.success('Horarios actualizados.'); setConfirmSave(false); onUpdated();
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : 'No pudimos guardar los horarios.'); }
    finally { setSaving(false); }
  }

  async function archive() {
    setArchiving(true);
    try {
      await archiveAdminNeighborhood(selected);
      toast.success('Barrio archivado.'); setConfirmArchive(false); onUpdated();
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : 'No pudimos archivar el barrio.'); }
    finally { setArchiving(false); }
  }

  const currentName = neighborhoods.find((item) => item.id === selected)?.name;

  return <div className="space-y-4">
    <div className={`flex flex-col justify-between gap-4 rounded-[24px] p-4 sm:flex-row sm:items-end sm:p-5 ${adminGlass}`}>
      <div className="grid flex-1 gap-4 sm:grid-cols-2"><div className="space-y-2"><Label className="text-xs text-slate-400">Barrio</Label><Select value={selected} onValueChange={setSelected}><SelectTrigger aria-label="Elegir barrio" className="border-white/10 bg-white/[0.04] text-slate-100"><SelectValue placeholder="Elegí un barrio" /></SelectTrigger><SelectContent>{neighborhoods.map((neighborhood) => <SelectItem key={neighborhood.id} value={neighborhood.id}>{neighborhood.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label className="text-xs text-slate-400">Nombre visible</Label><Input value={name} onChange={(event) => setName(event.target.value)} className="border-white/10 bg-white/[0.04] text-slate-100" /></div></div>
      {selected && <Button variant="outline" size="sm" onClick={() => setConfirmArchive(true)} className="border-rose-300/10 bg-rose-300/[0.03] text-rose-100 hover:bg-rose-300/[0.08]"><Trash2 size={14} />Archivar barrio</Button>}
    </div>

    {!selected ? <div className={`grid min-h-64 place-items-center rounded-[26px] p-8 text-center ${adminGlass}`}><div><CalendarDays size={24} className="mx-auto text-slate-500" /><p className="mt-3 text-sm text-slate-300">No hay barrios activos.</p><p className="mt-1 text-xs text-slate-500">Los barrios se cargan desde el catálogo de Córdoba.</p></div></div>
      : loading ? <div className={`grid min-h-48 place-items-center rounded-[26px] text-sm text-slate-400 ${adminGlass}`}><span className="flex items-center gap-2"><LoaderCircle size={16} className="animate-spin" />Cargando horarios…</span></div>
        : error ? <div role="alert" className={`flex min-h-48 flex-col items-center justify-center gap-3 rounded-[26px] text-center ${adminGlass}`}><AlertTriangle className="text-amber-200" /><p className="text-sm text-slate-300">No pudimos cargar los horarios de {currentName}.</p><Button variant="outline" size="sm" onClick={() => setRetryToken((value) => value + 1)}>Reintentar</Button></div>
          : <div className="space-y-4">
            <div className={`flex flex-wrap items-center justify-between gap-3 rounded-[24px] p-4 sm:p-5 ${adminGlass}`}><div><h3 className="font-display text-lg font-semibold">Recolecciones programadas</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Clock3 size={12} />Guardá el conjunto completo de horarios de este barrio.</p></div><Button variant="outline" size="sm" onClick={() => setSchedules((current) => [...current, newSchedule(current.length + 1)])} className="border-white/10 bg-white/[0.025] text-slate-300 hover:bg-white/[0.08]"><Plus size={14} />Agregar horario</Button></div>
            {schedules.length === 0 ? <div className={`rounded-[24px] p-6 text-center text-sm text-slate-500 ${adminGlass}`}>Este barrio no tiene horarios cargados. Agregá el primero para publicar el calendario.</div> : <div className="grid gap-4 xl:grid-cols-2">{schedules.map((schedule, index) => <article key={`${schedule.key}-${index}`} className={`rounded-[24px] p-4 sm:p-5 ${adminGlass}`}><header className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl border border-blue-300/10 bg-blue-300/[0.07] text-blue-100"><CalendarDays size={16} /></span><div><h4 className="text-sm font-semibold text-slate-100">{schedule.name || 'Nuevo horario'}</h4><p className="mt-0.5 text-[10px] text-slate-500">Clave: {schedule.key}</p></div></div><Button variant="ghost" size="icon" aria-label={`Quitar horario ${schedule.name}`} onClick={() => setSchedules((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="size-8 text-slate-500 hover:bg-rose-300/10 hover:text-rose-100"><Trash2 size={14} /></Button></header>
              <div className="mt-4 grid gap-3 sm:grid-cols-2"><ScheduleField label="Clave"><Input value={schedule.key} onChange={(event) => updateSchedule(index, { key: slugify(event.target.value) })} className="border-white/10 bg-white/[0.04] text-slate-100" /></ScheduleField><ScheduleField label="Nombre"><Input value={schedule.name} onChange={(event) => updateSchedule(index, { name: event.target.value })} className="border-white/10 bg-white/[0.04] text-slate-100" /></ScheduleField><ScheduleField label="Icono"><Select value={schedule.icon} onValueChange={(value) => updateSchedule(index, { icon: value as ScheduleIcon })}><SelectTrigger className="border-white/10 bg-white/[0.04] text-slate-100"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="recycle">Reciclaje</SelectItem><SelectItem value="leaf">Orgánicos</SelectItem><SelectItem value="trash">Residuos</SelectItem></SelectContent></Select></ScheduleField><ScheduleField label="Color"><div className="flex h-11 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3"><input type="color" value={schedule.color} onChange={(event) => updateSchedule(index, { color: event.target.value })} aria-label={`Color de ${schedule.name}`} className="size-7 cursor-pointer rounded-lg border-0 bg-transparent" /><span className="font-mono text-xs text-slate-300">{schedule.color}</span></div></ScheduleField><ScheduleField label="Desde"><Input type="time" value={schedule.time.split(' a ')[0]} onChange={(event) => updateSchedule(index, { time: `${event.target.value} a ${schedule.time.split(' a ')[1] ?? ''}` })} className="border-white/10 bg-white/[0.04] text-slate-100" /></ScheduleField><ScheduleField label="Hasta"><Input type="time" value={schedule.time.split(' a ')[1] ?? ''} onChange={(event) => updateSchedule(index, { time: `${schedule.time.split(' a ')[0]} a ${event.target.value}` })} className="border-white/10 bg-white/[0.04] text-slate-100" /></ScheduleField><ScheduleField label="Descripción" className="sm:col-span-2"><Input value={schedule.description} onChange={(event) => updateSchedule(index, { description: event.target.value })} className="border-white/10 bg-white/[0.04] text-slate-100" /></ScheduleField></div>
              <fieldset className="mt-4"><legend className="mb-2 text-xs font-medium text-slate-400">Días de recolección</legend><div className="flex flex-wrap gap-2">{dayLabels.map((label, day) => { const checked = schedule.days.includes(day); return <button key={label} type="button" aria-pressed={checked} onClick={() => updateSchedule(index, { days: checked ? schedule.days.filter((value) => value !== day) : [...schedule.days, day].sort((a, b) => a - b) })} className={`grid size-9 place-items-center rounded-xl border text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${checked ? 'border-blue-300/20 bg-blue-400/15 text-blue-100' : 'border-white/[0.07] bg-white/[0.02] text-slate-500 hover:text-slate-200'}`}>{label}</button>; })}</div></fieldset>
            </article>)}</div>}
            <div className="flex flex-col justify-between gap-3 rounded-[24px] border border-amber-200/10 bg-amber-200/[0.035] p-4 sm:flex-row sm:items-center sm:px-5"><p className="max-w-2xl text-xs leading-5 text-amber-100/75">Al guardar se reemplazan todos los horarios actuales de <strong>{currentName}</strong> por esta configuración.</p><Button onClick={() => setConfirmSave(true)} disabled={saving} className="bg-blue-500 text-white hover:bg-blue-400"><Save size={14} />Guardar horarios</Button></div>
          </div>}

    <AdminConfirmDialog open={confirmSave} onOpenChange={setConfirmSave} title="Reemplazar los horarios del barrio?" description={`Se reemplazará toda la configuración de recolección de ${currentName ?? 'este barrio'}. Esta acción publica los cambios inmediatamente.`} confirmLabel={saving ? 'Guardando…' : 'Reemplazar horarios'} busy={saving} onConfirm={() => void save()} />
    <AdminConfirmDialog open={confirmArchive} onOpenChange={setConfirmArchive} title="Archivar este barrio?" description={`“${currentName ?? ''}” dejará de aparecer en el selector público. El archivo no elimina el historial asociado.`} confirmLabel={archiving ? 'Archivando…' : 'Archivar barrio'} busy={archiving} onConfirm={() => void archive()} />
  </div>;
}

function ScheduleField({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={`space-y-2 ${className}`}><Label className="text-[11px] text-slate-500">{label}</Label>{children}</div>;
}

function newSchedule(index: number): Schedule {
  return { key: `nuevo-${index}`, name: '', icon: 'recycle', color: '#4a91ff', description: '', days: [], time: '18:00 a 21:00', startTime: '18:00' };
}

function slugify(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
