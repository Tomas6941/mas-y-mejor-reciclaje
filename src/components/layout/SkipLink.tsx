/** Link de salto a contenido principal, visible al tabular. */
export function SkipLink() {
  return (
    <a
      href="#contenido"
      className="sr-only z-[80] rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lift focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Saltar al contenido principal
    </a>
  );
}
