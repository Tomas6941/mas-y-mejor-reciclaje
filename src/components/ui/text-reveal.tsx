import { motion, useReducedMotion } from 'framer-motion';

import { EASE } from '@/lib/motion';

interface TextRevealProps {
  /** El texto puede llegar como string o párrafos. */
  text: string | string[];
  className?: string;
  /** Retraso inicial en segundos. */
  delay?: number;
  /** Si es true, cada palabra anima por separado; por defecto anima por líneas. */
  as?: 'h1' | 'h2' | 'p';
}

/** Aparición suave de texto por líneas/palabras, respetando motion reducido. */
export function TextReveal({ text, className, delay = 0, as = 'h2' }: TextRevealProps) {
  const reduced = useReducedMotion();
  const lines = Array.isArray(text) ? text : [text];
  const MotionTag = motion[as];

  if (reduced) {
    return (
      <MotionTag className={className}>
        {lines.map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
      </MotionTag>
    );
  }

  return (
    <MotionTag className={className}>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: delay + index * 0.12 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
