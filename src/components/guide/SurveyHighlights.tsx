const MATERIALS = [
  { name: 'Plástico', n: 64, always: 48.4, sometimes: 10.9, never: 40.6 },
  { name: 'Orgánicos', n: 73, always: 39.7, sometimes: 28.8, never: 31.5 },
  { name: 'Inorgánicos', n: 69, always: 36.2, sometimes: 27.5, never: 36.2 },
  { name: 'Botellas', n: 60, always: 35, sometimes: 20, never: 45 },
  { name: 'Papel', n: 58, always: 32.8, sometimes: 19, never: 48.3 },
  { name: 'Vidrio', n: 58, always: 29.3, sometimes: 19, never: 51.7 },
  { name: 'Cartón', n: 59, always: 22, sometimes: 23.7, never: 54.2 },
  { name: 'Latas', n: 55, always: 16.4, sometimes: 21.8, never: 61.8 },
];

function SplitBar({ yes, no, label }: { yes: number; no: number; label: string }) {
  return (
    <div
      role="img"
      aria-label={`${label}: sí ${yes.toFixed(1).replace('.', ',')} por ciento, no ${no.toFixed(1).replace('.', ',')} por ciento`}
      className="mt-3 flex h-3 overflow-hidden rounded-full bg-surface-soft"
    >
      <span className="bg-primary" style={{ width: `${yes}%` }} />
      <span className="bg-border" style={{ width: `${no}%` }} />
    </div>
  );
}

export function SurveyHighlights() {
  return (
    <section className="mt-14" aria-labelledby="survey-title">
      <header className="mb-5 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Una mirada local</p>
        <h2 id="survey-title" className="mt-2 font-display text-2xl font-semibold sm:text-3xl">¿Qué nos mostró la encuesta?</h2>
        <p className="mt-2 text-sm text-muted">Resultados descriptivos de una encuesta interna a 124 personas de Córdoba.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-6">
          <h3 className="font-display text-lg font-semibold">Separación en casa y tachos en el barrio</h3>
          <p className="mt-1 text-sm text-muted">La infraestructura cercana sigue siendo una oportunidad de mejora.</p>
          <div className="mt-5 space-y-5">
            <div>
              <div className="flex items-baseline justify-between gap-3 text-sm"><span>En el barrio hay tachos diferenciados</span><strong className="text-primary">30,6 % sí</strong></div>
              <SplitBar yes={30.6} no={69.4} label="Tachos diferenciados en el barrio" />
              <p className="mt-1 text-xs text-muted">69,4 % respondió que no.</p>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-3 text-sm"><span>Separan residuos en casa</span><strong className="text-primary">42,7 % sí</strong></div>
              <SplitBar yes={42.7} no={57.3} label="Separación de residuos en casa" />
              <p className="mt-1 text-xs text-muted">57,3 % respondió que no.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted" aria-label="Referencias del gráfico">
            <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-primary" />Sí</span>
            <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-border" />No</span>
          </div>
        </article>

        <article className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-6">
          <h3 className="font-display text-lg font-semibold">¿Qué materiales se separan siempre?</h3>
          <p className="mt-1 text-sm text-muted">Plástico encabeza las respuestas; las latas muestran el mayor desafío.</p>
          <div className="mt-5 space-y-3" role="list" aria-label="Separación por material">
            {MATERIALS.map((material) => (
              <div key={material.name} role="listitem">
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium">{material.name} <span className="font-normal text-muted">(n={material.n})</span></span>
                  <span className="tabular-nums text-muted">Siempre {material.always}%</span>
                </div>
                <div
                  role="img"
                  aria-label={`${material.name}: siempre ${material.always}%, a veces ${material.sometimes}%, nunca ${material.never}%`}
                  className="flex h-2.5 overflow-hidden rounded-full bg-surface-soft"
                >
                  <span className="bg-primary" style={{ width: `${material.always}%` }} />
                  <span className="bg-accent" style={{ width: `${material.sometimes}%` }} />
                  <span className="bg-border" style={{ width: `${material.never}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted" aria-label="Referencias del gráfico">
            <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-primary" />Siempre</span>
            <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-accent" />A veces</span>
            <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-border" />Nunca</span>
          </div>
        </article>
      </div>

      <div className="mt-4 grid gap-3 rounded-card border border-border bg-surface-soft p-4 sm:grid-cols-2 sm:gap-5 sm:p-5">
        <div>
          <p className="font-display text-xl font-bold tabular-nums">4,85 <span className="text-sm font-medium text-muted">/ 10</span></p>
          <p className="mt-1 text-xs text-muted">Promedio de residuos que las personas dicen generar.</p>
        </div>
        <div>
          <p className="font-display text-xl font-bold">2 categorías</p>
          <p className="mt-1 text-xs text-muted">La respuesta más frecuente sobre cuántas separan (35 personas).</p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">En la pregunta por material hubo entre 55 y 73 respuestas válidas; la cantidad varía por material. La encuesta es interna y descriptiva, y no representa necesariamente a toda la ciudad.</p>
    </section>
  );
}
