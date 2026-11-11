import { useEffect, useState } from 'react';

import { parseHash, type RouteKey } from '@/lib/routes';

export interface RouteState {
  route: RouteKey;
  params: URLSearchParams;
  hash: string;
}

/** Enrutado por hash (#/mapa, #/guia?q=...) sin dependencias externas. */
export function useHashRoute(): RouteState {
  const [state, setState] = useState<RouteState>(() => readHash());

  useEffect(() => {
    const handleHashChange = () => setState(readHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return state;
}

function readHash(): RouteState {
  const hash = window.location.hash || '#/';
  const { route, params } = parseHash(hash);
  return { route, params, hash };
}
