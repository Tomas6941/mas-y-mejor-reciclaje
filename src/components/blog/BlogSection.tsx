import { BarChart3, Leaf, MapPin, Recycle, Users, type LucideIcon } from 'lucide-react';

const WASTE_RATING = [4, 8, 17, 24, 32, 15, 12, 9, 1, 2].map((count, index) => ({
  label: String(index + 1),
  count,
}));

const SORTING_CATEGORIES = [
  { label: '0 / ninguna', count: 27 },
  { label: '2 categorías', count: 35 },
  { label: '3 categorías', count: 8 },
  { label: '4 categorías', count: 5 },
  { label: '5 categorías', count: 2 },
  { label: '8 categorías', count: 1 },
];

const MATERIALS = [
  { name: 'Plástico', n: 64, always: 48.4, sometimes: 10.9, never: 40.6, score: 1.08 },
  { name: 'Orgánico', n: 73, always: 39.7, sometimes: 28.8, never: 31.5, score: 1.08 },
  { name: 'Inorgánico', n: 69, always: 36.2, sometimes: 27.5, never: 36.2, score: 1.00 },
  { name: 'Botellas', n: 60, always: 35.0, sometimes: 20.0, never: 45.0, score: 0.90 },
  { name: 'Papel', n: 58, always: 32.8, sometimes: 19.0, never: 48.3, score: 0.84 },
  { name: 'Vidrio', n: 58, always: 29.3, sometimes: 19.0, never: 51.7, score: 0.78 },
  { name: 'Cartón', n: 59, always: 22.0, sometimes: 23.7, never: 54.2, score: 0.68 },
  { name: 'Latas', n: 55, always: 16.4, sometimes: 21.8, never: 61.8, score: 0.55 },
];

const COURSES = [
  { name: '1.º', count: 21, percent: 16.9, mean: 4.10, sd: 1.61 },
  { name: '2.º', count: 29, percent: 23.4, mean: 5.24, sd: 1.98 },
  { name: '3.º', count: 27, percent: 21.8, mean: 4.93, sd: 2.54 },
  { name: '4.º', count: 6, percent: 4.8, mean: 5.17, sd: 1.72 },
  { name: '5.º', count: 15, percent: 12.1, mean: 5.27, sd: 1.53 },
  { name: '6.º', count: 21, percent: 16.9, mean: 4.71, sd: 1.15 },
  { name: 'Profes', count: 5, percent: 4.0, mean: 4.40, sd: 1.67 },
];

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="mb-5 max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
    </header>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <article className="rounded-card border border-border bg-surface p-4 shadow-soft sm:p-5">
      <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="size-5" aria-hidden="true" /></span>
      <p className="mt-4 font-display text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </article>
  );
}

function CountBars({
  items,
  total,
  colorClass = 'bg-primary',
}: {
  items: { label: string; count: number }[];
  total: number;
  colorClass?: string;
}) {
  const max = Math.max(...items.map((item) => item.count));

  return (
    <ul className="mt-5 space-y-2.5" aria-label={`Distribución de ${total} respuestas`}>
      {items.map((item) => {
        const percent = (item.count / total) * 100;
        return (
          <li key={item.label} className="grid grid-cols-[5.5rem_minmax(0,1fr)_5.5rem] items-center gap-2 text-xs">
            <span className="truncate text-muted">{item.label}</span>
            <span aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-surface-soft">
              <span className={`block h-full rounded-full ${colorClass}`} style={{ width: `${(item.count / max) * 100}%` }} />
            </span>
            <span className="text-right tabular-nums">{item.count} <span className="text-muted">({percent.toFixed(1).replace('.', ',')}%)</span></span>
          </li>
        );
      })}
    </ul>
  );
}

