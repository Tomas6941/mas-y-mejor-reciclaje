import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Send } from 'lucide-react';
import { toast } from 'sonner';

import { AccountNotice } from '@/components/auth/AccountNotice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { REPORT_TYPES } from '@/data/materials';
import { reportSchema } from '@/lib/schemas';
import { formatDateTime } from '@/lib/format';
import { useHashRoute } from '@/hooks/useHashRoute';
import { usePointsStore } from '@/store/pointsStore';
import { useReportsStore } from '@/store/reportsStore';
import { useAuthStore } from '@/store/authStore';
import type { ReportType } from '@/types/domain';

/** Formulario comunitario para informar el estado de un punto. */
export default function ReportSection() {
  const { params } = useHashRoute();
  const points = usePointsStore((state) => state.points);
  const reports = useReportsStore((state) => state.reports);
  const addReport = useReportsStore((state) => state.addReport);
  const user = useAuthStore((state) => state.user);
  const [pointId, setPointId] = useState(params.get('point') ?? '');
  const [type, setType] = useState<ReportType | ''>('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<{ pointId?: string; type?: string; comment?: string }>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = reportSchema.safeParse({ pointId, type, comment });
    if (!parsed.success) {
      const nextErrors: typeof errors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key === 'pointId' || key === 'type' || key === 'comment') nextErrors[key] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }
    const point = points.find((item) => item.id === parsed.data.pointId);
    if (!point) {
      setErrors({ pointId: 'Ese punto ya no está disponible. Elegí otro.' });
      return;
    }
    try {
      await addReport({ point, type: parsed.data.type, comment: parsed.data.comment });
      setErrors({});
      setType('');
      setComment('');
      toast.success('Reporte enviado para revisión. ¡Gracias por colaborar!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos enviar el reporte.');
    }
  }

  return (
    <div className="container-page space-y-8 pb-16 pt-28">
      <header className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wider text-primary">Comunidad</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Reportar un punto</h1><p className="mt-3 text-muted">Contanos si un punto está lleno, dañado o volvió a estar disponible. Los reportes se revisan antes de actualizar la información oficial.</p></header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,.9fr)]">
        <Card><CardHeader><CardTitle>¿Qué pasó?</CardTitle><CardDescription>Completá los datos del punto y del problema.</CardDescription></CardHeader><CardContent>{user?.emailVerifiedAt ? <>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2"><Label htmlFor="report-point">Punto o contenedor</Label><Select value={pointId} onValueChange={setPointId}><SelectTrigger id="report-point" aria-invalid={Boolean(errors.pointId)}><SelectValue placeholder="Elegí un punto" /></SelectTrigger><SelectContent>{points.map((point) => <SelectItem key={point.id} value={point.id}>{point.name}</SelectItem>)}</SelectContent></Select>{errors.pointId && <p className="text-sm text-danger" role="alert">{errors.pointId}</p>}</div>
            <fieldset className="space-y-3"><legend className="text-sm font-medium">Estado del punto</legend><div className="grid gap-2 sm:grid-cols-3">{REPORT_TYPES.map((option) => <button key={option.value} type="button" aria-pressed={type === option.value} onClick={() => setType(option.value)} className={`min-h-24 rounded-2xl border p-3 text-left transition-colors ${type === option.value ? 'border-primary bg-primary-soft' : 'border-border bg-surface hover:bg-surface-soft'}`}><span className="block text-sm font-semibold">{option.label}</span><span className="mt-1 block text-xs text-muted">{option.description}</span></button>)}</div>{errors.type && <p className="text-sm text-danger" role="alert">{errors.type}</p>}</fieldset>
            <div className="space-y-2"><Label htmlFor="report-comment">Comentario (opcional)</Label><Textarea id="report-comment" value={comment} maxLength={180} onChange={(event) => setComment(event.target.value)} placeholder="Agregá un detalle que pueda ayudar..." aria-invalid={Boolean(errors.comment)} /><div className="flex justify-between text-xs text-muted"><span>{errors.comment ?? 'No incluyas datos personales.'}</span><span>{comment.length}/180</span></div></div>
            <Button type="submit" className="w-full"><Send size={16} /> Enviar reporte</Button>
          </form>
        </> : <AccountNotice description="Iniciá sesión y confirmá tu correo para enviar un reporte." />}</CardContent></Card>
        <Card><CardHeader><CardTitle>Reportes recientes</CardTitle><CardDescription>Últimos avisos comunitarios aprobados.</CardDescription></CardHeader><CardContent className="space-y-4">
          {reports.length === 0 ? <p className="rounded-2xl bg-surface-soft p-5 text-sm text-muted">Todavía no hay reportes aprobados para mostrar. Los envíos aparecen acá después de la revisión.</p> : reports.slice(0, 6).map((report) => {
            const label = REPORT_TYPES.find((item) => item.value === report.type)?.label ?? 'Reporte';
            const Icon = report.type === 'full' ? AlertTriangle : report.type === 'damaged' ? AlertTriangle : CheckCircle2;
            return <div key={report.id} className="flex gap-3 border-b border-border pb-4 last:border-0 last:pb-0"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon size={17} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold">{report.pointName}</p><p className="text-xs text-muted">{label} · {formatDateTime(report.timestamp)}</p>{report.comment && <p className="mt-1 text-sm text-muted">{report.comment}</p>}</div></div>;
          })}
        </CardContent></Card>
      </div>
      <p className="flex items-start gap-2 text-xs text-muted"><Clock3 size={15} className="mt-0.5 shrink-0" /> Los puntos y horarios iniciales son demostrativos. Los reportes comunitarios requieren revisión.</p>
    </div>
  );
}
