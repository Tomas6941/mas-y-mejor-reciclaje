import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { BackToTop } from '@/components/layout/BackToTop';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SkipLink } from '@/components/layout/SkipLink';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';
import { useHashRoute } from '@/hooks/useHashRoute';
import { initSmoothScroll, scrollToTop } from '@/lib/lenis';
import { isStorageAvailable } from '@/lib/storage';
import { NAV_ITEM_MAP } from '@/lib/routes';

const HomeSection = lazy(() => import('@/components/home/HomeSection'));
const MapSection = lazy(() => import('@/components/map/MapSection'));
const GuideSection = lazy(() => import('@/components/guide/GuideSection'));
const CalendarSection = lazy(() => import('@/components/calendar/CalendarSection'));
const TrackingSection = lazy(() => import('@/components/tracking/TrackingSection'));
const ReportSection = lazy(() => import('@/components/report/ReportSection'));

const SECTION_BY_ROUTE = {
  home: HomeSection,
  map: MapSection,
  guide: GuideSection,
  calendar: CalendarSection,
  tracking: TrackingSection,
  report: ReportSection,
} as const;

function PageFallback() {
  return (
    <div className="container-page space-y-6 pt-28" aria-busy="true" aria-label="Cargando sección">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 rounded-bento" />
        <Skeleton className="h-40 rounded-bento" />
      </div>
      <Skeleton className="h-64 rounded-bento" />
    </div>
  );
}

/** Transición de página entre secciones (fade + slide corto). */
function PageTransition({ routeKey, children }: { routeKey: string; children: React.ReactNode }) {
  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Carcasa de la app: navegación, rutas y transiciones. */
export function AppShell() {
  const { route } = useHashRoute();
  const mainRef = useRef<HTMLElement | null>(null);
  const lastRouteRef = useRef(route);

  useEffect(() => {
    initSmoothScroll();
  }, []);

  useEffect(() => {
    if (lastRouteRef.current !== route) {
      lastRouteRef.current = route;
      scrollToTop();
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [route]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!isStorageAvailable()) {
        toast.info(
          'No podemos guardar tus datos en este navegador. La app funciona, pero los cambios se pierden al recargar.',
          { duration: 7000 },
        );
      }
    }, 900);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const Section = SECTION_BY_ROUTE[route];

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <Header />
      <BottomTabBar />

      <main
        id="contenido"
        ref={mainRef}
        tabIndex={-1}
        aria-label={NAV_ITEM_MAP[route].label}
        className="flex-1 pb-24 lg:pb-0"
      >
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition routeKey={route}>
            <Suspense fallback={<PageFallback />}>
              <Section />
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>

      <Footer />
      <BackToTop />
      <Toaster />
    </div>
  );
}
