import { ArrowLeft, ArrowUpRight, FileText, LockKeyhole, ShieldCheck } from 'lucide-react';

import { useHashRoute } from '@/hooks/useHashRoute';

type LegalSlug = 'privacidad' | 'terminos' | 'seguridad' | 'cookies';

type LegalDocument = { slug: LegalSlug; title: string; summary: string; icon: typeof FileText; sections: [string, string[]][]; };

const CONTACT_PENDING = 'Canal de contacto para solicitudes legales y de seguridad: pendiente de definir.';
const PROJECT_ADDRESS = 'Escuela Rebeca Guber, Agustin Garzon 1221, Córdoba, Argentina';
const UPDATED_AT = '12 de noviembre de 2026';

const DOCUMENTS: LegalDocument[] = [
  {
    slug: 'privacidad' as const,
    title: 'Política de privacidad',
    summary: 'Qué datos trata el servicio, para qué los usa y cómo ejercer tus derechos.',
    icon: LockKeyhole,
    sections: [
      ['Responsable y contacto', [
        'Responsable del servicio: Tomas Gonzalez. Domicilio de contacto informado para el proyecto: ' + PROJECT_ADDRESS + '. Debe confirmarse que la escuela autoriza recibir allí solicitudes legales antes de publicar la versión definitiva.',
        CONTACT_PENDING,
      ]],
      ['Datos que tratamos', [
        'Cuenta: correo electrónico, contraseña almacenada como hash y nombre visible opcional.',
        'Seguimiento individual: material, cantidad en kilos y fecha del registro.',
        'Cuestionario: puntajes, cantidad de intentos y fecha.',
        'Preferencias: barrio elegido y estado del recordatorio.',
        'Reportes: punto informado, estado, comentario, fecha y cuenta autora. Los reportes aprobados se muestran públicamente junto con el punto; el correo de la cuenta no aparece en la respuesta pública.',
        'Operación y seguridad: identificadores y marcas de tiempo de sesión, verificación de correo, recuperación de contraseña y eventos administrativos.',
      ]],
      ['Finalidades', [
        'Usamos los datos para crear y proteger cuentas, verificar correos, recuperar contraseñas, guardar el seguimiento personal y las preferencias, revisar reportes comunitarios y mantener el servicio.',
        'El objetivo declarado incluye generar indicadores agregados para Córdoba. El código actual guarda los registros vinculados a cada cuenta; el agregado de ciudad todavía no está implementado. Si se activa, los indicadores públicos deberán presentarse sin identificar cuentas.',
      ]],
      ['Servicios y destinatarios', [
        'El responsable indicó que usa Vercel para el frontend y backend, y Neon para la base de datos. El mapa carga teselas desde OpenStreetMap; abrirlo genera solicitudes al proveedor. Falta confirmar qué proveedor SMTP está activo en producción.',
        'Las regiones concretas de Vercel y Neon y la ubicación de los respaldos no están confirmadas. Esta página no afirma en qué país se almacenan o procesan los datos.',
      ]],
      ['Conservación y eliminación', [
        'Las sesiones vencen a los 30 días; los enlaces de verificación, a la hora; y los de restablecimiento de contraseña, a los 30 minutos. Estos vencimientos no determinan cuánto tiempo permanecen los registros vencidos en la base.',
        'El código no define plazos generales para cuentas, reportes, auditoría o copias de seguridad, ni incluye eliminación completa de cuenta. Se debe establecer un proceso de solicitud y completar los plazos antes de aprobar esta política.',
      ]],
      ['Tus derechos', [
        'Podés solicitar acceso a tus datos y, cuando corresponda, rectificación, actualización, supresión o confidencialidad mediante el canal legal publicado por el responsable.',
        'La Ley 25.326 reconoce estos derechos. La AAIP explica cómo ejercerlos: argentina.gob.ar/aaip/datospersonales/derechos.',
      ]],
      ['Menores de edad', [
        'Las páginas públicas informativas pueden ser consultadas por personas de cualquier edad. Para crear una cuenta y guardar datos personales o enviar reportes, la regla del servicio es tener 18 años o más. Un adulto puede utilizar su propia cuenta para registrar actividades de su hogar. Esta regla debe incorporarse al registro antes de considerarse plenamente implementada.',
      ]],
    ],
  },
  {
    slug: 'terminos' as const,
    title: 'Términos de uso',
    summary: 'Reglas para usar las cuentas, el mapa, el seguimiento y los reportes comunitarios.',
    icon: FileText,
    sections: [
      ['El servicio', [
        'Mas y mejor reciclaje es un servicio gratuito de información y participación para promover el reciclaje en Córdoba. Permite consultar puntos, materiales y horarios; aprender sobre separación; registrar actividad individual; y enviar reportes comunitarios.',
        'Responsable del servicio: Tomas Gonzalez. Domicilio de contacto informado para el proyecto: ' + PROJECT_ADDRESS + '. La autorización para usarlo como domicilio legal y el canal de contacto deben confirmarse antes de publicar la versión definitiva.',
      ]],
      ['Información de puntos y horarios', [
        'La ubicación, recepción de materiales, estado y horario se ofrecen como información de referencia. Pueden estar desactualizados o ser demostrativos. Confirmá la información con el operador correspondiente antes de trasladarte.',
      ]],
      ['Cuentas', [
        'Algunas funciones requieren una cuenta con correo verificado. Quien crea una cuenta debe tener 18 años o más, mantener sus datos de acceso protegidos y proporcionar información veraz. La regla de edad y la aceptación/versionado de estos términos deben incorporarse al registro.',
        'Podés cerrar sesión. Para solicitar la eliminación de una cuenta o ejercer derechos sobre tus datos, se publicará un canal de contacto legal.',
      ]],
      ['Reportes y comentarios', [
        'Los reportes se revisan antes de publicarse. Los aprobados pueden mostrar el punto, el estado, el comentario y la fecha. No incluyas nombres, teléfonos, domicilios particulares, datos de menores ni otra información personal en comentarios.',
        'No envíes contenido falso, abusivo, ilegal o que exponga a otras personas. El responsable puede rechazar reportes o restringir esa función para proteger la comunidad y la calidad de la información.',
      ]],
      ['Uso permitido y disponibilidad', [
        'Usá el servicio de forma lícita. No intentes interrumpirlo, acceder a cuentas ajenas ni enviar datos que no tengas derecho a compartir. El servicio puede cambiar o dejar de estar disponible temporalmente por mantenimiento o problemas técnicos.',
        'Estos términos no eliminan derechos irrenunciables que pudieran corresponder conforme a la normativa aplicable. No hay bienes pagos ni suscripciones en la versión actual.',
      ]],
      ['Cambios y consultas', [
        'Las actualizaciones se publicarán en esta página con su fecha. El canal de consultas legales todavía está pendiente.',
      ]],
    ],
  },
  {
    slug: 'seguridad' as const,
    title: 'Política de seguridad',
    summary: 'Medidas generales de protección y cómo reportar una posible vulnerabilidad.',
    icon: ShieldCheck,
    sections: [
      ['Protección de cuentas y datos', [
        'La aplicación almacena contraseñas mediante hashes, protege los tokens de sesión, limita solicitudes y restringe las funciones administrativas a cuentas autorizadas. La cookie de sesión usa HttpOnly y SameSite=Lax; en producción se configura también Secure.',
        'El backend configura encabezados de seguridad y redacta cookies y encabezados de autorización en sus registros. Estas medidas reducen riesgos, pero ningún sistema conectado a Internet puede garantizar seguridad absoluta.',
      ]],
      ['Reporte responsable', [
        'El canal para reportar vulnerabilidades está pendiente de definir. El domicilio de contacto del proyecto informado es ' + PROJECT_ADDRESS + ', sujeto a confirmar autorización. El reporte debería incluir una descripción, pasos mínimos para reproducirla e impacto observado. No accedas a datos ajenos, no modifiques información, no interrumpas el servicio y no publiques detalles antes de coordinar una solución.',
        'No envíes contraseñas, tokens activos ni datos personales de terceros.',
      ]],
      ['Incidentes', [
        'Ante un incidente que afecte datos personales, el responsable deberá evaluar medidas de contención y las comunicaciones aplicables. El procedimiento interno y los plazos de respuesta deben definirse y mantenerse actualizados.',
      ]],
    ],
  },
  {
    slug: 'cookies' as const,
    title: 'Cookies y almacenamiento local',
    summary: 'Tecnologías necesarias para mantener la sesión y recordar preferencias.',
    icon: FileText,
    sections: [
      ['Cookie de sesión', [
        'Al iniciar sesión, el servidor establece una cookie necesaria para mantener la sesión. Está marcada HttpOnly y SameSite=Lax; en producción también Secure. La duración configurada es de hasta 30 días y se elimina al cerrar sesión. Sin esta cookie no funcionan las áreas que requieren cuenta.',
      ]],
      ['Almacenamiento local', [
        'La aplicación guarda la preferencia de tema claro u oscuro en el almacenamiento local del navegador para restaurarla cuando volvés. El dato permanece en el dispositivo hasta que lo borres desde la configuración del navegador.',
      ]],
      ['Mapa y servicios externos', [
        'El mapa carga teselas desde OpenStreetMap. Esa conexión puede transmitir datos técnicos de la solicitud, como la dirección IP del dispositivo. Más información: openstreetmap.org/copyright.',
        'En los archivos de entrada y dependencias revisados no se identificó una herramienta de analítica o publicidad. El proveedor SMTP de producción y las regiones de alojamiento todavía deben confirmarse.',
      ]],
      ['Cómo administrar estas tecnologías', [
        'Podés bloquear o borrar cookies y almacenamiento local desde tu navegador. Si bloqueás la cookie de sesión, no podrás iniciar sesión; si borrás el almacenamiento local, la preferencia de tema volverá a su valor inicial.',
      ]],
    ],
  },
];

