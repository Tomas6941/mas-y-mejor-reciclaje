import { Moon, Sun } from 'lucide-react';

import { useIsDarkTheme } from '@/hooks/useIsDarkTheme';
import { useThemeStore } from '@/store/themeStore';

/** Toggle claro/oscuro con aria-pressed, accesible. */
export function ThemeToggle({ className }: { className?: string }) {
  const isDark = useIsDarkTheme();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className={
        className ??
        'inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      }
    >
      {isDark ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}
