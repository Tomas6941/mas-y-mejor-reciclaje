import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, ImagePlus, MapPin, Send, X } from 'lucide-react';
import { toast } from 'sonner';

import { AccountNotice } from '@/components/auth/AccountNotice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { REPORT_TYPES } from '@/data/materials';
import { reportSchema } from '@/lib/schemas';
import { compressReportImage } from '@/lib/reportImage';
import { formatDateTime } from '@/lib/format';
import { useHashRoute } from '@/hooks/useHashRoute';
import { usePointsStore } from '@/store/pointsStore';
import { useReportsStore } from '@/store/reportsStore';
import { useAuthStore } from '@/store/authStore';
import type { ReportCategory, ReportType } from '@/types/domain';

const SUGGESTION_TYPES: { value: ReportType; label: string; description: string }[] = [
  { value: 'move_point', label: 'Cambiar de lugar', description: 'Sugerí reubicar un punto existente.' },
  { value: 'add_point', label: 'Añadir contenedor/punto', description: 'Proponé un nuevo contenedor o punto verde.' },
  { value: 'remove_point', label: 'Retirar del mapa', description: 'Avisá que ya fue removido de la zona.' },
];

const SUGGESTION_LABEL: Record<string, string> = {
  move_point: 'Cambio de ubicación',
  add_point: 'Nuevo punto sugerido',
  remove_point: 'Punto removido',
};

