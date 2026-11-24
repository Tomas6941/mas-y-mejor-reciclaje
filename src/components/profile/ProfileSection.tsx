import { useMemo } from 'react';
import { ArrowRight, BadgeCheck, CalendarDays, Clock3, Leaf, LogOut, Recycle, ShieldCheck, Trophy, UserRound } from 'lucide-react';

import { AccountNotice } from '@/components/auth/AccountNotice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MATERIALS } from '@/data/materials';
import { formatKg, formatLongDate } from '@/lib/format';
import { getAchievementData } from '@/lib/achievements';
import { getTrackingStats } from '@/lib/trackingStats';
import { useAuthStore } from '@/store/authStore';
import { useCalendarStore } from '@/store/calendarStore';
import { useQuizStore } from '@/store/quizStore';
import { useTrackingStore } from '@/store/trackingStore';

/** Perfil con resumen de cuenta y actividad ambiental. */
export default function ProfileSection() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const records = useTrackingStore((state) => state.records);
  const quiz = useQuizStore((state) => state.result);
  const neighborhood = useCalendarStore((state) => state.neighborhood);
  const neighborhoods = useCalendarStore((state) => state.neighborhoods);
  const reminder = useCalendarStore((state) => state.reminder);
  const stats = useMemo(() => getTrackingStats(records), [records]);
  const achievements = getAchievementData(stats);
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
  const displayEmail = user?.email ?? '';
  const initial = displayEmail.charAt(0).toLocaleUpperCase('es');
  const neighborhoodName = neighborhoods.find((item) => item.id === neighborhood)?.name;
  const recentRecords = records.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <section className="container-page space-y-8 pb-12 pt-28 sm:pt-32" aria-labelledby="profile-title">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-6 shadow-soft sm:p-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full bg-primary-soft/70 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="grid size-16 shrink-0 place-items-center rounded-[1.4rem] bg-primary text-2xl font-bold text-primary-foreground shadow-glow sm:size-20 sm:text-3xl" aria-hidden="true">
              {user ? initial : <UserRound className="size-8" />}
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-primary">Tu espacio verde</p>
              <h1 id="profile-title" className="truncate font-display text-3xl font-bold tracking-tight sm:text-4xl">Mi perfil</h1>
              {user && <p className="mt-1 truncate text-sm text-muted sm:text-base">{displayEmail}</p>}
            </div>
          </div>
          {user && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-2 text-xs font-semibold text-primary">
                {user.emailVerifiedAt ? <BadgeCheck size={15} /> : <Clock3 size={15} />}
                {user.emailVerifiedAt ? 'Cuenta verificada' : 'Correo pendiente'}
              </span>
              {user.role === 'admin' && <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-soft px-3 py-2 text-xs font-semibold"><ShieldCheck size={15} /> Administración</span>}
              <Button variant="outline" size="sm" onClick={() => void logout()} aria-label="Cerrar sesión">
                <LogOut aria-hidden="true" />
                <span>Cerrar sesión</span>
              </Button>
            </div>
          )}
        </div>
        {!user && <div className="relative mt-7 max-w-xl"><AccountNotice description="Iniciá sesión para ver tu actividad, tus logros y tus preferencias de recolección." /></div>}
        {user && !user.emailVerifiedAt && <div className="relative mt-7 max-w-xl"><AccountNotice description="Confirmá tu correo para habilitar tu seguimiento, tus logros y las preferencias de tu cuenta." /></div>}
      </div>

      {user?.emailVerifiedAt && <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={<Recycle size={19} />} label="Material recuperado" value={`${formatKg(stats.total)} kg`} detail="en total" />
          <Metric icon={<CalendarDays size={19} />} label="Registros" value={String(stats.count)} detail="aportes guardados" />
          <Metric icon={<Trophy size={19} />} label="Logros" value={`${unlockedCount} / ${achievements.length}`} detail="metas alcanzadas" />
          <Metric icon={<Leaf size={19} />} label="Racha actual" value={`${stats.currentStreak} ${stats.currentStreak === 1 ? 'día' : 'días'}`} detail="de actividad continua" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Tu impacto</CardTitle>
              <CardDescription>Los materiales que más recuperaste.</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.populatedMaterials.length ? <div className="space-y-5">
                {stats.populatedMaterials.slice().sort((a, b) => stats.byMaterial[b.key] - stats.byMaterial[a.key]).slice(0, 4).map((material) => {
                  const amount = stats.byMaterial[material.key];
                  return <div key={material.key}>
                    <div className="mb-2 flex justify-between gap-3 text-sm"><span className="font-medium">{material.label}</span><span className="tabular-nums text-muted">{formatKg(amount)} kg</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-soft"><div className="h-full rounded-full" style={{ width: `${stats.total ? amount / stats.total * 100 : 0}%`, backgroundColor: material.color }} /></div>
                  </div>;
                })}
              </div> : <div className="rounded-2xl bg-surface-soft p-5">
                <p className="text-sm text-muted">Todavía no hay registros. Sumá tu primer aporte para empezar a ver tu impacto.</p>
                <Button asChild variant="soft" size="sm" className="mt-4"><a href="#/seguimiento">Registrar reciclaje <ArrowRight size={15} /></a></Button>
              </div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Preferencias</CardTitle><CardDescription>Información de tu cuenta y tu zona.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-surface-soft p-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><CalendarDays size={17} /></span><div><p className="text-xs text-muted">Barrio elegido</p><p className="mt-1 text-sm font-semibold">{neighborhoodName ?? 'Córdoba'}</p></div></div>
              <div className="flex items-start gap-3 rounded-2xl bg-surface-soft p-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-foreground"><Clock3 size={17} /></span><div><p className="text-xs text-muted">Recordatorio de recolección</p><p className="mt-1 text-sm font-semibold">{reminder.enabled ? 'Activado' : 'Sin activar'}</p></div></div>
              <Button asChild variant="outline" size="sm"><a href="#/calendario">Ver calendario <ArrowRight size={15} /></a></Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle>Tus logros</CardTitle><CardDescription>El progreso de tus metas de reciclaje.</CardDescription></div><Trophy className="text-accent-foreground" size={20} /></div></CardHeader>
            <CardContent className="space-y-4">
              {achievements.slice(0, 4).map((achievement) => <div key={achievement.definition.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{achievement.definition.title}</p><p className="mt-1 text-xs text-muted">{achievement.definition.description}</p></div>{achievement.unlocked && <BadgeCheck className="shrink-0 text-primary" size={18} aria-label="Desbloqueado" />}</div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-soft"><div className="h-full rounded-full bg-primary" style={{ width: `${achievement.progress}%` }} /></div>
                <p className="mt-2 text-xs text-muted">{achievement.progressText}{achievement.unlocked ? ' · Desbloqueado' : ''}</p>
              </div>)}
              <Button asChild variant="ghost" size="sm"><a href="#/seguimiento">Ver seguimiento completo <ArrowRight size={15} /></a></Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Actividad reciente</CardTitle><CardDescription>Los últimos registros de tu seguimiento.</CardDescription></CardHeader>
            <CardContent>
              {recentRecords.length ? <div className="divide-y divide-border">{recentRecords.map((record) => <div key={record.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-semibold">{MATERIALS.find((item) => item.key === record.material)?.label ?? record.material}</p><p className="mt-1 text-xs text-muted">{formatLongDate(new Date(`${record.date}T12:00:00`))}</p></div><p className="shrink-0 font-display text-lg font-bold tabular-nums">{formatKg(record.kg)} kg</p></div>)}</div> : <p className="rounded-2xl bg-surface-soft p-5 text-sm text-muted">Cuando guardes tus registros, vas a encontrarlos acá.</p>}
              {quiz.attempts > 0 && <div className="mt-5 rounded-2xl bg-primary-soft p-4"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Mini quiz de reciclaje</p><p className="mt-1 text-sm">Récord <strong>{quiz.best}%</strong><span className="text-muted"> · {quiz.attempts} {quiz.attempts === 1 ? 'intento' : 'intentos'}</span></p></div>}
              <Button asChild variant="ghost" size="sm" className="mt-3"><a href="#/seguimiento">Abrir mi actividad <ArrowRight size={15} /></a></Button>
            </CardContent>
          </Card>
        </div>
      </>}
    </section>
  );
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <Card><CardContent className="flex items-center gap-3 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">{icon}</span><div className="min-w-0"><p className="truncate text-xs text-muted">{label}</p><p className="font-display text-xl font-bold tabular-nums">{value}</p><p className="text-xs text-muted">{detail}</p></div></CardContent></Card>;
}
