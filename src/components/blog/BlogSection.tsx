import { BarChart3, Leaf } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = {
  primary: 'rgb(var(--primary))',
  accent: 'rgb(var(--accent))',
  muted: 'rgb(var(--border-strong))',
  grid: 'rgb(var(--border))',
};

const PIE_COLORS = [COLORS.primary, COLORS.accent, COLORS.muted];

const WASTE_RATING = [4, 8, 17, 24, 32, 15, 12, 9, 1, 2].map((count, index) => ({
  rating: String(index + 1),
  count,
}));

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

const PIE_DATA = [
  {
    title: 'Tachos diferenciados en el barrio',
    description: 'La mayoría no encuentra separación de residuos en su zona.',
    total: 124,
    data: [
      { name: 'Sí hay', value: 30.6, count: 38 },
      { name: 'No hay', value: 69.4, count: 86 },
    ],
  },
  {
    title: 'Separación en casa',
    description: 'Algo menos de la mitad dice separar sus residuos.',
    total: 124,
    data: [
      { name: 'Sí separa', value: 42.7, count: 53 },
      { name: 'No separa', value: 57.3, count: 71 },
    ],
  },
  {
    title: 'Categorías que separan',
    description: 'Dos categorías es la respuesta más común.',
    total: 78,
    data: [
      { name: 'Ninguna', value: 27 / 78 * 100, count: 27 },
      { name: 'Dos', value: 35 / 78 * 100, count: 35 },
      { name: 'Tres o más', value: 16 / 78 * 100, count: 16 },
    ],
  },
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

function PieCard({
  title,
  description,
  total,
  data,
}: (typeof PIE_DATA)[number]) {
  return (
    <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-6">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 min-h-10 text-sm text-muted">{description}</p>
      <div className="relative mt-2 h-48" role="img" aria-label={`${title}, sobre ${total} respuestas`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="86%" paddingAngle={2} stroke="none">
              {data.map((item, index) => <Cell key={item.name} fill={PIE_COLORS[index]} />)}
            </Pie>
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')} %`, 'Respuestas']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold tabular-nums">{total}</span>
          <span className="text-xs text-muted">respuestas</span>
        </div>
      </div>
      <ul className="mt-2 space-y-2" aria-label={`Referencias de ${title}`}>
        {data.map((item, index) => (
          <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />{item.name}</span>
            <span className="font-semibold tabular-nums">{item.value.toFixed(1).replace('.', ',')} % <span className="font-normal text-muted">({item.count})</span></span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function MaterialBars() {
  return (
    <ResponsiveContainer width="100%" height={330}>
      <BarChart data={MATERIALS} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
        <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(value: number) => `${value}%`} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={86} tick={{ fill: COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')} %`]} />
        <Bar dataKey="always" name="Siempre" stackId="frequency" fill={COLORS.primary} />
        <Bar dataKey="sometimes" name="A veces" stackId="frequency" fill={COLORS.accent} />
        <Bar dataKey="never" name="Nunca" stackId="frequency" fill={COLORS.muted} radius={[0, 5, 5, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RatingBars() {
  return (
    <ResponsiveContainer width="100%" height={245}>
      <BarChart data={WASTE_RATING} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="rating" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(value) => [value, 'Respuestas']} labelFormatter={(label) => `Puntaje ${label} de 10`} />
        <Bar dataKey="count" name="Respuestas" fill={COLORS.primary} radius={[5, 5, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function CourseMeans() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={COURSES} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 0 }}>
        <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 10]} tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={58} tick={{ fill: COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(value) => [Number(value).toFixed(2).replace('.', ','), 'Promedio']} />
        <Bar dataKey="mean" name="Promedio" fill={COLORS.primary} radius={[0, 5, 5, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function BlogSection() {
  return (
    <div className="container-page pb-16 pt-28">
      <header className="mb-8 max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"><BarChart3 className="size-4" /> Encuesta local</span>
        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">Así reciclamos en Córdoba</h1>
        <p className="mt-3 text-base text-muted sm:text-lg">124 respuestas para entender qué separamos, qué nos cuesta y dónde podemos mejorar.</p>
        <p className="mt-3 text-xs text-muted">Encuesta interna · noviembre de 2026</p>
      </header>

        <section aria-labelledby="habits-title">
          <SectionHeading eyebrow="De un vistazo" title="Hábitos de separación" description="Cada gráfico resume una pregunta de la encuesta. Pasá el cursor sobre las porciones para ver los valores." />
          <div className="grid gap-4 lg:grid-cols-3">
            {PIE_DATA.map((item) => <PieCard key={item.title} {...item} />)}
          </div>
          <p className="mt-3 text-xs text-muted">El gráfico de categorías usa 78 respuestas válidas; “ninguna” se agrupó con cero.</p>
        </section>

        <section className="mt-14" aria-labelledby="materials-title">
          <SectionHeading eyebrow="Por material" title="Qué se separa siempre, a veces o nunca" description="El plástico y los orgánicos lideran la separación constante; las latas son el desafío más marcado." />
          <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-7">
            <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted" aria-label="Referencias del gráfico">
              <span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full bg-primary" />Siempre</span>
              <span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full bg-accent" />A veces</span>
              <span className="inline-flex items-center gap-2"><i className="size-2.5 rounded-full bg-border-strong" />Nunca</span>
            </div>
            <MaterialBars />
            <p className="text-xs leading-relaxed text-muted">El número de respuestas cambia por material; solo 82 personas completaron al menos uno.</p>
          </article>
        </section>

        <section className="mt-14" aria-labelledby="rating-title">
          <SectionHeading eyebrow="Percepción" title="¿Cuánta basura sentimos que producimos?" description="La escala va de 1 a 10. La respuesta más común fue 5 y el promedio quedó cerca del punto medio." />
          <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-7">
            <RatingBars />
          </article>
        </section>

        <details className="group mt-14 rounded-bento border border-border bg-surface shadow-soft">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
            <span><span className="block text-sm font-semibold uppercase tracking-wider text-primary">Para profundizar</span><span className="mt-1 block font-display text-xl font-semibold sm:text-2xl">Más datos y contexto</span></span>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-xl text-primary transition-transform group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <div className="space-y-10 border-t border-border p-5 sm:p-6">
            <section aria-labelledby="course-means-title">
              <h2 id="course-means-title" className="font-display text-lg font-semibold">Promedio de generación declarado por curso</h2>
              <p className="mt-1 text-sm text-muted">Escala de 1 a 10. Los grupos con pocas respuestas se muestran solo como referencia.</p>
              <div className="mt-4 max-w-3xl"><CourseMeans /></div>
              <div className="grid gap-2 text-xs text-muted sm:grid-cols-2 lg:grid-cols-4">
                {COURSES.map((course) => <p key={course.name}>{course.name}: media {course.mean.toFixed(2).replace('.', ',')} · desvío {course.sd.toFixed(2).replace('.', ',')} · n={course.count}</p>)}
              </div>
            </section>

            <section aria-labelledby="home-sort-title">
              <h2 id="home-sort-title" className="font-display text-lg font-semibold">Percepción según separación en casa</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-card bg-surface-soft p-4"><p className="text-sm text-muted">No separan · n=71</p><p className="mt-1 font-display text-2xl font-bold">5,07 / 10</p></div>
                <div className="rounded-card bg-primary-soft p-4"><p className="text-sm text-muted">Sí separan · n=53</p><p className="mt-1 font-display text-2xl font-bold">4,57 / 10</p></div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">La diferencia no fue estadísticamente significativa (prueba t de Welch, p = 0,13); no alcanza para afirmar que separar reduzca la cantidad de residuos generados.</p>
            </section>

            <section aria-labelledby="descriptive-title">
              <h2 id="descriptive-title" className="font-display text-lg font-semibold">Estadísticas completas</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-card border border-border p-4">
                  <h3 className="font-semibold">Escala de residuos (1–10)</h3>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted">Media</dt><dd className="text-right">4,85</dd>
                    <dt className="text-muted">Mediana / moda</dt><dd className="text-right">5 / 5 (32)</dd>
                    <dt className="text-muted">Desvío / varianza</dt><dd className="text-right">1,88 / 3,54</dd>
                    <dt className="text-muted">Mínimo / máximo</dt><dd className="text-right">1 / 10</dd>
                    <dt className="text-muted">Cuartiles Q1 / Q3</dt><dd className="text-right">4 / 6</dd>
                    <dt className="text-muted">Asimetría</dt><dd className="text-right">0,28</dd>
                    <dt className="text-muted">IC 95 % de la media</dt><dd className="text-right">4,52–5,19</dd>
                  </dl>
                </div>
                <div className="rounded-card border border-border p-4">
                  <h3 className="font-semibold">Cantidad de categorías</h3>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted">Respuestas válidas</dt><dd className="text-right">78</dd>
                    <dt className="text-muted">Media / mediana</dt><dd className="text-right">1,69 / 2</dd>
                    <dt className="text-muted">Moda</dt><dd className="text-right">2 (35 casos)</dd>
                    <dt className="text-muted">Desvío</dt><dd className="text-right">1,54</dd>
                    <dt className="text-muted">Mínimo / máximo</dt><dd className="text-right">0 / 8</dd>
                  </dl>
                </div>
              </div>
            </section>

            <section aria-labelledby="material-values-title">
              <h2 id="material-values-title" className="font-display text-lg font-semibold">Detalle por material</h2>
              <p className="mt-1 text-sm text-muted">El índice resume la frecuencia: Siempre = 2, A veces = 1, Nunca = 0.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-b border-border text-xs text-muted"><tr><th className="py-2 font-medium">Material</th><th className="py-2 text-right font-medium">n</th><th className="py-2 text-right font-medium">Siempre</th><th className="py-2 text-right font-medium">A veces</th><th className="py-2 text-right font-medium">Nunca</th><th className="py-2 text-right font-medium">Índice</th></tr></thead>
                  <tbody>{MATERIALS.map((material) => <tr key={material.name} className="border-b border-border/60"><th className="py-2 font-medium">{material.name}</th><td className="py-2 text-right tabular-nums">{material.n}</td><td className="py-2 text-right tabular-nums">{material.always.toFixed(1).replace('.', ',')} %</td><td className="py-2 text-right tabular-nums">{material.sometimes.toFixed(1).replace('.', ',')} %</td><td className="py-2 text-right tabular-nums">{material.never.toFixed(1).replace('.', ',')} %</td><td className="py-2 text-right tabular-nums">{material.score.toFixed(2).replace('.', ',')}</td></tr>)}</tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="sample-title">
              <h2 id="sample-title" className="font-display text-lg font-semibold">Quiénes participaron</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="border-b border-border text-xs text-muted"><tr><th className="py-2 font-medium">Curso</th><th className="py-2 text-right font-medium">Respuestas</th><th className="py-2 text-right font-medium">Porcentaje</th></tr></thead>
                  <tbody>{COURSES.map((course) => <tr key={course.name} className="border-b border-border/60"><th className="py-2 font-medium">{course.name === 'Profes' ? 'Profes' : `${course.name} curso`}</th><td className="py-2 text-right tabular-nums">{course.count}</td><td className="py-2 text-right tabular-nums">{course.percent.toFixed(1).replace('.', ',')} %</td></tr>)}</tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="quality-title">
              <h2 id="quality-title" className="font-display text-lg font-semibold">Alcance y calidad de los datos</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
                <li>La encuesta interna se realizó del 3 al 12 de noviembre de 2026; sus resultados son descriptivos y no representan necesariamente a toda Córdoba.</li>
                <li>Se registraron 99 formas de barrio para 124 respuestas; hay nombres con variantes de escritura que habría que unificar antes de comparar por barrio.</li>
                <li>La pregunta sobre materiales tuvo una cantidad distinta de respuestas por material; solo 82 personas respondieron al menos uno.</li>
                <li>Para el recuento de categorías se descartaron 41 respuestas vacías y 5 guiones; “ninguna” se contó como cero. Dos personas que separan en casa dejaron esa pregunta vacía.</li>
                <li>La columna “Puntuación” está vacía porque el formulario no era un quiz. Las respuestas abiertas sobre residuos se agruparon manualmente para el resumen.</li>
                <li>La diferencia entre cursos y el valor máximo de 8 categorías deben leerse con cautela; algunos grupos tienen pocos casos y ese valor puede ser atípico.</li>
              </ul>
            </section>
          </div>
        </details>

        <p className="mt-7 flex items-start gap-2 text-xs leading-relaxed text-muted"><Leaf className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> Fuente: estadísticas descriptivas de la encuesta interna de Mas y mejor reciclaje · Córdoba.</p>
    </div>
  );
}
