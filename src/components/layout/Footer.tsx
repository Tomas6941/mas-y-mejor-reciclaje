import { ArrowUpRight, Github, Leaf, MapPin } from 'lucide-react';

import { navigate } from '@/lib/routes';

/** Pie de página con navegación secundaria y aclaración de datos. */
export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:py-14">
        <div>
          <button onClick={() => navigate('#/')} className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Leaf size={19} /></span> Mas y mejor reciclaje</button>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">Una herramienta comunitaria para hacer más simple el reciclaje en Córdoba. Encontrá puntos, aprendé a separar y medí tu impacto.</p>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted"><MapPin size={14} /> Córdoba, Argentina</p>
        </div>
        <div><h2 className="text-sm font-semibold">Explorá</h2><nav aria-label="Navegación del pie de página" className="mt-4 grid gap-3">{[['Mapa', '#/mapa'], ['Guía de reciclaje', '#/guia'], ['Calendario', '#/calendario'], ['Seguimiento', '#/seguimiento']].map(([label, hash]) => <button key={hash} onClick={() => navigate(hash)} className="w-fit text-left text-sm text-muted transition-colors hover:text-primary">{label}</button>)}</nav></div>
        <div><h2 className="text-sm font-semibold">Participá</h2><div className="mt-4 grid justify-items-start gap-3"><button onClick={() => navigate('#/reportar')} className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary">Reportar un punto <ArrowUpRight size={14} /></button><a href="https://github.com/Tomas6941/mas-y-mejor-reciclaje" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary"><Github size={15} /> Código del proyecto <ArrowUpRight size={14} /></a></div></div>
        <div><h2 className="text-sm font-semibold">Legal</h2><nav aria-label="Documentos legales" className="mt-4 grid gap-3">{[['Privacidad', '#/legalizacion/privacidad'], ['Términos de uso', '#/legalizacion/terminos'], ['Seguridad', '#/legalizacion/seguridad'], ['Cookies', '#/legalizacion/cookies']].map(([label, hash]) => <button key={hash} onClick={() => navigate(hash)} className="w-fit text-left text-sm text-muted transition-colors hover:text-primary">{label}</button>)}</nav></div>
      </div>
      <div className="border-t border-border"><div className="container-page flex flex-col gap-3 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Mas y mejor reciclaje.</p><p>Los puntos y horarios son demostrativos. Verificá la información antes de trasladarte.</p></div></div>
    </footer>
  );
}
