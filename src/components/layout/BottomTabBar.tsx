import { motion } from 'framer-motion';

import { NAV_ITEMS } from '@/lib/routes';
import { useHashRoute } from '@/hooks/useHashRoute';
import { cn } from '@/lib/utils';

const TABS = NAV_ITEMS.filter((item) => item.primary);
const REPORT = NAV_ITEMS.find((item) => item.key === 'report');

/** Barra inferior de pestañas (mobile) + botón central Reportar. */
export function BottomTabBar() {
  const { route } = useHashRoute();

  return (
    <nav
      aria-label="Navegación principal"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-end justify-around px-2">
        {TABS.slice(0, 2).map((item) => (
          <TabLink key={item.key} item={item} active={route === item.key} />
        ))}

        <li className="relative -mt-7">
          {REPORT && (
            <motion.a
              href={REPORT.hash}
              aria-label="Reportar un contenedor"
              whileTap={{ scale: 0.9 }}
              className="flex size-14 flex-col items-center justify-center rounded-full bg-accent text-accent-foreground shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <REPORT.icon className="size-6" aria-hidden="true" />
              <span className="text-[10px] font-bold leading-none">Reportar</span>
            </motion.a>
          )}
        </li>

        {TABS.slice(2).map((item) => (
          <TabLink key={item.key} item={item} active={route === item.key} />
        ))}
      </ul>
    </nav>
  );
}

function TabLink({
  item,
  active,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <li className="flex-1">
      <a
        href={item.hash}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex min-h-12 min-w-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          active ? 'text-primary' : 'text-muted',
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
        {item.shortLabel}
      </a>
    </li>
  );
}
