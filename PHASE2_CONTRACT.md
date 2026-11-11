# PHASE2_CONTRACT.md — Contrato para agentes de Fase 2

Este documento es la **fuente de verdad** para todos los agentes de sección. Leelo entero
antes de escribir una línea de código. Si algo contradice al resumen del coordinador, gana
este archivo.

---

## 0. Tu sección

Trabajás en tu propio worktree (rama `feat/<sección>`) y **sólo podés crear/editar
archivos dentro de tu carpeta**:

| Agente | Rama | Carpeta exclusiva |
| --- | --- | --- |
| home | `feat/home` | `src/components/home/**` |
| map | `feat/map` | `src/components/map/**` |
| report | `feat/report` | `src/components/report/**` |
| guide | `feat/guide` | `src/components/guide/**` |
| calendar | `feat/calendar` | `src/components/calendar/**` |
| tracking | `feat/tracking` | `src/components/tracking/**` |
| footer | `feat/footer` | `src/components/layout/Footer.tsx` (sólo ese archivo) |

**Prohibido editar** (son del contrato congelado): `src/types/**`, `src/data/**`,
`src/store/**`, `src/lib/**`, `src/hooks/**`, `src/components/ui/**`, `src/App.tsx`,
`src/main.tsx`, `src/index.css`, `tailwind.config.ts`, `package.json`, `tsconfig.json`,
`eslint.config.js`, `vite.config.ts`, `index.html`, y los placeholders de otras secciones.

Si necesitás un cambio en un archivo compartido **no lo toques**: pedilo al coordinador
en tu reporte final con el detalle exacto (archivo, línea, cambio propuesto).

Podés crear archivos nuevos dentro de tu carpeta, incluyendo `*.css` propios (importalos
sólo desde tus componentes; no toques `src/index.css`).

---

## 1. Cómo ejecutar

```bash
npm install          # primera vez (usa el package.json congelado)
npm run dev          # servidor de desarrollo
npm run lint         # eslint (debe pasar sin errores)
npm run typecheck    # tsc --noEmit (debe pasar sin errores)
npm run build        # tsc --noEmit && vite build (debe pasar sin warnings)
```

Antes de reportar "terminado", ejecutá `npm run lint`, `npm run typecheck` y
`npm run build` y adjuntá la salida (o decí que pasaron limpios).

---

## 2. Stack y estilo de código

- React 18 + TypeScript strict. **Nada de `any` implícito.**
- Tailwind con los tokens del tema (§3). **Clases dinámicas**: Tailwind escanea texto
  literal; si construís clases por interpolación (`bg-material-${x}`) Tailwind NO las
  genera. Usá mapas de clases literales (ver `src/components/ui/material-badge.tsx`).
- Motion (`framer-motion`) para animaciones: **sólo transform/opacity**, duración corta.
  Respetá `useReducedMotion()` para lo importante y dejá el guard global de CSS para
  microdetalles.
- Lucide React para íconos (`import { Map } from 'lucide-react'`). Nada de emojis en la UI.
- Componentes **< 200 líneas**; extraé subcomponentes en archivos propios de tu carpeta.
- Nombres de código en inglés, textos de UI en **español rioplatense (voseo)**:
  "Registrá", "Elegí", "¿Dónde va…?".
- **Prohibido `dangerouslySetInnerHTML`.**
- Comentarios de código en español, explicando el "por qué".

---

## 3. Design tokens disponibles

Todo vía clases Tailwind. Los valores viven en `src/index.css` (tripletas RGB).

- **Base**: `background`, `background-soft`, `surface`, `surface-soft`, `foreground`,
  `muted` (texto secundario), `border`, `border-strong`.
- **Primario (verde)**: `primary`, `primary-hover`, `primary-bright` (solo gráficos),
  `primary-soft`, `primary-foreground` (texto sobre verde).
- **Acento (amarillo, CTA)**: `accent`, `accent-hover`, `accent-soft`,
  `accent-foreground` (texto oscuro sobre amarillo).
- **Peligro (coral)**: `danger`, `danger-hover`, `danger-soft`, `danger-foreground`.
- **Materiales** (cada uno con `-soft` fondo y `-strong` texto AA):
  `material-papel|plastico|vidrio|metal|organico|electronicos|pilas|general`.
- **Estados de punto**: `status-available|near-full|full|damaged` (+ `-soft`/`-strong`).
- **Tipografía**: `font-display` (Bricolage Grotesque) para títulos;
  `font-sans` (Inter) para texto. Pesos: display usa `font-bold`/`font-semibold`.
- **Radios**: `rounded-card` (20px), `rounded-bento` (24px), `rounded-hero` (28px),
  `rounded-full` para chips/botones.
