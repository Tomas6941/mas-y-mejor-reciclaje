# Diseño del backend de EcoPunto

**Fecha:** 2026-11-11  
**Estado:** Diseño aprobado e implementación inicial en curso.

## Objetivo

Reemplazar gradualmente la persistencia local de datos de negocio de EcoPunto por una API propia con PostgreSQL en Neon, incorporando cuentas de usuario, sin perder tiempo en una migración de los datos actuales de `localStorage`.

## Contexto del sistema

El repositorio contiene una aplicación React 18 + TypeScript + Vite. Sus funcionalidades actuales incluyen mapa y puntos de reciclaje de Córdoba, reportes de estado de puntos, guía y cuestionario, calendario por barrio, seguimiento de kilos reciclados y preferencias de interfaz. Zustand mantiene el estado y `localStorage` conserva parte de los datos. No hay backend ni flujo de cuentas hoy.

Córdoba será la única ciudad inicial. Puntos y horarios existentes son datos demostrativos y deberán ser revisados antes de tratarlos como información oficial.

## Arquitectura

- Mantener React/Vite y añadir un servicio HTTP independiente en TypeScript con Fastify.
- Persistir en PostgreSQL alojado en Neon; usar Drizzle ORM, migraciones versionadas y conexión pooled para el servicio.
- El navegador se comunica solo con la API. Las credenciales de Neon y del proveedor de correo permanecen en el servidor.
- Validar entradas/salidas con esquemas, documentar endpoints con OpenAPI, usar errores JSON consistentes y paginar listados que puedan crecer.
- Mantener módulos de API por responsabilidad: autenticación, puntos/materiales, barrios/calendarios, reportes, seguimiento y cuestionarios.
- El hosting de API queda para una decisión de despliegue posterior; el servicio será portable y ejecutable en Node.js.

## Identidad, autorización y privacidad

- Registro e inicio de sesión mediante email y contraseña; almacenar solo hashes de contraseña con algoritmo apropiado para credenciales.
- Incluir verificación de email, cierre de sesión, recuperación y restablecimiento de contraseña.
- Gestionar la sesión con cookie `HttpOnly`, `Secure` en producción, política `SameSite` adecuada, protección CSRF y expiración/revocación.
- Limitar intentos de autenticación, solicitudes de recuperación y creación de reportes; no revelar si un email existe en flujos de recuperación.
- Roles iniciales: `user` y `admin`. Autorizar en el servidor; nunca confiar en el rol enviado por el cliente.
- Cada usuario solo puede consultar, modificar y borrar su seguimiento, intentos y preferencias. Los datos públicos no incluyen email ni identificadores personales.
- El mapa, guía y calendarios se consultan sin cuenta. Crear reportes y guardar datos personales requiere sesión.

## Persistencia propuesta

- `users`: email normalizado y único, hash de contraseña, estado de verificación, rol, timestamps y estado de cuenta.
- `user_profiles`: nombre visible opcional y datos mínimos del perfil.
- `materials`: catálogo estable de claves usadas por el frontend.
- `points`: nombre, dirección, coordenadas, tipo, estado oficial, horarios/observaciones y timestamps; inicialmente solo Córdoba.
- `point_materials`: relación muchos-a-muchos entre puntos y materiales.
- `neighborhoods`, `collection_schedules` y `schedule_materials` (si aplica): barrios y horarios de recolección configurables.
- `reports`: punto, autor, tipo, comentario acotado, estado de moderación y timestamps; estados `pending`, `approved`, `rejected`.
- `tracking_entries`: usuario, material, kilos con precisión decimal y fecha local del registro.
- `quiz_attempts`: usuario, puntaje, total posible y fecha; el cliente no fija récords fuera de los intentos guardados.
- `user_preferences`: barrio elegido y preferencias no visuales que requieran sincronización.
- Tablas de tokens de un solo uso para verificación y recuperación, guardando hashes de los tokens y su vencimiento.
- Claves foráneas, restricciones CHECK, índices para email, coordenadas/consultas del mapa, fechas por usuario, reportes por punto/fecha y búsquedas de calendarios.

El inventario final de columnas, índices y restricciones se definirá en las tareas del plan junto con las consultas reales del frontend. Tema claro/oscuro permanece local y no necesita una tabla.

## Reportes y administración