const PENDING_ITEMS = [
  'Confirmar la autorización para usar la dirección de la Escuela Rebeca Guber como domicilio de contacto/legal y definir cómo se recibirán solicitudes.',
  'Confirmar regiones de Vercel y Neon y ubicación de respaldos.',
  'Confirmar proveedor SMTP activo en producción.',
  'Definir plazos de conservación y proceso completo de eliminación de cuenta.',
  'Incorporar confirmación de mayoría de edad y aceptación/versionado al registro.',
  'Implementar y verificar el cálculo agregado por ciudad antes de describirlo como una función activa.',
];

export default function LegalizationSection() {
  const { params } = useHashRoute();
  const slug = params.get('legalDoc') as LegalSlug | null;
  const document = DOCUMENTS.find((item) => item.slug === slug);

  return (
    <section aria-labelledby="legal-page-title" className="container-page space-y-8 pb-16 pt-28">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Mas y mejor reciclaje</p>
        <h1 id="legal-page-title" className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{document?.title ?? 'Información legal'}</h1>
        <p className="mt-3 text-muted">{document?.summary ?? 'Políticas y condiciones del servicio.'}</p>
      </header>

      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
        <strong>Borrador en revisión.</strong> Los documentos reflejan el código y los datos confirmados hasta ahora.
        Hay puntos operativos y de conservación pendientes; no publicar como versión definitiva todavía.
      </div>

      {document ? (
        <article className="max-w-3xl space-y-8">
          <p className="text-xs text-muted">Última revisión del borrador: {UPDATED_AT}</p>
          {document.sections.map(([heading, paragraphs]) => (
            <section key={heading} className="space-y-3">
              <h2 className="font-display text-xl font-bold">{heading}</h2>
              {paragraphs.map((paragraph) => <p key={paragraph} className="leading-relaxed text-muted">{paragraph}</p>)}
            </section>
          ))}
          <a className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline" href="#/legalizacion">
            <ArrowLeft size={16} aria-hidden="true" /> Volver al centro legal
          </a>
        </article>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
          <nav aria-label="Documentos legales" className="grid gap-3 sm:grid-cols-2">
            {DOCUMENTS.map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.slug} href={'#/legalizacion/' + item.slug} className="group rounded-2xl border border-border bg-surface p-5 shadow-soft transition-transform hover:-translate-y-0.5">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary"><Icon size={20} aria-hidden="true" /></span>
                  <h2 className="mt-4 font-display text-lg font-bold group-hover:text-primary">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Leer documento <ArrowUpRight size={15} aria-hidden="true" /></span>
                </a>
              );
            })}
          </nav>
          <aside className="rounded-2xl border border-border bg-surface-soft p-5">
            <h2 className="font-display text-lg font-bold">Pendiente antes de publicar</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted">
              {PENDING_ITEMS.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="mt-5 text-sm text-muted">{CONTACT_PENDING}</p>
          </aside>
        </div>
      )}
    </section>
  );
}
