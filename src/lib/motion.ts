import type { Variants } from 'framer-motion';

/** Variantes compartidas de entrada para tarjetas y listas. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1 },
};

/** Contenedor que anima hijos en cascada. */
export const staggerContainer = (stagger = 0.06, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/** Transición suave estándar (exponencial, no resorte). */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Resortes compartidos: microinteracciones táctiles. */
export const SPRING = {
  gentle: { type: 'spring', stiffness: 120, damping: 20 },
  snappy: { type: 'spring', stiffness: 400, damping: 30 },
  bouncy: { type: 'spring', stiffness: 320, damping: 18 },
} as const;
