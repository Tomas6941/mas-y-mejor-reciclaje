import { useThemeStore } from '@/store/themeStore';

/** ¿Está activo el tema oscuro? (reactivo al toggle) */
export function useIsDarkTheme(): boolean {
  return useThemeStore((state) => state.theme) === 'dark';
}
