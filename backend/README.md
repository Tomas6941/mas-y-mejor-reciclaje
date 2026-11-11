# EcoPunto API

Servicio Node.js independiente del frontend Vite. Requiere Node.js 24 o superior.

## Desarrollo local

1. Copiá `.env.example` a `.env`, generá `SESSION_SECRET` con `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"` y completá `DATABASE_URL` con la URL pooled de Neon.
2. Instalá dependencias desde esta carpeta con `npm install`.
3. Generá las tablas/migraciones y cargá catálogos con `npm run db:generate`, `npm run db:migrate` y `npm run db:seed`.
4. Arrancá la API con `npm run dev`; el servicio escucha en `http://127.0.0.1:3001`.
5. Consultá `GET /api/v1/health` y la documentación OpenAPI en `/api/docs`.

## Variables de entorno

`DATABASE_URL` es la conexión pooled usada por la API. `DATABASE_MIGRATION_URL` puede apuntar a la conexión directa que requiere el proceso de migración. `WEB_ORIGIN` debe ser el origen exacto del frontend; CORS permite credenciales solo desde ese origen. En producción también son obligatorios `SESSION_SECRET`, `SMTP_USER`, `SMTP_PASS` y `SMTP_FROM`.

Para email, configurá una cuenta Google dedicada con verificación en dos pasos y una Contraseña de Aplicación. Guardá el secreto en el entorno del servicio y nunca en Git. `PUBLIC_APP_URL` es el origen público usado en los enlaces de cuenta.

## Seguridad de operación

- No compartas URLs de Neon, contraseñas SMTP, secretos de sesión ni enlaces de verificación.
- Aplicá migraciones versionadas antes de iniciar una nueva versión.
- Creá y verificá una cuenta normal. En PowerShell configurá `$env:ADMIN_BOOTSTRAP_EMAIL = 'correo'` y `$env:ADMIN_BOOTSTRAP_CONFIRM = 'I_UNDERSTAND_THIS_GRANTS_ADMIN'`, después ejecutá `npm run admin:promote`; el registro público siempre asigna rol `user`.
- Revisá los respaldos de Neon y documentá una restauración antes de publicar datos reales.
