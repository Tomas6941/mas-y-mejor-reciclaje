import { motion } from 'framer-motion';
import { LogOut, ShieldCheck, UserRound } from 'lucide-react';

import { AuthDialog } from '@/components/auth/AuthDialog';
import { Button } from '@/components/ui/button';
import { useWastePalette } from '@/components/ui/waste-palette';
import { NAV_ITEMS } from '@/lib/routes';
import { useHashRoute } from '@/hooks/useHashRoute';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

import { ThemeToggle } from './ThemeToggle';

/** Marca del proyecto con el símbolo de reciclaje. */
function BrandMark() {
  return (
    <a
      href="#/"
      className="flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="Mas y mejor reciclaje, ir al inicio"
    >
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
          <path
            d="M7 19c1.5-8 6-12.5 12-14"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M19 5c-8.5 0-14 4-15 10"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </span>
      <span className="whitespace-nowrap font-display text-xs font-bold leading-tight tracking-tight sm:text-base">Mas y mejor reciclaje</span>
    </a>
  );
}

/** Barra superior flotante con efecto vidrio (desktop) y compacta (mobile). */
export function Header() {
  const { route } = useHashRoute();
  const { openPalette } = useWastePalette();
  const user = useAuthStore((state) => state.user);
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog);
  const logout = useAuthStore((state) => state.logout);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-40"
    >
      <div className="container-page pt-3 sm:pt-4">
        <div className="glass flex h-14 items-center justify-between gap-3 rounded-full pl-4 pr-2 shadow-soft sm:h-16 sm:pl-5">
          <BrandMark />

          <nav aria-label="Navegación principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.filter((item) => item.primary).map((item) => {
                const isActive = route === item.key;
                return (
                  <li key={item.key}>
                    <a
                      href={item.hash}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'relative rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        isActive ? 'text-foreground' : 'text-muted hover:text-foreground',
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="header-nav-pill"
                          className="absolute inset-0 rounded-full bg-primary-soft"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative">{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="accent"
              size="sm"
              onClick={() => openPalette()}
              className="hidden gap-2 font-semibold sm:inline-flex"
              aria-label="Buscar a qué contenedor va un residuo (Ctrl más K)"
            >
              ¿Dónde va esto?
            </Button>
            <ThemeToggle />
            {user?.role === 'admin' && (
              <Button asChild variant="soft" size="sm" aria-current={route === 'admin' ? 'page' : undefined}>
                <a href="#/admin" aria-label="Abrir panel de administración">
                  <ShieldCheck aria-hidden="true" />
                  <span className="hidden sm:inline">Admin</span>
                </a>
              </Button>
            )}
            {user ? (
              <Button variant="outline" size="sm" onClick={() => void logout()} aria-label="Cerrar sesión">
                <LogOut aria-hidden="true" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => openAuthDialog('login')} aria-label="Iniciar sesión">
                <UserRound aria-hidden="true" />
                <span className="hidden sm:inline">Ingresar</span>
              </Button>
            )}
            <Button asChild variant="primary" size="sm" className="hidden lg:inline-flex">
              <a href="#/reportar">Reportar</a>
            </Button>
          </div>
        </div>
      </div>
      <AuthDialog />
    </motion.header>
  );
}