Un reporte registra una observación de la comunidad y no cambia automáticamente el estado oficial del punto. Usuarios admin pueden revisar, aprobar o rechazar reportes y mantener puntos/calendarios por endpoints protegidos. Se incluirá auditoría mínima de quién y cuándo realizó una decisión de moderación. El panel de administración no forma parte de esta primera implementación; la moderación se podrá operar con endpoints protegidos/documentados o por un mecanismo administrativo mínimo definido antes de desplegar.

## Correo transaccional

- Usar Nodemailer como cliente SMTP, inicialmente con una cuenta Google dedicada y Contraseña de Aplicación.
- Activar 2-Step Verification en la cuenta; guardar el secreto solo en variables de entorno/secret manager, nunca en git ni en el frontend.
- Enviar verificación de email y recuperación usando plantillas de texto/HTML simples, tokens aleatorios de un solo uso, hash del token en DB y vencimiento.
- Mantener `EmailProvider` como frontera para cambiar más adelante a un proveedor transaccional. Registrar fallas sin incluir tokens ni contenido sensible.
- La cuenta Gmail tiene límites y Google puede revocar la contraseña de aplicación; observar entregas/fallos y cambiar a un proveedor transaccional si volumen o confiabilidad lo requieren.

## API inicial

Rutas versionadas bajo `/api/v1`:

- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.
- `POST /auth/verify-email`, `POST /auth/resend-verification`, `POST /auth/forgot-password`, `POST /auth/reset-password`.
- `GET /points`, `GET /points/:id`; filtros por material, tipo y estado; orden/paginación acotados.
- `GET /neighborhoods`, `GET /neighborhoods/:id/schedules`.
- `GET /reports` para reportes aprobados; `POST /reports` autenticado; endpoints admin de revisión.
- `GET /me/tracking`, `POST /me/tracking`, `DELETE /me/tracking/:id`, `DELETE /me/tracking`.
- `GET /me/quiz-attempts`, `POST /me/quiz-attempts`.
- `GET /me/preferences`, `PATCH /me/preferences`.
- Endpoints admin versionados para CRUD de puntos y calendarios.

Las respuestas no deben serializar hash/token. Los endpoints de escritura validan permisos, tamaño, rangos, enums, fechas y relaciones existentes; las operaciones compuestas usan transacciones.

## Integración del frontend

Reemplazar Zustand/localStorage de negocio gradualmente por clientes tipados de API, manteniendo los stores como estado de vista si conviene. Agregar manejo común de sesión, carga, error y expiración. Al cerrar sesión, limpiar inmediatamente el estado privado en memoria. El tema sigue local. No se importarán datos anteriores de `localStorage`.

Orden de adopción: autenticación/sesión; lectura pública de puntos y calendarios; seguimiento y cuestionario por usuario; creación/listado de reportes; moderación y mantenimiento administrativo.

## Entornos y operación

- Entornos local, test y producción con configuración separada y secretos fuera del repositorio.
- Migraciones aplicadas como paso controlado de despliegue; datos de catálogo iniciales versionados y repetibles.
- Health/readiness checks, logs estructurados sin datos sensibles y manejo global de excepciones.
- Usar respaldos de Neon y documentar una restauración comprobable antes de producción.
- CI: lint, typecheck, pruebas unitarias, integración contra PostgreSQL de test y build del frontend/API.
- Separar `DATABASE_URL` de conexión pooled para runtime de la conexión directa si la herramienta de migración la requiere.

## Pruebas y criterios de aceptación

- Pruebas unitarias de validación, reglas del dominio, autorización y construcción de errores.
- Pruebas de integración de registro, verificación, login/logout, recuperación, CRUD personal, reportes/moderación y restricciones de DB.
- Comprobar aislamiento entre dos usuarios y acceso anónimo solo a recursos públicos.
- Ningún secreto presente en bundles del frontend, logs o repositorio.
- Los flujos principales de frontend leen/escriben backend tras autenticación; al cambiar de usuario no aparecen datos privados anteriores.
- Se puede inicializar una base limpia con migraciones y datos iniciales y se puede volver a desplegar migraciones sin duplicar catálogos.

## Fuera de alcance inicial

- Soporte multi-ciudad; Córdoba es el único ámbito.
- Migración de los datos actuales de `localStorage`.
- Login social, aplicación móvil, notificaciones push y recompensas complejas.
- Panel de administración completo.
- Integración con sistemas municipales; los puntos y calendarios semilla son demostrativos hasta su verificación.
- Alojamiento y dominio definitivos de la API.
