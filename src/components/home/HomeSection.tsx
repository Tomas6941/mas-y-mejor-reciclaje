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
    <div className="w-full">
      <section className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden bg-[#073c2c] px-6 pb-12 pt-28 text-white sm:px-10 sm:pb-16 sm:pt-32 lg:px-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-32 size-[30rem] rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute -bottom-52 left-1/4 size-[34rem] rounded-full bg-green-400/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(#b7efae 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>
        <div className="relative z-10 max-w-xl lg:max-w-[54%]">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-white/5 px-3.5 py-1.5 text-xs font-semibold tracking-[0.16em] text-emerald-100">
            <Recycle size={14} aria-hidden="true" /> ECO PUNTO · CÓRDOBA
          </span>
          <h1 className="mt-6 max-w-2xl font-display text-[2.8rem] font-bold leading-[0.98] tracking-tight sm:text-6xl lg:text-[4.5rem]">
            Reciclar en <span className="text-[#91e176]">Córdoba</span> nunca fue tan fácil
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-emerald-50/75 sm:text-lg">
            Encontrá puntos verdes, descubrí dónde reciclar y empezá a transformar tu ciudad.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => navigate('#/mapa')} className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-[#63c957] px-6 py-3 text-sm font-bold text-[#073c2c] shadow-lg shadow-green-950/20 transition-transform hover:-translate-y-0.5 sm:text-base">
              <MapPin size={19} aria-hidden="true" /> Encontrar puntos verdes <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button onClick={() => navigate('#/guia')} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/70 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:text-base">
              <Recycle size={18} aria-hidden="true" /> Cómo reciclar
            </button>
          </div>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-[-30%] z-0 w-[120%] max-w-[590px] opacity-45 sm:right-[-18%] sm:w-[90%] lg:inset-y-0 lg:right-0 lg:w-[55%] lg:max-w-none lg:opacity-100">
          <svg viewBox="0 0 650 500" className="h-auto w-full drop-shadow-2xl lg:absolute lg:bottom-0 lg:right-[-2%] lg:h-full lg:w-auto lg:max-w-none" role="presentation">
            <defs>
              <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a9e2d8" /><stop offset="1" stopColor="#e4f0c5" /></linearGradient>
              <linearGradient id="hero-hill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#48a94e" /><stop offset="1" stopColor="#155c39" /></linearGradient>
            </defs>
            <circle cx="390" cy="240" r="205" fill="#40a85c" opacity=".22" />
            <circle cx="405" cy="230" r="170" fill="url(#hero-sky)" />
            <path d="M255 323h300v115H255z" fill="#789c77" opacity=".75" />
            <path d="M278 274h64v117h-64zm79-42h77v159h-77zm94 28h83v131h-83z" fill="#7d9aa1" />
            <path d="M292 293h13v19h-13zm27 0h13v19h-13zm33-37h16v19h-16zm30 0h16v19h-16zm30 0h16v19h-16zm-30 35h16v19h-16zm30 0h16v19h-16zm45 1h16v19h-16zm31 0h16v19h-16z" fill="#d5e5d8" />
            <path d="M323 347h185v52H323z" fill="#d5b994" />
            <path d="M335 347V224h26v-24l25-22 25 22v24h25V181l27-27 28 27v166z" fill="#ead7b6" />
            <path d="M329 224h68v123h-68zm101-43h69v166h-69z" fill="#f4e4c7" />
            <path d="M335 220h57v10h-57zm101-42h59v10h-59z" fill="#c4a57e" />
            <path d="M348 200h8v-24l13-12 13 12v24m70-24h8v-28l13-13 13 13v28" fill="#d8c09d" />
            <path d="M352 250a10 10 0 0 1 20 0v28h-20zm27 0a10 10 0 0 1 20 0v28h-20zm57-11a11 11 0 0 1 22 0v31h-22zm31 0a11 11 0 0 1 22 0v31h-22z" fill="#97795b" />
            <path d="M398 347v-40a18 18 0 0 1 36 0v40z" fill="#987a5b" />
            <circle cx="490" cy="111" r="49" fill="#9bd96c" opacity=".86" />
            <path d="M469 128c12-29 35-43 58-44-8 24-28 42-58 44zm15 8c-7-23-1-43 13-59 8 23 4 43-13 59z" fill="#328a49" />
            <path d="M54 382c36-63 118-85 187-48 47-61 132-62 181-15 62-40 132-17 162 45v92H54z" fill="url(#hero-hill)" />
            <path d="M0 440c90-53 169-50 244 0 95-55 193-43 277 0 44-27 90-30 129-11v71H0z" fill="#1b7545" />
            <path d="M28 442c48-52 92-58 134-40-25 5-42 18-54 39 26-19 56-21 88-7-36 9-62 29-82 60H35zm501-35c39-43 78-49 118-27-24 4-41 16-53 36 27-16 54-17 81-3-33 7-56 26-72 54h-69z" fill="#61b84c" />
            <path d="M62 443h530" stroke="#b5ce83" strokeWidth="9" strokeLinecap="round" />
            <g transform="translate(292 330)">
              <path d="M0 24h92l-7 116H8z" fill="#34a843" /><path d="M-4 18h100v18H-4z" rx="8" fill="#52c34e" /><path d="M15 7h70l8 11H7z" fill="#268d39" /><rect x="18" y="52" width="56" height="4" rx="2" fill="#8be47b" opacity=".7" /><text x="46" y="94" fill="white" fontSize="31" textAnchor="middle">↻</text><text x="46" y="115" fill="white" fontSize="10" fontWeight="700" textAnchor="middle">PLÁSTICO</text>
            </g>
            <g transform="translate(391 326)">
              <path d="M0 24h92l-7 116H8z" fill="#2379c5" /><path d="M-4 18h100v18H-4z" fill="#3895e4" /><path d="M15 7h70l8 11H7z" fill="#1764a6" /><rect x="18" y="52" width="56" height="4" rx="2" fill="#9dd5ff" opacity=".65" /><text x="46" y="94" fill="white" fontSize="31" textAnchor="middle">↻</text><text x="46" y="115" fill="white" fontSize="10" fontWeight="700" textAnchor="middle">PAPEL</text>
            </g>
            <g transform="translate(490 330)">
              <path d="M0 24h92l-7 116H8z" fill="#8b6546" /><path d="M-4 18h100v18H-4z" fill="#a47b58" /><path d="M15 7h70l8 11H7z" fill="#765338" /><rect x="18" y="52" width="56" height="4" rx="2" fill="#e6c6a4" opacity=".65" /><text x="46" y="94" fill="white" fontSize="31" textAnchor="middle">↻</text><text x="46" y="115" fill="white" fontSize="10" fontWeight="700" textAnchor="middle">VIDRIO</text>
            </g>
          </svg>
        </div>
      </section>

      <div className="container-page space-y-12 py-12 sm:space-y-16 sm:py-16">
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
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <Card><CardContent className="flex h-full items-center justify-center gap-4 p-5 sm:p-6"><span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">{icon}</span><div><p className="text-xs text-muted">{label}</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p></div></CardContent></Card>;
}

function ActionCard({ icon, title, description, action, onClick }: { icon: React.ReactNode; title: string; description: string; action: string; onClick: () => void }) {
  return <Card className="transition-transform hover:-translate-y-1"><CardContent className="flex h-full flex-col p-6"><span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">{icon}</span><h3 className="mt-5 font-display text-xl font-bold">{title}</h3><p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p><button onClick={onClick} className="mt-5 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-primary">{action} <ArrowRight size={16} /></button></CardContent></Card>;
}