export default function ReportSection() {
  const { params } = useHashRoute();
  const points = usePointsStore((state) => state.points);
  const reports = useReportsStore((state) => state.reports);
  const addReport = useReportsStore((state) => state.addReport);
  const user = useAuthStore((state) => state.user);
  const [category, setCategory] = useState<ReportCategory>('container_status');
  const [type, setType] = useState<ReportType | ''>('');
  const [pointId, setPointId] = useState(params.get('point') ?? '');
  const [comment, setComment] = useState('');
  const [suggestedLocation, setSuggestedLocation] = useState('');
  const [imageData, setImageData] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ pointId?: string; type?: string; comment?: string; suggestedLocation?: string }>({});

  const pointRequired = category === 'container_status' || (category === 'suggestion' && type !== 'add_point');
  const point = useMemo(() => points.find((item) => item.id === pointId) ?? null, [points, pointId]);
  const typeOptions = category === 'container_status' ? REPORT_TYPES : SUGGESTION_TYPES;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = reportSchema.safeParse({ category, pointId, type, comment, suggestedLocation, imageData });
    if (!parsed.success) {
      const nextErrors: typeof errors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key === 'pointId' || key === 'type' || key === 'comment' || key === 'suggestedLocation') nextErrors[key] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }
    if (pointRequired && !point) {
      setErrors({ pointId: 'Ese punto ya no está disponible. Elegí otro.' });
      return;
    }

    setBusy(true);
    try {
      await addReport({
        point: pointRequired ? point : null,
        category,
        type: parsed.data.type,
        comment: parsed.data.comment,
        suggestedLocation: parsed.data.suggestedLocation,
        imageData: parsed.data.imageData,
      });
      setErrors({});
      setType('');
      setPointId('');
      setComment('');
      setSuggestedLocation('');
      setImageData(undefined);
      toast.success('Envío recibido para revisión. ¡Gracias por colaborar!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos enviar el reporte.');
    } finally {
      setBusy(false);
    }
  }

  async function handleImage(file?: File) {
    if (!file) return;
    try {
      setImageData(await compressReportImage(file));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos procesar la imagen.');
    }
  }

  return (
    <div className="container-page space-y-8 pb-16 pt-28">
      <header className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wider text-primary">Comunidad</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Reportar o sugerir un punto</h1><p className="mt-3 text-muted">Informá el estado de un contenedor o enviá una sugerencia para mejorar los puntos del mapa. El equipo revisa cada envío.</p></header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,.9fr)]">
        <Card><CardHeader><CardTitle>¿Cómo querés colaborar?</CardTitle><CardDescription>Podés agregar una foto para ayudar a revisar el aviso.</CardDescription></CardHeader><CardContent>{user?.emailVerifiedAt ? <>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <fieldset className="space-y-3"><legend className="text-sm font-medium">Tipo de envío</legend><div className="grid gap-2 sm:grid-cols-2">
              <button type="button" aria-pressed={category === 'container_status'} onClick={() => { setCategory('container_status'); setType(''); }} className={`min-h-20 rounded-2xl border p-3 text-left transition-colors ${category === 'container_status' ? 'border-primary bg-primary-soft' : 'border-border bg-surface hover:bg-surface-soft'}`}><span className="block text-sm font-semibold">Reportar estado</span><span className="mt-1 block text-xs text-muted">Lleno, dañado o disponible</span></button>
              <button type="button" aria-pressed={category === 'suggestion'} onClick={() => { setCategory('suggestion'); setType(''); }} className={`min-h-20 rounded-2xl border p-3 text-left transition-colors ${category === 'suggestion' ? 'border-primary bg-primary-soft' : 'border-border bg-surface hover:bg-surface-soft'}`}><span className="block text-sm font-semibold">Sugerir un cambio</span><span className="mt-1 block text-xs text-muted">Ubicación, alta o retiro</span></button>
            </div></fieldset>

            <fieldset className="space-y-3"><legend className="text-sm font-medium">{category === 'container_status' ? 'Estado del punto' : '¿Qué sugerís?'}</legend><div className="grid gap-2 sm:grid-cols-3">{typeOptions.map((option) => <button key={option.value} type="button" aria-pressed={type === option.value} onClick={() => setType(option.value)} className={`min-h-24 rounded-2xl border p-3 text-left transition-colors ${type === option.value ? 'border-primary bg-primary-soft' : 'border-border bg-surface hover:bg-surface-soft'}`}><span className="block text-sm font-semibold">{option.label}</span><span className="mt-1 block text-xs text-muted">{option.description}</span></button>)}</div>{errors.type && <p className="text-sm text-danger" role="alert">{errors.type}</p>}</fieldset>

            {pointRequired && <div className="space-y-2"><Label htmlFor="report-point">Punto o contenedor relacionado</Label><Select value={pointId} onValueChange={setPointId}><SelectTrigger id="report-point" aria-invalid={Boolean(errors.pointId)}><SelectValue placeholder="Elegí un punto" /></SelectTrigger><SelectContent>{points.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select>{errors.pointId && <p className="text-sm text-danger" role="alert">{errors.pointId}</p>}</div>}

            {category === 'suggestion' && type === 'add_point' && <div className="space-y-2"><Label htmlFor="report-location">Ubicación sugerida</Label><Textarea id="report-location" value={suggestedLocation} maxLength={240} onChange={(event) => setSuggestedLocation(event.target.value)} placeholder="Dirección, cruce de calles o referencia cercana" aria-invalid={Boolean(errors.suggestedLocation)} /><p className="text-xs text-muted" role={errors.suggestedLocation ? 'alert' : undefined}>{errors.suggestedLocation ?? `${suggestedLocation.length}/240`}</p></div>}

            <div className="space-y-2"><Label htmlFor="report-comment">Detalle (opcional)</Label><Textarea id="report-comment" value={comment} maxLength={500} onChange={(event) => setComment(event.target.value)} placeholder={category === 'suggestion' && type === 'move_point' ? 'Contanos a dónde convendría moverlo y por qué...' : 'Agregá información que ayude a revisar el envío...'} aria-invalid={Boolean(errors.comment)} /><div className="flex justify-between text-xs text-muted"><span>{errors.comment ?? 'No incluyas datos personales.'}</span><span>{comment.length}/500</span></div></div>

            <div className="space-y-2"><Label htmlFor="report-image">Foto (opcional)</Label><div className="flex flex-wrap items-center gap-3"><label htmlFor="report-image" className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium transition-colors hover:bg-surface-soft"><ImagePlus size={16} />{imageData ? 'Cambiar foto' : 'Añadir una foto'}</label><input id="report-image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { void handleImage(event.target.files?.[0]); event.currentTarget.value = ''; }} /><span className="text-xs text-muted">JPG, PNG o WebP · máximo 10 MB original</span></div>{imageData && <div className="relative mt-3 w-fit"><img src={imageData} alt="Vista previa de la foto adjunta" className="max-h-56 max-w-full rounded-2xl border border-border object-contain" /><button type="button" onClick={() => setImageData(undefined)} aria-label="Quitar foto" className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full bg-foreground text-background"><X size={16} /></button></div>}</div>

            <Button type="submit" className="w-full" disabled={busy || !type}><Send size={16} /> {busy ? 'Enviando…' : 'Enviar para revisión'}</Button>
          </form>
        </> : <AccountNotice description="Iniciá sesión y confirmá tu correo para enviar un reporte o una sugerencia." />}</CardContent></Card>
        <Card><CardHeader><CardTitle>Reportes recientes</CardTitle><CardDescription>Últimos avisos comunitarios aprobados.</CardDescription></CardHeader><CardContent className="space-y-4">
          {reports.length === 0 ? <p className="rounded-2xl bg-surface-soft p-5 text-sm text-muted">Todavía no hay reportes aprobados para mostrar. Los envíos aparecen acá después de la revisión.</p> : reports.slice(0, 6).map((report) => {
            const label = report.category === 'suggestion' ? SUGGESTION_LABEL[report.type] : REPORT_TYPES.find((item) => item.value === report.type)?.label ?? 'Reporte';
            const Icon = report.type === 'full' || report.type === 'damaged' ? AlertTriangle : report.type === 'available' ? CheckCircle2 : MapPin;
            return <div key={report.id} className="flex gap-3 border-b border-border pb-4 last:border-0 last:pb-0"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon size={17} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold">{report.pointName ?? 'Sugerencia de nuevo punto'}</p><p className="text-xs text-muted">{label} · {formatDateTime(report.timestamp)}</p>{report.comment && <p className="mt-1 text-sm text-muted">{report.comment}</p>}</div></div>;
          })}
        </CardContent></Card>
      </div>
      <p className="flex items-start gap-2 text-xs text-muted"><Clock3 size={15} className="mt-0.5 shrink-0" /> Los puntos y horarios iniciales son demostrativos. Los reportes y sugerencias requieren revisión.</p>
    </div>
  );
}