- **Sombras**: `shadow-soft`, `shadow-lift`, `shadow-glow` (amarillo, CTA).
- Modo oscuro automático vía `data-theme="dark"` en `<html>`; no uses `dark:` salvo
  para excepciones puntuales que documentes.

Efectos compartidos (úsalo si querés el efecto "firma" del sistema):
`<GlareCard>` (`src/components/ui/glare-card.tsx`) — brillo radial que sigue el mouse.
Fondo aurora: `<AuroraBackground>` (úsalos con moderación: hero del home únicamente).

---

## 4. API compartida (lo que podés importar)

### 4.1 Datos (`src/data`)

- `materials.ts`: `MATERIALS` (con `.color`/`.colorDark` hex), `MATERIAL_KEYS`,
  `MATERIAL_MAP`, `STATUS` (labels), `REPORT_TO_STATUS`, `REPORT_TYPES`,
  `isPointType(value)`.
- `points.ts`: `SEED_POINTS` (14 puntos; usá el store, no esto, para estado).
- `categories.ts`: `CATEGORIES` (`key, label, shortLabel, container, description,
  yes[], no[], tip, optionLabel`), `CATEGORY_ORDER`, `ALL_CATEGORY_KEYS`.
- `wasteItems.ts`: `WASTE_ITEMS` (55 items con keywords/tips).
- `quizBank.ts`: `QUIZ_BANK` (12 preguntas).
- `neighborhoods.ts`: `NEIGHBORHOODS` (mapa barrio → schedules), `DEFAULT_NEIGHBORHOOD`,
  `NEIGHBORHOOD_NAMES` (orden alfabético local).
- `achievements.ts`: `ACHIEVEMENT_DEFINITIONS`.
- `constants.ts`: `MONTHLY_GOAL`, `NEIGHBORHOOD_COUNT`, `MAP_CENTER`, `MAP_ZOOM`,
  `REPORT_COMMENT_MAX`, `TRACKING_KG_MAX`.

### 4.2 Lógica (`src/lib`)

- `wasteSearch.ts`: `getWasteMatches(query)` (scoring original), `searchTokens`,
  `normalizeText`.
- `trackingStats.ts`: `getTrackingStats(records)`, `getMaterialTotals`,
  `getCurrentStreak`, `getMaxStreak`, `getMaterialTotalList(stats)`.
- `achievements.ts`: `getAchievementData(stats)`, `getNewlyUnlockedTitles(prev, next)`.
- `collection.ts`: `getNextCollection(schedules)`, `getScheduleWindow(schedule)`.
- `format.ts`: `formatKg`, `formatInteger`, `formatLongDate`, `formatShortDate`,
  `formatDateTime`, `timeAgo`, `joinDays`, `formatWeekRange`,
  `formatCompactRelativeDate`, `formatNextCollectionDate`, `shortDayName`.
- `dates.ts`: `startOfDay`, `addDays`, `dateToISO`, `isoToDate`, `todayISO`,
  `daysBetween`, `getWeekStart`, `DAY_NAMES`, `SHORT_DAY_NAMES`, `WEEK_ORDER`
  (semana lunes→domingo `[1..6,0]`).
- `csv.ts`: `recordsToCsv`, `downloadRecordsCsv` (BOM + CRLF + coma decimal).
- `schemas.ts`: `reportSchema`, `trackingSchema` (kg con coma decimal ≤ 1000, fecha no
  futura), `contactSchema`. Mensajes de error YA en rioplatense — usálos tal cual.
- `motion.ts`: `EASE`, `SPRING.gentle|snappy|bouncy`, `fadeUp`, `fadeIn`, `scaleIn`,
  `staggerContainer`.
- `routes.ts`: `NAV_ITEMS`, `NAV_ITEM_MAP`, `parseHash`, `navigate(hash)`.
- `lenis.ts`: `scrollToTop`, `stopSmoothScroll`, `resumeSmoothScroll`,
  `prefersReducedMotion`. (La app ya inicializa Lenis.)
- `utils.ts`: `cn`, `clamp`, `capitalize`, `pluralize`, `makeId`, `shuffleArray`.
- `storage.ts`: en general **no lo uses directo** para estado de negocio — usá los
  stores (§4.3). `isStorageAvailable()` sí es útil.

### 4.3 Stores (`src/store`) — el único canal de estado compartido

- `usePointsStore`: `points` (`RecyclePoint[]`), `setPointStatus(id, status)`.
  + helper `getPointById(points, id)`.
- `useReportsStore`: `reports` (`Report[]` ya ordenados), `addReport({ point, type,
  comment })` (actualiza el punto y persiste ambas claves — no llames a
  `setPointStatus` aparte).
- `useTrackingStore`: `records` (`TrackingRecord[]`), `addRecord({ material, kg, date })`,
  `clearAll()`.
