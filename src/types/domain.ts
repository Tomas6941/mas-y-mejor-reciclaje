/**
 * Tipos de dominio de EcoPunto.
 *
 * Reflejan exactamente la estructura de datos que persiste en localStorage
 * (claves ecopunto.*.v1), para no romper la compatibilidad con datos viejos.
 */

export type MaterialKey =
  | 'papel'
  | 'plastico'
  | 'vidrio'
  | 'metal'
  | 'organico'
  | 'electronicos'
  | 'pilas';

/** Claves de categorías de la guía (materiales + residuos comunes). */
export type WasteCategoryKey = MaterialKey | 'general';

export type PointStatus = 'available' | 'near-full' | 'full' | 'damaged';

export type ReportCategory = 'container_status' | 'suggestion';
export type ReportType = 'full' | 'damaged' | 'available' | 'move_point' | 'add_point' | 'remove_point';

export type PointType = 'Punto verde' | 'Contenedor';

export interface Material {
  key: MaterialKey;
  label: string;
  short: string;
  /** Color del material en modo claro (hex, para gráficos y marcadores). */
  color: string;
  /** Color del material en modo oscuro (hex, para gráficos y marcadores). */
  colorDark: string;
}

export interface RecyclePoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: PointType;
  materials: MaterialKey[];
  status: PointStatus;
  hours: string;
}

export interface Report {
  id: string;
  pointId: string | null;
  pointName: string | null;
  category: ReportCategory;
  type: ReportType;
  comment: string;
  /** ISO 8601, p. ej. 2026-11-11T14:30:00.000Z */
  timestamp: string;
}

export interface TrackingRecord {
  id: string;
  material: MaterialKey;
  kg: number;
  /** Fecha local en formato YYYY-MM-DD */
  date: string;
}

export interface WasteCategory {
  key: WasteCategoryKey;
  label: string;
  shortLabel: string;
  container: string;
  description: string;
  yes: string[];
  no: string[];
  tip: string;
  optionLabel: string;
}

export interface WasteItem {
  name: string;
  category: WasteCategoryKey;
  keywords: string[];
  tip?: string;
}

export interface QuizQuestion {
  question: string;
  category: WasteCategoryKey;
  explanation: string;
}

/** Resultado persistido del mini quiz. */
export interface QuizResultState {
  best: number;
  attempts: number;
  lastScore: number | null;
  lastDate: string | null;
}

export type ScheduleIcon = 'recycle' | 'leaf' | 'trash';

export interface Schedule {
  key: string;
  name: string;
  icon: ScheduleIcon;
  color: string;
  description: string;
  /** Días de semana de JavaScript: 0 = domingo ... 6 = sábado. */
  days: number[];
  time: string;
  startTime: string;
}

export type NeighborhoodSchedules = Record<string, Schedule[]>;

export interface Reminder {
  enabled: boolean;
  neighborhood: string | null;
  /** ISO 8601 o null */
  createdAt: string | null;
}

export type AchievementMetricKey =
  | 'total'
  | 'plastico'
  | 'count'
  | 'distinctMaterials'
  | 'maxStreak';

export type AchievementIcon = 'sprout' | 'cup' | 'calendar' | 'palette' | 'flame' | 'trophy';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  metric: AchievementMetricKey;
  target: number;
  unit: 'kg' | 'registros' | 'materiales' | 'dias';
}

export interface MaterialTotal {
  material: Material;
  kg: number;
}

export interface TrackingStats {
  total: number;
  count: number;
  byMaterial: Record<MaterialKey, number>;
  populatedMaterials: Material[];
  topMaterial: Material | null;
  distinctMaterials: number;
  currentStreak: number;
  maxStreak: number;
  monthlyTotal: number;
}

export interface AchievementView {
  definition: AchievementDefinition;
  value: number;
  target: number;
  unlocked: boolean;
  /** Progreso 0-100 */
  progress: number;
  progressText: string;
}

export interface NextCollection {
  schedule: Schedule;
  date: Date;
  offset: number;
  startMinutes: number;
}

export type Theme = 'light' | 'dark';
