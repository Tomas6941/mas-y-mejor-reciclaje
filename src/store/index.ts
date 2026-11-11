/**
 * Bootstrap de stores: importa todos para que sus inicializadores corran
 * al arrancar la app (siembra de datos y validación de localStorage),
 * igual que el sitio original — sin importar qué sección se visite primero.
 */

import './themeStore';
import './pointsStore';
import './reportsStore';
import './trackingStore';
import './calendarStore';
import './quizStore';

export { useThemeStore } from './themeStore';
export { usePointsStore, getPointById } from './pointsStore';
export { useReportsStore, getSortedReports } from './reportsStore';
export { useTrackingStore } from './trackingStore';
export { useCalendarStore, getSchedulesFor } from './calendarStore';
export { useQuizStore } from './quizStore';
