import { ArrowRight, Boxes, CalendarDays, MapPinned, ShieldCheck, Sparkles } from 'lucide-react';

import type { RecyclePoint } from '@/types/domain';
import { adminGlass } from './admin-style';

type AdminTab = 'overview' | 'reports' | 'points' | 'schedules' | 'admins';

interface Props {
  points: RecyclePoint[];
  pendingCount: number;
  neighborhoodCount: number;
  loading: boolean;
  onOpen: (tab: AdminTab) => void;
}

const number = (value: number) => new Intl.NumberFormat('es-AR').format(value);

export function AdminOverview({ points, pendingCount, neighborhoodCount, loading, onOpen }: Props) {
  const green = points.filter((point) => point.type === 'Punto verde').length;
  const containers = points.length - green;
  const greenPercent = points.length > 0 ? Math.round((green / points.length) * 100) : 0;
  const metrics = [
    { label: 'Reportes pendientes', value: pendingCount, icon: ShieldCheck, tone: 'blue', detail: pendingCount ? 'Requieren revisión' : 'Todo al día', action: 'reports' as const },
    { label: 'Puntos activos', value: points.length, icon: MapPinned, tone: 'cyan', detail: 'En el mapa público', action: 'points' as const },
    { label: 'Barrios activos', value: neighborhoodCount, icon: CalendarDays, tone: 'violet', detail: 'Con calendario disponible', action: 'schedules' as const },
  ];

  return <div className="space-y-5">
    <section className="grid gap-4 md:grid-cols-3">
      {metrics.map(({ label, value, icon: Icon, tone, detail, action }, index) => <button key={label} type="button" onClick={() => onOpen(action)} className={`group rounded-[25px] p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-200/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:p-6 ${adminGlass}`}>
        <div className="flex items-start justify-between"><span className={`grid size-10 place-items-center rounded-xl border ${tone === 'blue' ? 'border-blue-300/15 bg-blue-400/10 text-blue-200' : tone === 'cyan' ? 'border-cyan-200/15 bg-cyan-300/10 text-cyan-100' : 'border-violet-200/15 bg-violet-300/10 text-violet-100'}`}><Icon size={18} /></span><span className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-600">0{index + 1}</span></div>
        <p className="mt-7 text-xs font-medium text-slate-400">{label}</p><div className="mt-1 flex items-end justify-between"><p className="font-display text-4xl font-bold tracking-tight text-white">{loading ? <span className="inline-block h-10 w-14 animate-pulse rounded-lg bg-white/10" /> : number(value)}</p><span className="mb-1 flex items-center gap-1 text-[11px] text-slate-500">{detail}<ArrowRight size={12} className="transition group-hover:translate-x-0.5" /></span></div>
      </button>)}
    </section>

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(310px,.85fr)]">
      <div className={`rounded-[26px] p-5 sm:p-6 ${adminGlass}`}>
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-blue-200/65">Red de reciclaje</p><h3 className="mt-2 font-display text-xl font-semibold">Composición de puntos activos</h3><p className="mt-1 text-xs text-slate-500">Distribución por tipo de punto en Córdoba.</p></div><span className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-400"><Boxes size={17} /></span></div>
        <div className="mt-7 flex flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-12">
          <div className="relative grid size-44 shrink-0 place-items-center rounded-full" style={{ background: points.length ? `conic-gradient(#4a91ff 0 ${greenPercent}%, #43d6d0 ${greenPercent}% 100%)` : 'conic-gradient(#334155 0 100%)' }}>
            <div className="grid size-[124px] place-items-center rounded-full border border-white/[0.06] bg-[#0b1422] text-center"><div><p className="font-display text-3xl font-bold">{number(points.length)}</p><p className="mt-1 text-[10px] uppercase tracking-[.18em] text-slate-500">Puntos</p></div></div>
          </div>
          <div className="w-full max-w-xs space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5"><div className="flex items-center gap-3"><span className="size-2.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(74,145,255,.75)]" /><span className="text-sm text-slate-300">Puntos verdes</span></div><strong className="text-sm text-white">{number(green)}</strong></div>
            <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5"><div className="flex items-center gap-3"><span className="size-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(67,214,208,.65)]" /><span className="text-sm text-slate-300">Contenedores</span></div><strong className="text-sm text-white">{number(containers)}</strong></div>
            <p className="flex items-center gap-2 pt-1 text-[11px] text-slate-500"><Sparkles size={13} className="text-blue-200/70" />El mapa muestra únicamente puntos activos.</p>
          </div>
        </div>
      </div>

      <div className={`rounded-[26px] p-5 sm:p-6 ${adminGlass}`}>
        <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-blue-200/65">Accesos rápidos</p><h3 className="mt-2 font-display text-xl font-semibold">¿Qué querés gestionar?</h3></div>
        <div className="mt-5 space-y-2.5">
          <QuickAction icon={ShieldCheck} title="Moderar reportes" description={`${pendingCount} pendientes de revisión`} onClick={() => onOpen('reports')} />
          <QuickAction icon={MapPinned} title="Editar puntos" description="Datos, materiales y ubicación" onClick={() => onOpen('points')} />
          <QuickAction icon={CalendarDays} title="Actualizar horarios" description="Barrios y recolecciones" onClick={() => onOpen('schedules')} />
        </div>
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-blue-300/10 bg-gradient-to-r from-blue-500/[0.11] to-transparent px-4 py-3.5"><span className="text-xs text-blue-100/75">Administración protegida por roles</span><ShieldCheck size={16} className="text-blue-200" /></div>
      </div>
    </section>
  </div>;
}

function QuickAction({ icon: Icon, title, description, onClick }: { icon: typeof ShieldCheck; title: string; description: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.055] bg-white/[0.022] p-3.5 text-left transition hover:border-blue-300/15 hover:bg-blue-400/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"><span className="grid size-9 place-items-center rounded-xl bg-white/[0.05] text-blue-200"><Icon size={16} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-200">{title}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{description}</span></span><ArrowRight size={14} className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-blue-200" /></button>;
}
