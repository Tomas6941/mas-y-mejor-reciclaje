import { ArrowRight, CalendarDays, MapPin, Recycle, TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { NEIGHBOR_COUNT } from '@/data/constants';
import { usePointsStore } from '@/store/pointsStore';
import { useTrackingStore } from '@/store/trackingStore';
import { getTrackingStats } from '@/lib/trackingStats';
import { navigate } from '@/lib/routes';
import { formatKg, formatInteger } from '@/lib/format';

/** Portada: acceso rápido a las herramientas principales de EcoPunto. */
export default function HomeSection() {
  const points = usePointsStore((state) => state.points);
  const records = useTrackingStore((state) => state.records);
  const stats = getTrackingStats(records);

  return (
    <div className="container-page space-y-12 pb-16 pt-28 sm:space-y-16">
      <section className="relative overflow-hidden rounded-hero bg-primary px-6 py-12 text-primary-foreground shadow-soft sm:px-10 sm:py-16 lg:px-14">
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">RECICLÁ EN CÓRDOBA</span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Separar mejor empieza <span className="text-accent">acá.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">Encontrá dónde reciclar, aprendé qué va en cada contenedor y registrá el impacto de tus hábitos.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => navigate('#/mapa')} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5">Encontrar un punto <ArrowRight size={17} /></button>
            <button onClick={() => navigate('#/guia')} className="inline-flex min-h-11 items-center rounded-full border border-primary-foreground bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary shadow-soft transition-[transform,background-color,box-shadow] hover:-translate-y-0.5 hover:bg-primary-foreground/85 hover:shadow-lift">Cómo separar</button>
          </div>
        </div>
      </section>

      <section aria-label="EcoPunto en números" className="grid gap-3 sm:grid-cols-3">
        <Metric icon={<MapPin />} label="Puntos cargados" value={formatInteger(points.length)} />
        <Metric icon={<Recycle />} label="Kilos registrados" value={`${formatKg(stats.total)} kg`} />
        <Metric icon={<TrendingUp />} label="Personas en la red" value={formatInteger(NEIGHBOR_COUNT)} />
      </section>

      <section className="space-y-5">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Tu próximo paso</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Todo lo que necesitás para reciclar mejor</h2>
          <p className="mt-3 text-muted">Herramientas simples para pasar de la intención a la acción.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ActionCard icon={<MapPin />} title="Encontrá un punto verde" description="Explorá puntos y contenedores cercanos en el mapa de Córdoba." action="Abrir mapa" onClick={() => navigate('#/mapa')} />
          <ActionCard icon={<Recycle />} title="Consultá la guía" description="Buscá un residuo y descubrí cómo prepararlo antes de reciclar." action="Ver guía" onClick={() => navigate('#/guia')} />
          <ActionCard icon={<CalendarDays />} title="Revisá tu calendario" description="Consultá los días y horarios demostrativos de recolección por barrio." action="Ver calendario" onClick={() => navigate('#/calendario')} />
          <ActionCard icon={<TrendingUp />} title="Medí tu impacto" description="Registrá tus materiales y seguí tus kilos reciclados y logros." action="Ver seguimiento" onClick={() => navigate('#/seguimiento')} />
        </div>
      </section>

      <Card className="overflow-hidden border-primary/20 bg-primary-soft">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div><h2 className="font-display text-xl font-bold">¿Encontraste un contenedor en mal estado?</h2><p className="mt-1 max-w-xl text-sm text-muted">Avisanos para mantener actualizada la información de los puntos.</p></div>
          <button onClick={() => navigate('#/reportar')} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Hacer un reporte <ArrowRight size={16} /></button>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted">Los puntos, horarios y cifras de esta demo son datos ilustrativos y pueden no reflejar el servicio oficial.</p>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <Card><CardContent className="flex h-full items-center justify-center gap-4 p-5 sm:p-6"><span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">{icon}</span><div><p className="text-xs text-muted">{label}</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p></div></CardContent></Card>;
}

function ActionCard({ icon, title, description, action, onClick }: { icon: React.ReactNode; title: string; description: string; action: string; onClick: () => void }) {
  return <Card className="transition-transform hover:-translate-y-1"><CardContent className="flex h-full flex-col p-6"><span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">{icon}</span><h3 className="mt-5 font-display text-xl font-bold">{title}</h3><p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p><button onClick={onClick} className="mt-5 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-primary">{action} <ArrowRight size={16} /></button></CardContent></Card>;
}
