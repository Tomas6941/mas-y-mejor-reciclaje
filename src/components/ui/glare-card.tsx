import { useCallback } from 'react';
import type { MouseEvent } from 'react';

import { cn } from '@/lib/utils';

/**
 * Tarjeta con brillo que sigue el mouse (efecto repetido del sistema).
 * La posición se escribe en --glare-x/--glare-y; el gradiente vive en index.css.
 */
export function GlareCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const handlePointerMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--glare-x', `${event.clientX - rect.left}px`);
    target.style.setProperty('--glare-y', `${event.clientY - rect.top}px`);
  }, []);

  return (
    <div
      className={cn('glare-card', className)}
      onPointerMove={handlePointerMove}
      {...props}
    >
      {children}
    </div>
  );
}
