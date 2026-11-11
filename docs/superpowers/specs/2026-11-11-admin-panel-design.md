# Panel de administración de EcoPunto

**Fecha:** 2026-11-11  
**Estado:** Diseño aprobado en conversación; especificación pendiente de revisión.

## Objetivo

Incorporar un área de administración para que usuarios con rol `admin` puedan moderar reportes comunitarios y mantener los puntos de reciclaje y horarios de Córdoba, desde la misma aplicación web.

## Dirección visual

Tomar como referencia las dos publicaciones compartidas de `code.xr`: dashboard oscuro con superficies de vidrio translúcidas, desenfoque moderado, acentos azules luminosos, gráficos y tarjetas premium. Adaptar la estética al sistema de diseño de EcoPunto, mantener contraste legible y responder bien en escritorio y móvil.

## Alcance

La nueva ruta cliente será `#/admin`. La navegación hacia ella solo se muestra a usuarios cuyo usuario autenticado tiene `role === 'admin'`. La ruta también verifica el estado de sesión y muestra estados claros para carga, sesión ausente, cuenta sin permisos, errores y datos vacíos. La API mantiene su propia autorización de admin en todas las operaciones; ocultar la navegación nunca sustituye esa protección.

El dashboard tendrá cuatro secciones:

1. **Resumen:** indicadores derivados de datos disponibles —reportes pendientes, puntos activos y barrios activos— y accesos a las tareas administrativas. No se agregan endpoints analíticos nuevos.
2. **Reportes:** bandeja por estado, con `pending` como vista inicial, detalle del punto y comentario, y acciones para aprobar o rechazar. Las acciones actualizan el estado del reporte y la bandeja después de una respuesta exitosa. Aprobar un reporte no cambia el estado oficial del punto.
3. **Puntos:** tabla/lista adaptable con búsqueda local sobre el catálogo cargado, formulario de alta y edición, y archivo lógico con confirmación. Se usan los endpoints existentes `POST /admin/points`, `PATCH /admin/points/:id` y `DELETE /admin/points/:id`. No habrá restauración de puntos archivados en esta entrega.
4. **Barrios y horarios:** selección de barrio, edición del nombre y de horarios (nombre, descripción, tipo de icono, color, días y rango horario), y guardado mediante `PUT /admin/neighborhoods/:slug/schedules`. El guardado reemplaza la colección de horarios del barrio dentro de una transacción; la UI debe dejarlo explícito antes de guardar. Se podrá archivar un barrio con confirmación mediante `DELETE /admin/neighborhoods/:slug`.
5. **Administradores:** listar administradores activos y permitir promover una cuenta existente a admin por correo, o revocar el rol admin a otra cuenta. Solo se promocionarán cuentas activas con email verificado; no se crearán cuentas desde el panel ni se mostrará un directorio de usuarios comunes. El servidor impedirá revocar el último rol admin activo y registrará cada cambio en auditoría.

## Datos y API

- Reutilizar `apiRequest`, que incluye credenciales de sesión y desempaqueta el envelope `{ data }`.
- Leer reportes de administración desde `GET /admin/reports?status=<pending|approved|rejected>&limit=50`.
- Moderar reportes con `PATCH /admin/reports/:id` y `{ "decision": "approved" | "rejected" }`.
- Cargar puntos desde `GET /points?limit=100`; este endpoint devuelve puntos activos. Las altas, cambios y archivos se realizan por los endpoints administrativos existentes.
- Cargar barrios desde `GET /neighborhoods` y horarios desde `GET /neighborhoods/:slug/schedules`.
- Agregar endpoints admin protegidos para listar admins, promover una cuenta verificada y revocar un rol; cada cambio guardará un evento en `audit_log`. La promoción aceptará email exacto, sin endpoint de búsqueda/directorio de usuarios.
- Traducir explícitamente los valores de formulario a los enums y formas esperados por API; los tipos públicos de punto (`Punto verde`, `Contenedor`) se transforman a `green_point`, `container` al guardar.
- El formulario horario convierte el rango legible retornado por la API a `startTime`/`endTime` para el esquema de escritura.
- No guardar datos administrativos en `localStorage` ni modificar el esquema de base de datos.

## Experiencia y manejo de errores

- Las operaciones mutantes no serán optimistas: bloquear la acción afectada, esperar la respuesta y actualizar el estado solo tras éxito.
- Mostrar confirmación antes de archivar puntos o barrios y antes de reemplazar los horarios existentes.
- Informar errores en español sin mostrar trazas, datos internos ni detalles de la sesión.
- Mantener controles navegables por teclado, etiquetas accesibles, estados de foco visibles y acciones con texto además de iconos.
- En móvil, reemplazar la navegación lateral por selector/drawer compacto y convertir tablas en tarjetas legibles.

## Componentes previstos

- `src/components/admin/AdminSection.tsx`: composición del dashboard y guardia de rol en cliente.
- Componentes enfocados por área para resumen, reportes, puntos y horarios, ubicados en `src/components/admin/`.
- Una sección y componente para listar/agregar/revocar admins, con un cuadro de confirmación que nombre la cuenta afectada.
- Schemas de formulario locales tipados, separados de las reglas canónicas del servidor.
- Actualizar el enrutado hash, `AppShell` y el punto de entrada de navegación del usuario admin.

## Fuera de alcance

- Un directorio o buscador de usuarios comunes y una pantalla de auditoría visible.
- Restaurar puntos o barrios archivados.
- Cambiar el estado de un punto automáticamente al aprobar reportes.
- Agregar gráficos con librerías o endpoints nuevos.
- Modificar correo, autenticación, base de datos o APIs.

## Criterios de aceptación

- Usuario no admin no ve el acceso al panel; si navega a `#/admin`, ve una pantalla de acceso denegado sin datos administrativos.
- Admin puede cargar, filtrar y moderar reportes y ve el resultado actualizado sin recargar la página.
- Admin puede crear, editar y archivar puntos; los cambios aparecen en la vista pública después de la respuesta exitosa.
- Admin puede modificar el nombre y los horarios de un barrio y archivar el barrio, con confirmación antes de las operaciones destructivas o reemplazos.
- Admin puede listar admins, promover una cuenta activa con correo verificado y revocar el rol admin, sin posibilidad de quitar el último rol activo.
- Errores, carga y listas vacías tienen estados visibles en español.
- El panel conserva el estilo glassmorphism azul de referencia y funciona en desktop y móvil.
