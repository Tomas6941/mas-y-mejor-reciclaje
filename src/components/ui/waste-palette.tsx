/* eslint-disable react-refresh/only-export-components -- provider + hook de contexto van juntos */
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { MaterialBadge } from '@/components/ui/material-badge';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { navigate } from '@/lib/routes';
import { stopSmoothScroll, resumeSmoothScroll } from '@/lib/lenis';
import { getWasteMatches } from '@/lib/wasteSearch';
import type { WasteItem } from '@/types/domain';

interface WastePaletteContextValue {
  /** Abre la paleta, opcionalmente con una búsqueda inicial. */
  openPalette: (initialQuery?: string) => void;
}

const WastePaletteContext = createContext<WastePaletteContextValue | null>(null);

/** Acceso al command palette desde cualquier sección. */
export function useWastePalette(): WastePaletteContextValue {
  const context = useContext(WastePaletteContext);
  if (!context) {
    throw new Error('useWastePalette debe usarse dentro de WastePaletteProvider');
  }
  return context;
}

const MAX_RESULTS = 8;

/** Paleta de comandos "¿Dónde va este residuo?" (Ctrl/Cmd+K). */
export function WastePaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 120);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPalette = useCallback((initialQuery?: string) => {
    setQuery(initialQuery ?? '');
    setOpen(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      stopSmoothScroll();
      window.setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      resumeSmoothScroll();
    }
  }, [open]);

  const matches = useMemo<WasteItem[]>(
    () => (debouncedQuery.trim().length >= 2 ? getWasteMatches(debouncedQuery) : []),
    [debouncedQuery],
  );
  const shownMatches = matches.slice(0, MAX_RESULTS);

  const handleSelect = useCallback((name: string) => {
    setOpen(false);
    navigate(`#/guia?q=${encodeURIComponent(name)}`);
  }, []);

  const contextValue = useMemo(() => ({ openPalette }), [openPalette]);

  return (
    <WastePaletteContext.Provider value={contextValue}>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Buscador de residuos"
        shouldFilter={false}
        loop
        className="fixed left-1/2 top-[12vh] z-[60] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-bento border border-border bg-surface shadow-lift"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
          <Command.Input
            ref={inputRef}
            value={query}
            onValueChange={setQuery}
            placeholder="¿Dónde va este residuo? Ej.: pila, caja de pizza…"
            className="h-12 flex-1 bg-transparent py-4 text-base text-foreground outline-none placeholder:text-muted"
          />
          <kbd className="hidden shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted sm:block">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-80 overflow-y-auto overscroll-contain p-2">
          <Command.Empty className="px-4 py-8 text-center text-sm text-muted">
            {query.trim().length < 2
              ? 'Escribí al menos 2 letras para buscar.'
              : 'No encontramos ese residuo. Probá con otra palabra.'}
          </Command.Empty>

          {shownMatches.map((item) => (
            <Command.Item
              key={item.name}
              value={item.name}
              onSelect={() => handleSelect(item.name)}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm text-foreground data-[selected=true]:bg-surface-soft"
            >
              <span className="truncate font-medium">{item.name}</span>
              <MaterialBadge material={item.category} />
            </Command.Item>
          ))}
        </Command.List>

        <p className="border-t border-border px-4 py-2 text-xs text-muted">
          Elegí un residuo para ver a qué contenedor va.
        </p>
      </Command.Dialog>
      {children}
    </WastePaletteContext.Provider>
  );
}
