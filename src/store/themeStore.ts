import { create } from 'zustand';

import { STORAGE_KEYS, storageSetRaw } from '@/lib/storage';
import type { Theme } from '@/types/domain';

interface ThemeState {
  theme: Theme;
  /** Cambia el tema y lo persiste como string crudo ("dark"/"light"). */
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/** Hex del color de barra del navegador por tema (meta theme-color). */
const META_THEME_COLOR: Record<Theme, string> = {
  light: '#FAF7F0',
  dark: '#17150F',
};

function applyThemeToDocument(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', META_THEME_COLOR[theme]);
}

/** Lee el tema inicial que el script anti-destello ya aplicó al <html>. */
function readInitialTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/**
 * Tema claro/oscuro.
 *
 * Persiste el string crudo "dark"/"light" en ecopunto.theme.v1 (sin JSON),
 * igual que el sitio original. El valor inicial ya lo aplicó index.html
 * antes del primer render para evitar un destello.
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readInitialTheme(),
  setTheme: (theme) => {
    applyThemeToDocument(theme);
    storageSetRaw(STORAGE_KEYS.theme, theme);
    set({ theme });
  },
  toggleTheme: () => {
    get().setTheme(get().theme === 'dark' ? 'light' : 'dark');
  },
}));

/** Tema actual como booleano, para componentes que sólo necesitan saber si es oscuro. */
export function isDarkTheme(theme: Theme): boolean {
  return theme === 'dark';
}
