import { AlertCircle, Check, Clock3, Eye, LoaderCircle, RefreshCw, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { fetchAdminReportImage, fetchAdminReports, reviewAdminReport, type AdminReport, type AdminReportStatus } from './admin-api';
import { adminGlass } from './admin-style';

const STATUS: { key: AdminReportStatus; label: string }[] = [
  { key: 'pending', label: 'Pendientes' },
  { key: 'approved', label: 'Aprobados' },
  { key: 'rejected', label: 'Rechazados' },
];

const REPORT_LABEL: Record<AdminReport['type'], string> = {
  full: 'Lleno', damaged: 'Dañado', available: 'Disponible',
  move_point: 'Cambiar de lugar', add_point: 'Añadir punto', remove_point: 'Retirar del mapa',
};

export function AdminReportsPanel({ onUpdated }: { onUpdated: () => void }) {
  const [status, setStatus] = useState<AdminReportStatus>('pending');
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [imageReportId, setImageReportId] = useState<string | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [imageLoading, setImageLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try { setReports(await fetchAdminReports(status)); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  async function decide(report: AdminReport, decision: 'approved' | 'rejected') {
    setBusyId(report.id);
    try {
      await reviewAdminReport(report.id, decision);
      toast.success(decision === 'approved' ? 'Reporte aprobado.' : 'Reporte rechazado.');
      await load();
      onUpdated();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'No pudimos actualizar el reporte.');
    } finally { setBusyId(null); }
  }

  async function toggleImage(reportId: string) {
    if (imageReportId === reportId) { setImageReportId(null); return; }
    setImageReportId(reportId);
    if (images[reportId]) return;
    setImageLoading(reportId);
    try {
      const result = await fetchAdminReportImage(reportId);
      setImages((current) => ({ ...current, [reportId]: result.imageData }));
    } catch (cause) {
      setImageReportId(null);
      toast.error(cause instanceof Error ? cause.message : 'No pudimos cargar la foto.');
    } finally { setImageLoading(null); }
  }

  return <div className="space-y-4">
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-[24px] p-4 sm:p-5 ${adminGlass}`}>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar reportes por estado">{STATUS.map((item) => <button key={item.key} type="button" role="tab" aria-selected={status === item.key} onClick={() => setStatus(item.key)} className={`rounded-full border px-4 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${status === item.key ? 'border-blue-300/20 bg-blue-400/15 text-blue-100' : 'border-white/[0.07] bg-white/[0.025] text-slate-400 hover:text-white'}`}>{item.label}</button>)}</div>
      <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="border-white/10 bg-white/[0.025] text-slate-300 hover:bg-white/[0.08] hover:text-white"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Actualizar</Button>
    </div>
    <section className={`overflow-hidden rounded-[26px] ${adminGlass}`}>
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6"><div><h3 className="font-display text-lg font-semibold">Cola de reportes</h3><p className="mt-1 text-xs text-slate-500">Los estados aprobados aparecen en la app; las sugerencias quedan para gestión del equipo.</p></div><span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-[11px] text-slate-400">{reports.length} registros</span></div>
      {loading ? <div className="grid min-h-56 place-items-center text-sm text-slate-500"><span className="flex items-center gap-2"><LoaderCircle size={16} className="animate-spin" />Cargando reportes…</span></div>
        : error ? <div role="alert" className="m-5 flex flex-col items-center gap-3 rounded-2xl border border-rose-300/10 bg-rose-300/[0.04] p-8 text-center"><AlertCircle className="text-rose-200" /><p className="text-sm text-slate-300">No pudimos cargar esta bandeja.</p><Button variant="outline" size="sm" onClick={() => void load()}>Reintentar</Button></div>
          : reports.length === 0 ? <div className="grid min-h-64 place-items-center px-6 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.06] text-emerald-200"><Check size={20} /></span><h4 className="mt-4 font-medium text-slate-200">{status === 'pending' ? 'Todo revisado' : 'Sin resultados'}</h4><p className="mt-1 text-sm text-slate-500">{status === 'pending' ? 'No hay reportes pendientes.' : 'Todavía no hay reportes en esta categoría.'}</p></div></div>
            : <div className="divide-y divide-white/[0.055]">{reports.map((report) => <article key={report.id} className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center sm:p-6"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${report.category === 'suggestion' ? 'border-blue-300/15 bg-blue-300/[0.07] text-blue-100' : report.type === 'damaged' ? 'border-rose-300/15 bg-rose-300/[0.07] text-rose-200' : report.type === 'full' ? 'border-amber-300/15 bg-amber-300/[0.07] text-amber-100' : 'border-emerald-300/15 bg-emerald-300/[0.07] text-emerald-100'}`}>{report.category === 'suggestion' ? 'Sugerencia · ' : 'Estado · '}{REPORT_LABEL[report.type]}</span><span className="flex items-center gap-1 text-[11px] text-slate-500"><Clock3 size={12} />{new Date(report.timestamp).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}</span></div><h4 className="mt-3 truncate font-display text-lg font-semibold text-slate-100">{report.pointName ?? 'Nuevo punto sugerido'}</h4>{report.pointId && <p className="mt-1 text-xs text-slate-500">Punto: <span className="font-mono text-slate-400">{report.pointId}</span></p>}{report.suggestedLocation && <p className="mt-2 text-sm text-slate-300"><span className="text-slate-500">Ubicación sugerida:</span> {report.suggestedLocation}</p>}{report.comment && <p className="mt-3 max-w-3xl rounded-xl border border-white/[0.05] bg-black/10 px-3 py-2.5 text-sm leading-6 text-slate-300">“{report.comment}”</p>}{report.hasImage && <div className="mt-3"><Button size="sm" variant="outline" onClick={() => void toggleImage(report.id)} disabled={imageLoading === report.id} className="border-white/10 bg-white/[0.025] text-slate-300 hover:bg-white/[0.08] hover:text-white">{imageLoading === report.id ? <LoaderCircle size={14} className="animate-spin" /> : <Eye size={14} />}{imageReportId === report.id ? 'Ocultar foto' : 'Ver foto'}</Button>{imageReportId === report.id && images[report.id] && <img src={images[report.id]} alt={`Foto adjunta al reporte de ${report.pointName ?? 'nuevo punto'}`} className="mt-3 max-h-80 max-w-full rounded-xl border border-white/10 object-contain" />}</div>}</div>
              {status === 'pending' ? <div className="flex gap-2 md:justify-end"><Button size="sm" variant="outline" disabled={busyId === report.id} onClick={() => void decide(report, 'rejected')} className="border-white/10 bg-white/[0.025] text-slate-300 hover:border-rose-300/20 hover:bg-rose-300/[0.08] hover:text-rose-100"><X size={14} />Rechazar</Button><Button size="sm" disabled={busyId === report.id} onClick={() => void decide(report, 'approved')} className="bg-blue-500 text-white hover:bg-blue-400">{busyId === report.id ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />}Aprobar</Button></div> : <span className={`flex items-center gap-1.5 text-xs ${status === 'approved' ? 'text-emerald-200' : 'text-slate-400'}`}>{status === 'approved' ? <Check size={13} /> : <X size={13} />}{status === 'approved' ? 'Aprobado' : 'Rechazado'}</span>}</article>)}</div>}
    </section>
  </div>;
}
