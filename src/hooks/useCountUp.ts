import { useEffect, useRef, useState } from 'react';

import { prefersReducedMotion } from '@/lib/lenis';

interface UseCountUpOptions {
  /** Milisegundos totales de la animación. */
  duration?: number;
  /** Arranca sólo cuando el elemento entra en pantalla. */
  startOnView?: boolean;
}

/**
 * Cuenta animada de 0 a `target`.
 *
 * Con prefers-reduced-motion muestra el valor final directamente.
 * `startOnView` usa IntersectionObserver sobre un elemento referenciado.
 */
export function useCountUp(
  target: number,
  { duration = 1200, startOnView = true }: UseCountUpOptions = {},
): { ref: React.RefObject<HTMLDivElement | null>; value: number } {
  const ref = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const startTime = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(target * eased);
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setValue(target);
        }
      };
      requestAnimationFrame(tick);
    };

    if (!startOnView || !ref.current || typeof IntersectionObserver === 'undefined') {
      start();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          start();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, startOnView]);

  return { ref, value };
}
