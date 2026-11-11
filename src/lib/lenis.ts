import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

/** ¿La persona prefiere menos movimiento? */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Inicializa el scroll suave; no-op si hay preferencia de movimiento reducido. */
export function initSmoothScroll(): Lenis | null {
  if (lenisInstance) return lenisInstance;
  if (prefersReducedMotion()) return null;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  const raf = (time: number) => {
    lenis.raf(time);
    window.requestAnimationFrame(raf);
  };
  window.requestAnimationFrame(raf);

  lenisInstance = lenis;
  return lenis;
}

/** Detiene el scroll suave (p. ej. al abrir un diálogo con scroll interno). */
export function stopSmoothScroll(): void {
  lenisInstance?.stop();
}

/** Reanuda el scroll suave. */
export function resumeSmoothScroll(): void {
  lenisInstance?.start();
}

/** Lleva la vista al inicio (instantáneo en movimiento reducido). */
export function scrollToTop(): void {
  if (prefersReducedMotion()) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: false });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
