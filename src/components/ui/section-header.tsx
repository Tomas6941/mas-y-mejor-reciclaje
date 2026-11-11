import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  /** Eyebrow corto arriba del título (kicker). */
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  align?: 'left' | 'center';
  className?: string;
  /** Contenido extra (acciones, links) alineado a la derecha. */
  actions?: React.ReactNode;
}

/** Encabezado de sección con jerarquía h2 y tipografía display. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  id,
  align = 'left',
  className,
  actions,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end justify-between gap-x-6 gap-y-3',
        align === 'center' && 'flex-col items-center text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          {title}
        </h2>
        {description && <p className="mt-3 text-base text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
