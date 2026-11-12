import type { LucideIcon } from 'lucide-react';
import {
  CalendarCheck2,
  House,
  Map,
  Recycle,
  ShieldCheck,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import type { ComponentType } from 'react';

export type RouteKey = 'home' | 'map' | 'guide' | 'calendar' | 'tracking' | 'profile' | 'report' | 'admin' | 'legal';

export interface NavItem {
  key: RouteKey;
  hash: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** Solo pestañas principales de la barra inferior móvil. */
  primary: boolean;
}

/** Navegación principal de la app. */
export const NAV_ITEMS: NavItem[] = [
  { key: 'home', hash: '#/', label: 'Inicio', shortLabel: 'Inicio', icon: House, primary: true },
  { key: 'map', hash: '#/mapa', label: 'Mapa', shortLabel: 'Mapa', icon: Map, primary: true },
  { key: 'guide', hash: '#/guia', label: 'Guía', shortLabel: 'Guía', icon: Recycle, primary: true },
  {
    key: 'calendar',
    hash: '#/calendario',
    label: 'Calendario',
    shortLabel: 'Agenda',
    icon: CalendarCheck2,
    primary: true,
  },
  {
    key: 'tracking',
    hash: '#/seguimiento',
    label: 'Seguimiento',
    shortLabel: 'Impacto',
    icon: TrendingUp,
    primary: true,
  },
  { key: 'profile', hash: '#/perfil', label: 'Mi perfil', shortLabel: 'Perfil', icon: UserRound, primary: false },
  {
    key: 'report',
    hash: '#/reportar',
    label: 'Reportar',
    shortLabel: 'Reportar',
    icon: Recycle,
    primary: false,
  },
  {
    key: 'admin',
    hash: '#/admin',
    label: 'Administración',
    shortLabel: 'Admin',
    icon: ShieldCheck,
    primary: false,
  },
  { key: 'legal', hash: '#/legalizacion', label: 'Información legal', shortLabel: 'Legal', icon: ShieldCheck, primary: false },
];

export const NAV_ITEM_MAP: Record<RouteKey, NavItem> = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.key, item]),
) as Record<RouteKey, NavItem>;

/** Secciones lazily loaded → componente por ruta. */
export const ROUTE_COMPONENTS: Record<RouteKey, () => Promise<{ default: ComponentType }>> = {
  home: () => import('@/components/home/HomeSection'),
  map: () => import('@/components/map/MapSection'),
  guide: () => import('@/components/guide/GuideSection'),
  calendar: () => import('@/components/calendar/CalendarSection'),
  tracking: () => import('@/components/tracking/TrackingSection'),
  profile: () => import('@/components/profile/ProfileSection'),
  report: () => import('@/components/report/ReportSection'),
  admin: () => import('@/components/admin/AdminSection'),
  legal: () => import('@/components/legal/LegalizationSection'),
};

/** Parsea un hash tipo "#/mapa?material=papel" → { route, params }. */
export function parseHash(hash: string): { route: RouteKey; params: URLSearchParams } {
  const clean = hash.replace(/^#\/?/, '');
  const [path, query] = clean.split('?');
  const params = new URLSearchParams(query ?? '');

  if (path === 'legalizacion' || path.startsWith('legalizacion/')) {
    const documentSlug = path.split('/')[1];
    if (documentSlug) params.set('legalDoc', documentSlug);
    return { route: 'legal', params };
  }

  switch (path) {
    case 'mapa':
      return { route: 'map', params };
    case 'guia':
      return { route: 'guide', params };
    case 'calendario':
      return { route: 'calendar', params };
    case 'seguimiento':
      return { route: 'tracking', params };
    case 'perfil':
      return { route: 'profile', params };
    case 'reportar':
      return { route: 'report', params };
    case 'admin':
      return { route: 'admin', params };
    default:
      return { route: 'home', params };
  }
}

/** Navega programáticamente (hash). */
export function navigate(hash: string): void {
  if (window.location.hash === hash) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }
  window.location.hash = hash;
}
