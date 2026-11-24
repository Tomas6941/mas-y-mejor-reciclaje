import type { Material, MaterialKey, PointStatus, PointType, ReportType } from '@/types/domain';

export const MATERIALS: Material[] = [
  {
    key: 'papel',
    label: 'Papel y cartón',
    short: 'Papel',
    color: '#2563EB',
    colorDark: '#7CA9F9',
  },
  {
    key: 'plastico',
    label: 'Plástico',
    short: 'Plástico',
    color: '#C89100',
    colorDark: '#F0C24E',
  },
  {
    key: 'vidrio',
    label: 'Vidrio',
    short: 'Vidrio',
    color: '#0E8F73',
    colorDark: '#3FD3AE',
  },
  {
    key: 'metal',
    label: 'Metal',
    short: 'Metal',
    color: '#5B6B72',
    colorDark: '#A3B4BC',
  },
  {
    key: 'organico',
    label: 'Orgánico',
    short: 'Orgánico',
    color: '#8C5A2B',
    colorDark: '#D39A5B',
  },
  {
    key: 'electronicos',
    label: 'Electrónicos',
    short: 'Electrónicos',
    color: '#7048D8',
    colorDark: '#B49BF5',
  },
  {
    key: 'pilas',
    label: 'Pilas y baterías',
    short: 'Pilas',
    color: '#C03526',
    colorDark: '#F58376',
  },
];

export const MATERIAL_KEYS = [
  'papel',
  'plastico',
  'vidrio',
  'metal',
  'organico',
  'electronicos',
  'pilas',
] as const satisfies readonly MaterialKey[];

export const MATERIAL_MAP: Record<MaterialKey, Material> = Object.fromEntries(
  MATERIALS.map((material) => [material.key, material]),
) as Record<MaterialKey, Material>;

export const STATUS: Record<PointStatus, { label: string; short: string }> = {
  available: { label: 'Disponible', short: 'Disponible' },
  'near-full': { label: 'Casi lleno', short: 'Casi lleno' },
  full: { label: 'Lleno', short: 'Lleno' },
  damaged: { label: 'En mal estado', short: 'Dañado' },
};

export const REPORT_TO_STATUS: Record<Extract<ReportType, 'full' | 'damaged' | 'available'>, PointStatus> = {
  full: 'full',
  damaged: 'damaged',
  available: 'available',
};

export const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  { value: 'full', label: 'Está lleno', description: 'Ya no entra más material' },
  { value: 'damaged', label: 'Está dañado', description: 'Roto, sucio o sin tapa' },
  { value: 'available', label: 'Está disponible', description: 'Tiene espacio para reciclar' },
];

export function isPointType(value: unknown): value is PointType {
  return value === 'Punto verde' || value === 'Contenedor';
}
