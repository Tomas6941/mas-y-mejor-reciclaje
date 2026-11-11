import { useMemo, useState } from 'react';
import { Flame, Plus, Recycle, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MATERIALS } from '@/data/materials';
import { getAchievementData } from '@/lib/achievements';
import { formatKg, formatLongDate } from '@/lib/format';
import { getMaterialTotalList, getTrackingStats } from '@/lib/trackingStats';
import { trackingSchema } from '@/lib/schemas';
import { todayISO } from '@/lib/dates';
import { useTrackingStore } from '@/store/trackingStore';
import type { MaterialKey } from '@/types/domain';

/** Registro personal de kilos reciclados y progreso de logros. */
export default function TrackingSection() {
  const records = useTrackingStore((state) => state.records);
  const addRecord = useTrackingStore((state) => state.addRecord);
  const clearAll = useTrackingStore((state) => state.clearAll);
  const [material, setMaterial] = useState<MaterialKey | ''>('');
  const [kg, setKg] = useState('');
  const [date, setDate] = useState(todayISO());
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [errors, setErrors] = useState<{ material?: string; kg?: string; date?: string }>({});
  const stats = useMemo(() => getTrackingStats(records), [records]);
  const achievements = getAchievementData(stats);
  const materialTotals = getMaterialTotalList(stats);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = trackingSchema.safeParse({ material, kg, date });
    if (!parsed.success) {
      const next: typeof errors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key === 'material' || key === 'kg' || key === 'date') next[key] = issue.message;
      });
      setErrors(next);
      return;
    }
    addRecord(parsed.data);
    setMaterial('');
    setKg('');
    setDate(todayISO());
    setErrors({});
    toast.success('Registro agregado a tu seguimiento.');
  }

  function handleClear() {
    clearAll();
    setClearDialogOpen(false);
    toast.success('Se borró tu historial de seguimiento.');
  }

  return (
    <div className="container-page space-y-8 pb-16 pt-28">
      <header className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wider text-primary">Tu impacto</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Mi seguimiento</h1><p className="mt-3 text-muted">Registrá lo que reciclás y mirá cómo crece tu aporte al ambiente.</p></header>
      <section className="grid gap-3 sm:grid-cols-3"><Summary icon={<Recycle />} label="Total reciclado" value={`${formatKg(stats.total)} kg`} /><Summary icon={<Flame />} label="Racha actual" value={`${stats.currentStreak} días`} /><Summary icon={<Trophy />} label="Registros" value={String(stats.count)} /></section>
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,.85fr)_minmax(0,1.15fr)]">
        <Card><CardHeader><CardTitle>Nuevo registro</CardTitle><CardDescription>Anotá el material y el peso que recuperaste.</CardDescription></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2"><Label htmlFor="tracking-material">Material</Label><Select value={material} onValueChange={(value) => setMaterial(value as MaterialKey)}><SelectTrigger id="tracking-material" aria-invalid={Boolean(errors.material)}><SelectValue placeholder="Elegí un material" /></SelectTrigger><SelectContent>{MATERIALS.map((item) => <SelectItem key={item.key} value={item.key}>{item.label}</SelectItem>)}</SelectContent></Select>{errors.material && <ErrorText>{errors.material}</ErrorText>}</div>
          <div className="space-y-2"><Label htmlFor="tracking-kg">Cantidad en kg</Label><Input id="tracking-kg" inputMode="decimal" value={kg} onChange={(event) => setKg(event.target.value)} placeholder="Ej. 2,5" aria-invalid={Boolean(errors.kg)} />{errors.kg && <ErrorText>{errors.kg}</ErrorText>}</div>
          <div className="space-y-2"><Label htmlFor="tracking-date">Fecha</Label><Input id="tracking-date" type="date" max={todayISO()} value={date} onChange={(event) => setDate(event.target.value)} aria-invalid={Boolean(errors.date)} />{errors.date && <ErrorText>{errors.date}</ErrorText>}</div>
          <Button type="submit" className="w-full"><Plus size={16} /> Guardar registro</Button>
        </form></CardContent></Card>
        <Card><CardHeader><CardTitle>Materiales recuperados</CardTitle><CardDescription>Distribución de tus kilos registrados.</CardDescription></CardHeader><CardContent className="space-y-5">
          {materialTotals.length === 0 ? <p className="rounded-2xl bg-surface-soft p-5 text-sm text-muted">Todavía no registraste materiales. Tu resumen va a aparecer acá.</p> : materialTotals.map(({ material: item, kg: amount }) => <div key={item.key}><div className="mb-2 flex justify-between gap-3 text-sm"><span className="font-medium">{item.label}</span><span className="tabular-nums text-muted">{formatKg(amount)} kg</span></div><div className="h-2 overflow-hidden rounded-full bg-surface-soft"><div className="h-full rounded-full" style={{ width: `${stats.total > 0 ? (amount / stats.total) * 100 : 0}%`, backgroundColor: item.color }} /></div></div>)}
        </CardContent></Card>
      </div>
      <section className="space-y-4"><div><h2 className="font-display text-2xl font-bold">Tus logros</h2><p className="mt-1 text-sm text-muted">Cada registro te acerca a una nueva meta.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{achievements.map((achievement) => <Card key={achievement.definition.id}><CardContent className="p-5"><div className="flex items-center justify-between"><h3 className="font-semibold">{achievement.definition.title}</h3><Trophy size={18} className={achievement.unlocked ? 'text-accent-foreground' : 'text-muted'} /></div><p className="mt-1 min-h-10 text-xs text-muted">{achievement.definition.description}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-soft"><div className="h-full rounded-full bg-primary" style={{ width: `${achievement.progress}%` }} /></div><p className="mt-2 text-xs text-muted">{achievement.progressText}{achievement.unlocked ? ' · Desbloqueado' : ''}</p></CardContent></Card>)}</div></section>
      <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle>Historial reciente</CardTitle><CardDescription>Tus últimos registros guardados.</CardDescription></div>{records.length > 0 && <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}><AlertDialogTrigger asChild><Button variant="outline" size="sm"><Trash2 size={15} /> Borrar historial</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogTitle>¿Borrar todo el historial?</AlertDialogTitle><AlertDialogDescription>Se eliminarán tus registros de reciclaje guardados en este navegador. Esta acción no se puede deshacer.</AlertDialogDescription><div className="mt-6 flex justify-end gap-2"><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleClear}>Borrar historial</AlertDialogAction></div></AlertDialogContent></AlertDialog>}</div></CardHeader><CardContent>{records.length === 0 ? <p className="text-sm text-muted">No hay registros todavía.</p> : <div className="space-y-3">{records.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((record) => <div key={record.id} className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"><div><p className="text-sm font-semibold">{MATERIALS.find((item) => item.key === record.material)?.label}</p><p className="text-xs text-muted">{formatLongDate(new Date(`${record.date}T12:00:00`))}</p></div><p className="font-display text-lg font-bold tabular-nums">{formatKg(record.kg)} kg</p></div>)}</div>}</CardContent></Card>
      <p className="text-xs text-muted">Tus registros se guardan en este navegador. No representan mediciones oficiales de residuos recuperados.</p>
    </div>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <Card><CardContent className="flex items-center gap-3 p-5"><span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">{icon}</span><div><p className="text-xs text-muted">{label}</p><p className="font-display text-xl font-bold tabular-nums">{value}</p></div></CardContent></Card>;
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-danger" role="alert">{children}</p>;
}
