import { useEffect, useState } from 'react';

/** Devuelve el valor tras `wait` ms sin cambios (para búsquedas, 180ms por defecto). */
export function useDebouncedValue<T>(value: T, wait = 180): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), wait);
    return () => window.clearTimeout(timeoutId);
  }, [value, wait]);

  return debounced;
}