- `useCalendarStore`: `neighborhood` (string), `reminder` (`{ enabled, neighborhood,
  createdAt }`), `setNeighborhood(name)`, `setReminder(enabled)`.
  + helper `getSchedulesFor(neighborhood)`.
- `useQuizStore`: `result` (`{ best, attempts, lastScore, lastDate }`),
  `recordAttempt(score)` → devuelve `isNewBest`.
- `useThemeStore`: `theme`, `toggleTheme` (el toggle visual ya existe:
  `ThemeToggle`).

**Nunca escribas localStorage directamente** (claves/formatos congelados). Todo pasa
por los stores.

### 4.4 Hooks (`src/hooks`)

`useHashRoute()` → `{ route, params, hash }`; `useIsDarkTheme()`; `useMediaQuery(q)`;
`useDebouncedValue(v, ms)`; `useCountUp(target, { duration, startOnView })` →
`{ ref, value }`.

### 4.5 UI (`src/components/ui`)

`Button` (variantes `primary|accent|outline|ghost|soft|danger`; `asChild` para links),
`Card*`, `Input`, `Textarea`, `Label`, `Select*` (Radix), `Dialog*`, `AlertDialog*`
(usalo para "borrar todo"), `Sheet*` (bottom sheet mobile), `Tooltip*`, `Tabs*`,
`RadioGroup*`, `Badge`, `Skeleton`, `Toaster` (ya montado; usá `toast` de sonner),
`AuroraBackground`, `GlareCard`, `TextReveal`, `SectionHeader`, `EmptyState`,
`MaterialBadge`, `StatusPill`, `WastePaletteProvider` + `useWastePalette()` (paleta
Ctrl+K ya montada globalmente).

---

## 5. Contratos entre secciones

La navegación es por hash (sin react-router). Para cruzar secciones, generá el hash y
dejá que la sección destino lea sus params:

| Origen → Destino | Hash | Params que lee el destino |
| --- | --- | --- |
| cualquier → guía (residuo) | `#/guia?q=<nombre>` | `q` (pre-carga el resultado del residuo) |
| mapa → reportar | `#/reportar?point=<pointId>` | `point` (pre-selecciona el punto) |
| guía → mapa | `#/mapa?material=<materialKey>` | `material` (filtra el mapa) |
| home → todas | `#/`, `#/mapa`, `#/guia`, `#/calendario`, `#/seguimiento`, `#/reportar` | — |

Ejemplo lectura: `const { params } = useHashRoute(); const pointId = params.get('point');`

Para abrir la paleta de búsqueda global: `const { openPalette } = useWastePalette();
openPalette('pila')`.

---

## 6. Accesibilidad (no negociable)

- Contraste AA en texto y controles (los tokens ya lo garantizan; no inventes colores).
- Jerarquía: cada sección **arranca con `<h1>`** (único por vista); subsecciones h2/h3.
- `aria-current="page"` en navegación activa; `aria-label` en íconos-only.
- Targets táctiles ≥ 44px.
- Focus visible (ya global); no lo anules con `outline-none` sin alternativa.
- Estados vacíos y de carga anunciados (`aria-busy`, `role="status"`,
  `aria-live="polite"` para resultados dinámicos).
- Formularios: label visible + error asociado (`aria-describedby` + `aria-invalid`).
- Diálogos: título/descripción accesibles (Radix lo exige); devolvé el foco
  (Radix Dialog/Sheet ya lo hacen).
- Todo texto de UI en es-AR voseo. `lang="es"` ya está en `index.html`.

## 7. Performance

- La app ya carga tu sección con `React.lazy` — no agregues más code-splitting salvo
  que tu sección tenga algo pesado propio ( Leaflet/Recharts: los stores y lib ya son
  tree-shakeables; importá Leaflet/Recharts **dentro de tu carpeta** con dynamic
  `import()` si el peso es grande).
- Imágenes: SVG inline simples; nada de bitmaps pesados.
- Animaciones: `transform`/`opacity` solamente (evitá animar width/height/top/left).
- Testeá en viewport 360px (mobile-first) antes de reportar.

## 8. Reporte final

Cuando termines, tu reporte al coordinador debe incluir:

1. Estado de `lint` / `typecheck` / `build` (limpio o con detalles).
2. Lista de archivos creados/modificados (todos dentro de tu carpeta).
3. Pedidos de cambios en archivos compartidos (si los hay), con file:line.
4. Qué portaste del original y qué decisiones de diseño tomaste.
5. Qué te faltó o qué dejaste pendiente (se honesto).

El coordinador (yo) hace la integración en `main`, resuelve conflictos y redistribuye
los fixes de los reviewers de Fase 4.
