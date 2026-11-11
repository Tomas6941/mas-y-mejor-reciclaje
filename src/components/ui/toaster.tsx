import { Toaster as SonnerToaster } from 'sonner';

import { useIsDarkTheme } from '@/hooks/useIsDarkTheme';

/** Toasts de EcoPunto, themed claro/oscuro. Montarlo una vez en la app. */
export function Toaster() {
  const isDark = useIsDarkTheme();

  return (
    <SonnerToaster
      theme={isDark ? 'dark' : 'light'}
      position="top-center"
      richColors={false}
      closeButton
      toastOptions={{
        className: '!rounded-2xl !border-border !bg-surface !text-foreground !shadow-lift',
        duration: 4200,
      }}
    />
  );
}
