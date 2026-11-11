import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity, ArrowUpRight, BellRing, CalendarDays,
  CheckCheck, ChevronDown, FileClock, LayoutDashboard, MapPinned,
  Search, ShieldCheck, Sparkles, UsersRound,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AccountNotice } from '@/components/auth/AccountNotice';
import type { RecyclePoint } from '@/types/domain';
import { fetchAdminPoints, fetchAdminReports, fetchNeighborhoods, type Neighborhood } from './admin-api';
import { AdminOverview } from './AdminOverview';
import { AdminReportsPanel } from './AdminReportsPanel';
import { AdminPointsPanel } from './AdminPointsPanel';
import { AdminSchedulesPanel } from './AdminSchedulesPanel';
import { AdminUsersPanel } from './AdminUsersPanel';
import { isAdmin } from './admin-model';
import { adminGlass as glass } from './admin-style';

type AdminTab = 'overview' | 'reports' | 'points' | 'schedules' | 'admins';

const NAV = [
  { key: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { key: 'reports', label: 'Reportes', icon: FileClock },
  { key: 'points', label: 'Puntos verdes', icon: MapPinned },
  { key: 'schedules', label: 'Barrios y horarios', icon: CalendarDays },
  { key: 'admins', label: 'Administradores', icon: UsersRound },
] as const;

export default function AdminSection() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [points, setPoints] = useState<RecyclePoint[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(false);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(false);
    const results = await Promise.allSettled([
      fetchAdminPoints(),
      fetchAdminReports('pending'),
      fetchNeighborhoods(),
    ]);
    let failed = false;
    const [pointsResult, reportsResult, neighborhoodsResult] = results;
    if (pointsResult.status === 'fulfilled') setPoints(pointsResult.value);
    else failed = true;
    if (reportsResult.status === 'fulfilled') setPendingCount(reportsResult.value.length);
    else failed = true;
    if (neighborhoodsResult.status === 'fulfilled') setNeighborhoods(neighborhoodsResult.value);
    else failed = true;
    setSummaryError(failed);
    setSummaryLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin(user)) void loadSummary();
  }, [loadSummary, user]);

  if (status === 'loading') {
    return <div className="container-page pb-16 pt-32"><div className={`rounded-[28px] p-8 text-slate-200 ${glass}`}>Cargando tu sesión…</div></div>;
  }

  if (!isAdmin(user)) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center pb-16 pt-28">
        <div className={`w-full max-w-lg rounded-[30px] p-8 text-slate-100 sm:p-10 ${glass}`}>
          <span className="mb-5 grid size-14 place-items-center rounded-2xl bg-blue-400/10 text-blue-300"><ShieldCheck size={25} /></span>
          <h1 className="font-display text-3xl font-bold">Acceso de administrador</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Este espacio está reservado para el equipo que mantiene EcoPunto.</p>
          {!user ? (
            <div className="mt-6"><AccountNotice description="Iniciá sesión con una cuenta administradora para continuar." /><Button className="mt-4" onClick={() => openAuthDialog('login')}>Iniciar sesión</Button></div>
          ) : (
            <p role="alert" className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-4 text-sm text-amber-100">Tu cuenta no tiene permisos de administración.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070d18] pb-16 pt-24 text-slate-100 sm:pt-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-8 size-[34rem] rounded-full bg-blue-600/[0.14] blur-[110px]" />
        <div className="absolute -right-36 top-48 size-[31rem] rounded-full bg-cyan-400/[0.09] blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 size-[26rem] rounded-full bg-indigo-500/[0.08] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.3)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="container-page relative space-y-7">
        <header className={`flex flex-col justify-between gap-5 rounded-[30px] p-5 sm:flex-row sm:items-center sm:p-7 ${glass}`}>
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-blue-300/20 bg-gradient-to-br from-blue-400/20 to-cyan-300/[0.06] text-blue-200 shadow-[0_0_36px_rgba(55,130,255,.18)]"><Sparkles size={22} /></span>
            <div><p className="text-[11px] font-semibold uppercase tracking-[.24em] text-blue-200/70">EcoPunto · Control center</p><h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Panel de administración</h1></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden w-56 md:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><Input aria-label="Buscar en el panel" placeholder="Buscar en el panel" className="h-10 border-white/10 bg-white/[0.035] pl-9 text-slate-100 placeholder:text-slate-500 focus-visible:border-blue-300/50 focus-visible:ring-blue-300/20" /></div>
            <button type="button" aria-label="Notificaciones" className="relative grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"><BellRing size={17} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,.8)]" /></button>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3"><span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-xs font-bold text-white">{user?.email.slice(0, 1).toUpperCase()}</span><span className="max-w-32 truncate text-xs text-slate-200">{user?.email}</span><ChevronDown size={13} className="text-slate-500" /></div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[238px_minmax(0,1fr)]">
          <aside className={`h-fit rounded-[28px] p-3 lg:sticky lg:top-28 ${glass}`}>
            <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[.22em] text-slate-500">Workspace</p>
            <nav aria-label="Secciones de administración" className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
              {NAV.map(({ key, label, icon: Icon }) => {
                const selected = activeTab === key;
                return <button key={key} type="button" onClick={() => setActiveTab(key)} aria-current={selected ? 'page' : undefined} className={`group flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:text-sm ${selected ? 'border border-blue-300/15 bg-gradient-to-r from-blue-500/20 to-cyan-400/[0.08] text-blue-100 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]' : 'border border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white'}`}><Icon size={17} className={selected ? 'text-blue-200' : 'text-slate-500 group-hover:text-slate-300'} /><span className="truncate">{label}</span>{key === 'reports' && pendingCount > 0 && <span className="ml-auto rounded-full bg-blue-400/15 px-2 py-0.5 text-[10px] text-blue-100">{pendingCount}</span>}</button>;
              })}
            </nav>
            <div className="mt-5 hidden rounded-2xl border border-cyan-300/10 bg-gradient-to-br from-blue-400/[0.1] to-transparent p-4 lg:block"><p className="flex items-center gap-2 text-xs font-semibold text-cyan-100"><Activity size={14} /> Datos en vivo</p><p className="mt-2 text-[11px] leading-5 text-slate-400">Cambios y moderación registrados en la base de EcoPunto.</p></div>
          </aside>

          <section className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4 px-1">
              <div><p className="text-[11px] font-medium uppercase tracking-[.2em] text-slate-500">Administración / <span className="text-blue-200/80">{NAV.find((item) => item.key === activeTab)?.label}</span></p><h2 className="mt-2 font-display text-2xl font-bold sm:text-[28px]">{NAV.find((item) => item.key === activeTab)?.label}</h2></div>
              <div className="flex items-center gap-2 text-xs text-slate-500"><span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.75)]" />Córdoba, Argentina</div>
            </div>
            {summaryError && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300/15 bg-amber-200/[0.05] px-4 py-3 text-sm text-amber-100"><span>No pudimos actualizar todos los indicadores.</span><Button variant="outline" size="sm" onClick={() => void loadSummary()}>Reintentar</Button></div>}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.18 }}>
                {activeTab === 'overview' && <AdminOverview points={points} pendingCount={pendingCount} neighborhoodCount={neighborhoods.length} loading={summaryLoading} onOpen={setActiveTab} />}
                {activeTab === 'reports' && <AdminReportsPanel onUpdated={() => void loadSummary()} />}
                {activeTab === 'points' && <AdminPointsPanel points={points} onUpdated={() => void loadSummary()} />}
                {activeTab === 'schedules' && <AdminSchedulesPanel neighborhoods={neighborhoods} onUpdated={() => void loadSummary()} />}
                {activeTab === 'admins' && <AdminUsersPanel />}
              </motion.div>
            </AnimatePresence>
            <footer className="flex flex-wrap items-center justify-between gap-2 px-1 pt-1 text-[11px] text-slate-600"><span className="flex items-center gap-1.5"><CheckCheck size={13} /> Panel seguro · acciones protegidas por sesión admin</span><a href="/api/docs" target="_blank" rel="noreferrer" className="transition hover:text-slate-300">Documentación API <ArrowUpRight size={12} className="inline" /></a></footer>
          </section>
        </div>
      </div>
    </main>
  );
}