function MaterialChart() {
  return (
    <div className="space-y-4" role="list" aria-label="Frecuencia de separación por material">
      {MATERIALS.map((material) => (
        <div key={material.name} role="listitem">
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs sm:text-sm">
            <span className="font-medium">{material.name} <span className="font-normal text-muted">(n={material.n})</span></span>
            <span className="text-muted">Siempre {material.always}% · Índice {material.score.toFixed(2).replace('.', ',')}</span>
          </div>
          <div role="img" aria-label={`${material.name}: siempre ${material.always}%, a veces ${material.sometimes}%, nunca ${material.never}%`} className="flex h-3 overflow-hidden rounded-full bg-surface-soft">
            <span className="bg-primary" style={{ width: `${material.always}%` }} />
            <span className="bg-accent" style={{ width: `${material.sometimes}%` }} />
            <span className="bg-border" style={{ width: `${material.never}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BlogSection() {
  return (
    <div className="pb-16 pt-24 sm:pt-28">
      <header className="relative isolate overflow-hidden bg-[#073c2c] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-40 size-[28rem] rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="container-page relative py-14 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-100"><BarChart3 className="size-4" /> Datos locales</span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-6xl">Reciclaje en Córdoba, en números</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-lg">Una lectura clara de lo que respondieron 124 personas: hábitos, materiales y oportunidades para separar mejor.</p>
          <p className="mt-5 text-xs text-emerald-100/70">Encuesta interna · 3 al 12 de noviembre de 2026</p>
        </div>
      </header>

      <div className="container-page">
        <section className="-mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Resumen de la encuesta">
          <MetricCard icon={Users} label="Respuestas recibidas" value="124" />
          <MetricCard icon={MapPin} label="Barrios escritos en respuestas" value="99" />
          <MetricCard icon={Recycle} label="Separan residuos en casa" value="42,7 %" />
          <MetricCard icon={Leaf} label="Promedio autodeclarado de generación" value="4,85 / 10" />
        </section>

        <section className="mt-14" aria-labelledby="habits-title">
          <SectionHeading eyebrow="Hábitos y percepción" title="¿Cuánto separamos y cuánto creemos que generamos?" description="Las barras muestran la cantidad de respuestas en cada opción. La escala de generación es una percepción personal, no una medición de peso." />
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-6">
              <h3 className="font-display text-lg font-semibold">Percepción de residuos generados</h3>
              <p className="mt-1 text-sm text-muted">Escala del 1 al 10 · media 4,85 · mediana y moda 5.</p>
              <CountBars items={WASTE_RATING} total={124} />
              <p className="mt-4 text-xs leading-relaxed text-muted">El 23,4 % eligió 3 o menos; el 9,7 % eligió 8 o más. Desvío estándar: 1,88; Q1–Q3: 4–6.</p>
            </article>

            <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-6">
              <h3 className="font-display text-lg font-semibold">¿Cuántas categorías separan?</h3>
              <p className="mt-1 text-sm text-muted">La respuesta más frecuente fue 2 categorías (35 personas); 27 indicaron ninguna.</p>
              <CountBars items={SORTING_CATEGORIES} total={78} colorClass="bg-accent" />
              <p className="mt-4 text-xs leading-relaxed text-muted">78 respuestas válidas. Se dejaron fuera 41 respuestas vacías y 5 guiones; “ninguna” se contó como 0. Hay un valor 8 que podría ser atípico.</p>
            </article>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="materials-title">
          <SectionHeading eyebrow="Por material" title="Qué se separa siempre, a veces o nunca" description="La frecuencia cambia bastante según el material. Orgánicos y plástico tienen los índices medios más altos; las latas son el material que menos personas separan siempre." />
          <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-7">
            <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted" aria-label="Referencias del gráfico">
              <span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full bg-primary" />Siempre</span>
              <span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full bg-accent" />A veces</span>
              <span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full bg-border" />Nunca</span>
            </div>
            <MaterialChart />
            <p className="mt-5 text-xs leading-relaxed text-muted">Índice medio: Siempre = 2, A veces = 1, Nunca = 0. La cantidad de respuestas válidas varía por material (n=55–73); solo 82 de las 124 personas completaron al menos una respuesta sobre materiales.</p>
          </article>
        </section>

        <section className="mt-14" aria-labelledby="context-title">
          <SectionHeading eyebrow="Acceso y contexto" title="La infraestructura ayuda, pero no alcanza por sí sola" description="En esta muestra, tener tachos diferenciados cerca no aparece asociado a una gran diferencia en la separación dentro del hogar." />
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-6">
              <h3 className="font-display text-lg font-semibold">Tachos diferenciados en el barrio</h3>
              <p className="mt-1 text-sm text-muted">38 personas (30,6 %) dijeron que sí; 86 (69,4 %) dijeron que no.</p>
              <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-surface-soft" role="img" aria-label="30,6 por ciento sí tiene tachos diferenciados en el barrio; 69,4 por ciento no">
                <span className="bg-primary" style={{ width: '30.6%' }} /><span className="bg-border" style={{ width: '69.4%' }} />
              </div>
              <div className="mt-3 flex justify-between text-xs text-muted"><span>Sí 30,6 %</span><span>No 69,4 %</span></div>
            </article>

            <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-6">
              <h3 className="font-display text-lg font-semibold">Separación en casa, según acceso a tachos</h3>
              <div className="mt-5 space-y-4">
                <div><div className="flex justify-between gap-3 text-sm"><span>Con tachos diferenciados</span><strong>44,7 %</strong></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-soft"><span className="block h-full rounded-full bg-primary" style={{ width: '44.7%' }} /></div><p className="mt-1 text-xs text-muted">17 de 38 personas</p></div>
                <div><div className="flex justify-between gap-3 text-sm"><span>Sin tachos diferenciados</span><strong>41,9 %</strong></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-soft"><span className="block h-full rounded-full bg-primary" style={{ width: '41.9%' }} /></div><p className="mt-1 text-xs text-muted">36 de 86 personas</p></div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted">La diferencia observada es pequeña: estos datos por sí solos no muestran una relación clara.</p>
            </article>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="groups-title">
          <SectionHeading eyebrow="Comparaciones" title="Cómo varía la respuesta entre grupos" description="Son promedios de percepción declarada en una escala de 1 a 10. Los grupos pequeños se muestran como referencia y no permiten conclusiones firmes." />
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-6">
              <h3 className="font-display text-lg font-semibold">Promedio por curso</h3>
              <div className="mt-5 space-y-3">
                {COURSES.map((course) => (
                  <div key={course.name} className="grid grid-cols-[3rem_minmax(0,1fr)_6rem] items-center gap-3 text-xs sm:text-sm">
                    <span className="text-muted">{course.name}</span>
                    <span aria-hidden="true" className="h-3 overflow-hidden rounded-full bg-surface-soft"><span className="block h-full rounded-full bg-primary" style={{ width: `${course.mean * 10}%` }} /></span>
                    <span className="text-right tabular-nums">{course.mean.toFixed(2).replace('.', ',')} <span className="text-muted">(n={course.count})</span></span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted">Desvío estándar por grupo: 1.º 1,61; 2.º 1,98; 3.º 2,54; 4.º 1,72; 5.º 1,53; 6.º 1,15; profes 1,67.</p>
            </article>

            <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-6">
              <h3 className="font-display text-lg font-semibold">Promedio según separación en casa</h3>
              <div className="mt-5 space-y-4">
                <div><div className="flex justify-between gap-3 text-sm"><span>No separan (n=71)</span><strong>5,07 / 10</strong></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-soft"><span className="block h-full rounded-full bg-accent" style={{ width: '50.7%' }} /></div></div>
                <div><div className="flex justify-between gap-3 text-sm"><span>Sí separan (n=53)</span><strong>4,57 / 10</strong></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-soft"><span className="block h-full rounded-full bg-primary" style={{ width: '45.7%' }} /></div></div>
              </div>
              <div className="mt-5 rounded-card bg-surface-soft p-4 text-sm leading-relaxed text-muted">Quienes separan declararon un promedio algo menor, pero la diferencia no fue estadísticamente significativa (prueba t de Welch, p = 0,13). No alcanza para afirmar que separar reduzca la cantidad de residuos generados.</div>
            </article>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="sample-title">
          <SectionHeading eyebrow="La muestra" title="Quiénes respondieron" description="La encuesta reunió estudiantes de distintos cursos y cinco respuestas de docentes." />
          <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {COURSES.map((course) => (
                <div key={course.name} className="rounded-card bg-surface-soft p-4">
                  <div className="flex items-baseline justify-between gap-3"><span className="font-semibold">{course.name === 'Profes' ? 'Profes' : `${course.name} curso`}</span><span className="text-sm tabular-nums text-muted">{course.count} · {course.percent}%</span></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-border"><span className="block h-full rounded-full bg-primary" style={{ width: `${course.percent / 23.4 * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-14 grid gap-4 lg:grid-cols-2" aria-label="Detalles y calidad de los datos">
          <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-6">
            <h2 className="font-display text-xl font-semibold">Detalle estadístico</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-card bg-surface-soft p-3"><dt className="text-xs text-muted">Escala de residuos · media</dt><dd className="mt-1 font-semibold">4,85</dd></div>
              <div className="rounded-card bg-surface-soft p-3"><dt className="text-xs text-muted">Mediana / moda</dt><dd className="mt-1 font-semibold">5 / 5 (32)</dd></div>
              <div className="rounded-card bg-surface-soft p-3"><dt className="text-xs text-muted">Desvío / varianza</dt><dd className="mt-1 font-semibold">1,88 / 3,54</dd></div>
              <div className="rounded-card bg-surface-soft p-3"><dt className="text-xs text-muted">Mínimo / máximo</dt><dd className="mt-1 font-semibold">1 / 10</dd></div>
              <div className="rounded-card bg-surface-soft p-3"><dt className="text-xs text-muted">IC del 95 % de la media</dt><dd className="mt-1 font-semibold">4,52 a 5,19</dd></div>
              <div className="rounded-card bg-surface-soft p-3"><dt className="text-xs text-muted">Asimetría</dt><dd className="mt-1 font-semibold">0,28 · casi simétrica</dd></div>
              <div className="rounded-card bg-surface-soft p-3"><dt className="text-xs text-muted">Categorías · media / mediana</dt><dd className="mt-1 font-semibold">1,69 / 2</dd></div>
              <div className="rounded-card bg-surface-soft p-3"><dt className="text-xs text-muted">Categorías · moda</dt><dd className="mt-1 font-semibold">2 (35 respuestas)</dd></div>
              <div className="rounded-card bg-surface-soft p-3"><dt className="text-xs text-muted">Categorías · desvío, min–max</dt><dd className="mt-1 font-semibold">1,54 · 0–8</dd></div>
            </dl>
          </article>

          <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-6">
            <h2 className="font-display text-xl font-semibold">Cómo leer estos resultados</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
              <li><strong className="text-foreground">Es una encuesta interna y descriptiva.</strong> No representa necesariamente a toda Córdoba ni permite atribuir causas.</li>
              <li><strong className="text-foreground">Los barrios no están normalizados.</strong> Hay 99 formas de barrio para 124 respuestas, con variantes de escritura.</li>
              <li><strong className="text-foreground">Cada material tiene distinta cantidad de respuestas.</strong> Hubo celdas sin completar y solo 82 personas respondieron al menos uno.</li>
              <li><strong className="text-foreground">Las respuestas abiertas se agruparon manualmente.</strong> La columna “Puntuación” está vacía porque el formulario no era un quiz.</li>
              <li><strong className="text-foreground">En categorías separadas</strong>, dos personas que dijeron separar en casa dejaron la pregunta sin responder.</li>
            </ul>
          </article>
        </section>

        <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-muted"><Leaf className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> Fuente: resumen estadístico de la encuesta interna del proyecto Mas y mejor reciclaje · Córdoba. Resultados relevados del 3 al 12 de noviembre de 2026.</p>
      </div>
    </div>
  );
}
