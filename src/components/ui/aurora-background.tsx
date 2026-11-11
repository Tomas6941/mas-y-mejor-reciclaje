import { cn } from '@/lib/utils';

/**
 * Fondo animado tipo aurora (radiales verdes/ámbar desenfocados).
 * Las manchas usan sólo transform y opacity; se pausan con movimiento reducido
 * vía el guard global de index.css.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden',
        className,
      )}
    >
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />
    </div>
  );
}
