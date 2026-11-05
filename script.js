/* ==========================================================================
   EcoPunto · Lógica de la aplicación
   Frontend vanilla, sin backend. Los datos se simulan con constantes y se
   persisten en localStorage.
   ========================================================================== */
(function () {
  "use strict";

  /* ========================================================================
     1. CONSTANTES Y DATOS BASE
     ======================================================================== */

  const DEFAULT_NEIGHBORHOOD = "Nueva Córdoba";
  const MONTHLY_GOAL = 50;

  const STORAGE_KEYS = {
    points: "ecopunto.points.v1",
    reports: "ecopunto.reports.v1",
    records: "ecopunto.records.v1",
    neighborhood: "ecopunto.neighborhood.v1",
    reminder: "ecopunto.reminder.v1",
    quiz: "ecopunto.quiz.v1",
    theme: "ecopunto.theme.v1"
  };

  const MATERIALS = [
    { key: "papel", label: "Papel y cartón", short: "Papel", color: "#3975d6", icon: "📄" },
    { key: "plastico", label: "Plástico", short: "Plástico", color: "#d29b22", icon: "🧴" },
    { key: "vidrio", label: "Vidrio", short: "Vidrio", color: "#158b78", icon: "🫙" },
    { key: "metal", label: "Metal", short: "Metal", color: "#667971", icon: "🥫" },
    { key: "organico", label: "Orgánico", short: "Orgánico", color: "#9a6735", icon: "🍎" },
    { key: "electronicos", label: "Electrónicos", short: "Electrónicos", color: "#7f62cc", icon: "💻" },
    { key: "pilas", label: "Pilas y baterías", short: "Pilas", color: "#ce4f43", icon: "🔋" }
  ];

  const MATERIAL_MAP = Object.fromEntries(MATERIALS.map((material) => [material.key, material]));

  const STATUS = {
    available: { label: "Disponible", short: "Disponible" },
    "near-full": { label: "Casi lleno", short: "Casi lleno" },
    full: { label: "Lleno", short: "Lleno" },
    damaged: { label: "En mal estado", short: "Dañado" }
  };

  /* Puntos de ejemplo en Córdoba Capital. Para sumar más, copiá un objeto,
     cambiá su id y coordenadas, y borrá la clave ecopunto.points.v1 del navegador. */
  const SEED_POINTS = [
    {
      id: "pv-ciudad-universitaria",
      name: "Punto Verde Ciudad Universitaria",
      address: "Av. Haya de la Torre 500, Ciudad Universitaria",
      lat: -31.4352,
      lng: -64.191,
      type: "Punto verde",
      materials: ["papel", "plastico", "vidrio", "metal", "electronicos", "pilas"],
      status: "available",
      hours: "Lun a Sáb · 8 a 20 h"
    },
    {
      id: "c-plaza-san-martin",
      name: "Contenedor Plaza San Martín",
      address: "Independencia 200, Centro",
      lat: -31.4121,
      lng: -64.183,
      type: "Contenedor",
      materials: ["papel", "plastico", "vidrio", "metal"],
      status: "near-full",
      hours: "Acceso 24 h"
    },
    {
      id: "c-mercado-norte",
      name: "Contenedor Mercado Norte",
      address: "Av. Santiago del Estero 175, Centro",
      lat: -31.4114,
      lng: -64.1846,
      type: "Contenedor",
      materials: ["papel", "plastico", "vidrio", "organico"],
      status: "full",
      hours: "Acceso 24 h"
    },
    {
      id: "pv-parque-sarmiento",
      name: "Punto Verde Parque Sarmiento",
      address: "Av. Poeta Lugones 400, Parque Sarmiento",
      lat: -31.4253,
      lng: -64.1832,
      type: "Punto verde",
      materials: ["papel", "plastico", "vidrio", "metal"],
      status: "available",
      hours: "Lun a Dom · 7 a 21 h"
    },
    {
      id: "c-plaza-guemes",
      name: "Contenedor Plaza Güemes",
      address: "Av. Olmos 450, Güemes",
      lat: -31.4198,
      lng: -64.1894,
      type: "Contenedor",
      materials: ["papel", "plastico", "vidrio", "metal"],
      status: "damaged",
      hours: "Acceso 24 h"
    },
    {
      id: "pv-alberdi",
      name: "Punto Verde Alberdi",
      address: "Av. Colón 4800, Alberdi",
      lat: -31.4064,
      lng: -64.2155,
      type: "Punto verde",
      materials: ["papel", "plastico", "vidrio", "metal", "electronicos", "pilas"],
      status: "available",
      hours: "Lun a Sáb · 8 a 20 h"
    },
    {
      id: "c-alta-cordoba",
      name: "Contenedor Alta Córdoba",
      address: "Av. Jerónimo Luis de Cabrera 1400, Alta Córdoba",
      lat: -31.4008,
      lng: -64.2038,
      type: "Contenedor",
      materials: ["papel", "plastico", "vidrio", "metal"],
      status: "near-full",
      hours: "Acceso 24 h"
    },
    {
      id: "pv-cerro-de-las-rosas",
      name: "Punto Verde Cerro de las Rosas",
      address: "Av. Rafael Núñez 4200, Cerro de las Rosas",
      lat: -31.3803,
      lng: -64.2288,
      type: "Punto verde",
      materials: ["papel", "plastico", "vidrio", "metal", "electronicos", "pilas"],
      status: "available",
      hours: "Lun a Sáb · 9 a 19 h"
    },
    {
      id: "c-nueva-cordoba",
      name: "Contenedor Nueva Córdoba",
      address: "Bv. San Juan 350, Nueva Córdoba",
      lat: -31.425,
      lng: -64.1858,
      type: "Contenedor",
      materials: ["papel", "plastico", "vidrio", "metal"],
      status: "near-full",
      hours: "Acceso 24 h"
    },
    {
      id: "pv-jardin-botanico",
      name: "Punto Verde Jardín Botánico",
      address: "Francisco Yunyent 5491, Jardín Botánico",
      lat: -31.4166,
      lng: -64.2106,
      type: "Punto verde",
      materials: ["papel", "plastico", "organico", "electronicos", "pilas"],
      status: "available",
      hours: "Mar a Dom · 9 a 18 h"
    },
    {
      id: "c-arguello",
      name: "Contenedor Argüello",
      address: "Av. Recta Martinoli 5500, Argüello",
      lat: -31.3649,
      lng: -64.2596,
      type: "Contenedor",
      materials: ["papel", "plastico", "vidrio", "metal"],
      status: "full",
      hours: "Acceso 24 h"
    },
    {
      id: "pv-villa-belgrano",
      name: "Punto Verde Villa Belgrano",
      address: "Av. Gauss 5500, Villa Belgrano",
      lat: -31.3861,
      lng: -64.2483,
      type: "Punto verde",
      materials: ["papel", "plastico", "vidrio", "electronicos"],
      status: "available",
      hours: "Lun a Sáb · 8 a 18 h"
    },
    {
      id: "c-san-vicente",
      name: "Contenedor San Vicente",
      address: "Av. San Vicente de Paul 1900, San Vicente",
      lat: -31.4118,
      lng: -64.2336,
      type: "Contenedor",
      materials: ["papel", "plastico", "vidrio", "metal"],
      status: "damaged",
      hours: "Acceso 24 h"
    },
    {
      id: "pv-general-paz",
      name: "Punto Verde General Paz",
      address: "Av. 24 de Septiembre 800, General Paz",
      lat: -31.3994,
      lng: -64.1763,
      type: "Punto verde",
      materials: ["papel", "plastico", "organico", "electronicos", "pilas"],
      status: "available",
      hours: "Lun a Sáb · 8 a 20 h"
    }
  ];

  const CATEGORY_ORDER = ["papel", "plastico", "vidrio", "metal", "organico", "electronicos", "pilas"];

  const CATEGORIES = {
    papel: {
      label: "Papel y cartón",
      shortLabel: "Papel",
      container: "Contenedor azul",
      icon: "📄",
      description: "El papel y el cartón limpios y secos vuelven a convertirse en nuevos cuadernos, cajas y packaging.",
      yes: ["Diarios, revistas y folletos", "Cajas de cartón desarmadas", "Papel de oficina limpio", "Cuadernos sin espiral metálica"],
      no: ["Papel higiénico o servilletas usadas", "Cajas de pizza con mucha grasa", "Papel plastificado o con brillantina", "Cartón mojado o encerado"],
      tip: "Plegá las cajas para ocupar menos lugar y mantené el papel seco. Si está engrasado, va a residuos comunes.",
      optionLabel: "Contenedor azul · Papel y cartón"
    },
    plastico: {
      label: "Plástico",
      shortLabel: "Plástico",
      container: "Contenedor amarillo",
      icon: "🧴",
      description: "Envases plásticos limpios se transforman en nuevos envases, madera plástica, caños y textiles.",
      yes: ["Botellas y bidones limpios", "Envases de yogur y shampoo", "Tapitas y potes", "Bolsas de acarreo limpias"],
      no: ["Vasos de telgopor", "Sachets metalizados", "Juguetes de plástico", "Envases con restos de comida"],
      tip: "Enjuagá, vaciá y aplastá los envases para que ocupen menos espacio. Las tapitas también van al amarillo.",
      optionLabel: "Contenedor amarillo · Plásticos"
    },
    vidrio: {
      label: "Vidrio",
      shortLabel: "Vidrio",
      container: "Contenedor verde",
      icon: "🫙",
      description: "El vidrio de envase es 100% reciclable y puede volver a la cadena productiva infinitas veces.",
      yes: ["Botellas de vidrio", "Frascos limpios y sin tapa", "Frascos de conserva", "Vidrio de envases de alimentos"],
      no: ["Espejos y vidrios laminados", "Cerámica, loza o porcelana", "Focos y lámparas", "Vasos y vidrios rotos"],
      tip: "Retirá tapas y etiquetas, enjuagá el frasco y llevalo con cuidado. El vidrio roto debe ir envuelto a residuos comunes.",
      optionLabel: "Contenedor verde · Vidrio"
    },
    metal: {
      label: "Metal",
      shortLabel: "Metal",
      container: "Contenedor gris",
      icon: "🥫",
      description: "Latas y metales se funden para crear nuevos productos con un enorme ahorro de energía y recursos.",
      yes: ["Latas de bebidas", "Latas de conserva", "Tapas metálicas", "Papel aluminio limpio"],
      no: ["Aerosoles con contenido", "Envases con pintura o solvente", "Electrodomésticos de gran tamaño", "Metal con restos peligrosos"],
      tip: "Enjuagá las latas y aplastalas si podés. Los aerosoles vacíos deben tener el pico protegido y ser aceptados en un punto específico.",
      optionLabel: "Contenedor gris · Metales"
    },
    organico: {
      label: "Orgánico",
      shortLabel: "Orgánico",
      container: "Contenedor marrón",
      icon: "🍎",
      description: "Los restos orgánicos vuelven a la tierra como compost, un abono natural que nutre suelos y plantas.",
      yes: ["Restos de fruta y verdura", "Yerba mate y café usados", "Cáscaras de huevo", "Poda, flores y restos de jardín"],
      no: ["Plásticos y envoltorios", "Aceite usado", "Pañales o residuos sanitarios", "Grandes cantidades de carne, lácteos o huesos"],
      tip: "Escurrí los restos y no mezcles envoltorios. Si tenés compostera en casa, la mejor opción es compostar ahí.",
      optionLabel: "Contenedor marrón · Orgánicos"
    },
    electronicos: {
      label: "Electrónicos",
      shortLabel: "Electrónicos",
      container: "Punto verde de RAEE",
      icon: "💻",
      description: "Los aparatos electrónicos tienen metales y componentes recuperables que no deben terminar en la basura.",
      yes: ["Celulares y cargadores", "Cables y auriculares", "Notebooks y tablets", "Pequeños electrodomésticos"],
      no: ["Electrodomésticos grandes sin coordinar", "Tubos fluorescentes", "Medicamentos vencidos", "Residuos peligrosos sin identificar"],
      tip: "Borrá tus datos personales antes de entregar un dispositivo. No los dejes en la vía pública.",
      optionLabel: "Punto verde · Electrónicos"
    },
    pilas: {
      label: "Pilas y baterías",
      shortLabel: "Pilas",
      container: "Punto especial de pilas",
      icon: "🔋",
      description: "Las pilas contienen metales pesados. Van a un punto especial, nunca a la bolsa de residuos comunes.",
      yes: ["Pilas AA, AAA y C", "Pilas botón", "Baterías de litio de celular", "Pequeñas baterías recargables"],
      no: ["Pilas tiradas a la basura común", "Baterías de auto o moto", "Mezclarlas con reciclables", "Pilas hinchadas sin protección"],
      tip: "Pegá cinta en los polos de las pilas para evitar cortocircuitos y guardalas en un frasco seco hasta llevarlas al punto especial.",
      optionLabel: "Punto especial · Pilas y baterías"
    },
    general: {
      label: "Residuos comunes",
      shortLabel: "Comunes",
      container: "Bolsa de residuos comunes",
      icon: "🗑️",
      description: "Este residuo no se recupera en los contenedores de reciclaje. Va a la bolsa de residuos comunes para evitar contaminar el resto.",
      yes: ["Residuos de higiene", "Materiales con restos de comida o grasa", "Telgopor y plásticos metalizados", "Vidrios o cerámicas rotas, bien envueltos"],
      no: ["Mezclar residuos peligrosos", "Volcar líquidos en la bolsa", "Desechar pilas o electrónicos", "Dejar vidrio roto sin proteger"],
      tip: "Antes de descartarlo, verificá si un punto verde de tu barrio recibe este material de forma especial.",
      optionLabel: "Bolsa de residuos comunes"
    }
  };

  /* Residuos del buscador. Para agregar uno, sumá un objeto con nombre,
     categoría, palabras clave y, opcionalmente, un consejo propio. */
  const WASTE_ITEMS = [
    { name: "Caja de pizza", category: "papel", keywords: ["caja", "pizza", "carton", "comida"], tip: "Si está limpia y sin restos de comida, va al azul. Si tiene mucho queso o aceite, va a la bolsa de residuos comunes." },
    { name: "Diario", category: "papel", keywords: ["periodico", "noticias", "papel"] },
    { name: "Revista", category: "papel", keywords: ["papel", "hojas", "lectura"] },
    { name: "Caja de cereal", category: "papel", keywords: ["caja", "carton", "desayuno", "packaging"] },
    { name: "Papel de oficina", category: "papel", keywords: ["hojas", "impresion", "cuaderno", "sobre"] },
    { name: "Folleto", category: "papel", keywords: ["volante", "publicidad", "papel"] },
    { name: "Bolsa de papel", category: "papel", keywords: ["bolsa", "papel", "almacen"] },
    { name: "Rollo de cartón", category: "papel", keywords: ["tubo", "papel higienico", "carton"] },
    { name: "Cuaderno", category: "papel", keywords: ["papel", "escuela", "espiral"] },
    { name: "Botella de agua", category: "plastico", keywords: ["botella", "agua", "pet", "plastico"] },
    { name: "Botella de plástico", category: "plastico", keywords: ["botella", "gaseosa", "bebida", "envase"] },
    { name: "Envase de yogur", category: "plastico", keywords: ["yogur", "pote", "envase", "lacteo"] },
    { name: "Botella de shampoo", category: "plastico", keywords: ["shampoo", "jabon", "baño", "envase"] },
    { name: "Tapitas", category: "plastico", keywords: ["tapas", "botella", "plasticas"] },
    { name: "Bolsa de supermercado", category: "plastico", keywords: ["bolsa", "plastico", "compra"] },
    { name: "Botella de detergente", category: "plastico", keywords: ["detergente", "limpieza", "envase"] },
    { name: "Pote de helado", category: "plastico", keywords: ["helado", "pote", "envase", "plastico"] },
    { name: "Botella de vidrio", category: "vidrio", keywords: ["botella", "envase", "vidrio", "bebida"] },
    { name: "Frasco de mermelada", category: "vidrio", keywords: ["frasco", "mermelada", "conserva", "vidrio"] },
    { name: "Botella de vino", category: "vidrio", keywords: ["vino", "botella", "vidrio", "alcohol"] },
    { name: "Frasco de perfume", category: "vidrio", keywords: ["perfume", "frasco", "vidrio", "cosmetico"] },
    { name: "Lata de gaseosa", category: "metal", keywords: ["lata", "bebida", "aluminio", "refresco"] },
    { name: "Lata de atún", category: "metal", keywords: ["lata", "atun", "conserva", "aluminio"] },
    { name: "Lata de conserva", category: "metal", keywords: ["lata", "comida", "metal", "conserva"] },
    { name: "Papel aluminio", category: "metal", keywords: ["aluminio", "film", "papel", "cocina"] },
    { name: "Tapas de frasco", category: "metal", keywords: ["tapa", "frasco", "metal", "conserva"] },
    { name: "Aerosol vacío", category: "metal", keywords: ["aerosol", "spray", "desodorante", "lata"], tip: "Solo si está completamente vacío. Protegé el pico y confirmá que el punto verde lo reciba." },
    { name: "Cáscara de banana", category: "organico", keywords: ["banana", "fruta", "organico", "compost"] },
    { name: "Restos de café", category: "organico", keywords: ["cafe", "borra", "organico", "compost"] },
    { name: "Yerba mate", category: "organico", keywords: ["yerba", "mate", "organico", "compost"] },
    { name: "Cáscara de huevo", category: "organico", keywords: ["huevo", "cascara", "organico", "compost"] },
    { name: "Poda del jardín", category: "organico", keywords: ["poda", "hojas", "ramas", "jardin", "compost"] },
    { name: "Pan duro", category: "organico", keywords: ["pan", "comida", "organico", "compost"] },
    { name: "Restos de verdura", category: "organico", keywords: ["verdura", "fruta", "cascaras", "organico"] },
    { name: "Saquito de té", category: "organico", keywords: ["te", "saquito", "organico", "compost"] },
    { name: "Celular viejo", category: "electronicos", keywords: ["celular", "telefono", "movil", "raee", "electronicos"], tip: "Borrá tus datos personales y, si todavía funciona, considerá donarlo antes de reciclarlo." },
    { name: "Cargador", category: "electronicos", keywords: ["cargador", "cable", "usb", "electrico"] },
    { name: "Cable", category: "electronicos", keywords: ["cable", "usb", "electrico", "cobre"] },
    { name: "Notebook", category: "electronicos", keywords: ["notebook", "computadora", "laptop", "raee"] },
    { name: "Impresora", category: "electronicos", keywords: ["impresora", "computadora", "raee", "cartucho"] },
    { name: "Auriculares", category: "electronicos", keywords: ["auriculares", "cascos", "audio", "cable"] },
    { name: "Control remoto", category: "electronicos", keywords: ["control", "televisor", "pilas", "electronicos"] },
    { name: "Tablet vieja", category: "electronicos", keywords: ["tablet", "tableta", "pantalla", "raee"] },
    { name: "Pila AA", category: "pilas", keywords: ["pila", "bateria", "aa", "alcalina"], tip: "Pegá cinta en los polos y guardala en un recipiente seco hasta llevarla al punto especial." },
    { name: "Pila AAA", category: "pilas", keywords: ["pila", "bateria", "aaa", "alcalina"], tip: "Pegá cinta en los polos y guardala en un recipiente seco hasta llevarla al punto especial." },
    { name: "Pila botón", category: "pilas", keywords: ["pila", "boton", "reloj", "audifono"], tip: "Especialmente peligrosa para niñas y niños: guardala segura y llevala a un punto especial." },
    { name: "Batería de celular", category: "pilas", keywords: ["bateria", "celular", "litio", "pila"], tip: "No la perfores ni la tires al fuego. Si está hinchada, aislala y consultá en el punto verde." },
    { name: "Vaso de telgopor", category: "general", keywords: ["vaso", "telgopor", "poliestireno", "comida"] },
    { name: "Sachet de leche", category: "general", keywords: ["sachet", "leche", "film", "plastico metalizado"] },
    { name: "Pañal", category: "general", keywords: ["pañal", "higiene", "bebes", "residuos"] },
    { name: "Servilleta con grasa", category: "general", keywords: ["servilleta", "grasa", "comida", "papel"] },
    { name: "Colilla de cigarrillo", category: "general", keywords: ["cigarrillo", "colilla", "tabaco", "residuos"] },
    { name: "Espejo roto", category: "general", keywords: ["espejo", "vidrio", "roto", "baño"], tip: "Envolvé los restos en papel de diario o cartón y señalalo antes de descartarlo." },
    { name: "Vaso roto", category: "general", keywords: ["vaso", "vidrio", "roto", "cocina"], tip: "Los vasos de vidrio templado no van al contenedor verde. Envolvelos bien antes de descartarlos." },
    { name: "Cerámica rota", category: "general", keywords: ["ceramica", "loza", "porcelana", "roto"] }
  ];

  const QUIZ_BANK = [
    { question: "¿En qué contenedor va una lata de gaseosa?", category: "metal", explanation: "Las latas son metal reciclable. Vacíalas, enjuagalas y aplastalas si podés." },
    { question: "¿Dónde va una caja de pizza limpia y sin restos?", category: "papel", explanation: "El cartón limpio va al contenedor azul. Si está muy engrasada, va a residuos comunes." },
    { question: "¿Qué hacés con una pila AAA usada?", category: "pilas", explanation: "Las pilas tienen metales pesados y van a un punto especial. Nunca a la bolsa común." },
    { question: "¿Dónde va una botella de vidrio vacía?", category: "vidrio", explanation: "El vidrio de envase va al contenedor verde. Retirá la tapa y enjuagá el envase." },
    { question: "¿En qué contenedor va una cáscara de banana?", category: "organico", explanation: "Los restos de fruta son orgánicos y se transforman en compost en el contenedor marrón." },
    { question: "¿Dónde llevás un celular viejo que ya no funciona?", category: "electronicos", explanation: "Los electrónicos son RAEE y necesitan un punto verde especial para recuperar sus componentes." },
    { question: "¿Dónde va una botella de agua plástica vacía?", category: "plastico", explanation: "Los envases plásticos limpios van al contenedor amarillo. Enjuagalos y aplastálos." },
    { question: "¿En qué contenedor va un vaso de telgopor?", category: "general", explanation: "El telgopor no se recicla en estos contenedores: va a la bolsa de residuos comunes." },
    { question: "¿Dónde va un frasco de mermelada de vidrio?", category: "vidrio", explanation: "El frasco limpio y sin tapa va al contenedor verde. El vidrio se recicla infinitas veces." },
    { question: "¿Dónde llevás un cargador que dejó de funcionar?", category: "electronicos", explanation: "Cargadores y cables son residuos electrónicos: llevalos a un punto verde de RAEE." },
    { question: "¿En qué contenedor va una lata de atún?", category: "metal", explanation: "La lata de atún es metal. Enjuagala antes de llevarla al contenedor gris." },
    { question: "¿Dónde va una servilleta usada con grasa?", category: "general", explanation: "La grasa contamina el papel reciclable, así que la servilleta va a residuos comunes." }
  ];

  /* Horarios demostrativos. Los días usan el formato de JavaScript:
     0 = domingo, 1 = lunes, ... 6 = sábado. */
  const NEIGHBORHOODS = {
    "Nueva Córdoba": [
      {
        key: "reciclables", name: "Reciclables", icon: "i-recycle", color: "#2f9a69",
        description: "Papel, cartón, plástico, vidrio y metal, limpios y secos.",
        days: [1, 4], time: "20:00 a 22:00", startTime: "20:00"
      },
      {
        key: "organicos", name: "Orgánicos", icon: "i-leaf", color: "#b47b3d",
        description: "Restos de frutas, verduras, yerba y poda.",
        days: [2, 6], time: "07:00 a 09:00", startTime: "07:00"
      },
      {
        key: "restos", name: "Restos no reciclables", icon: "i-trash", color: "#84948c",
        description: "Residuos de higiene y no recuperables, bien embolsados.",
        days: [1, 3, 5], time: "06:00 a 08:00", startTime: "06:00"
      }
    ],
    "Centro": [
      {
        key: "reciclables", name: "Reciclables", icon: "i-recycle", color: "#2f9a69",
        description: "Papel, cartón, plástico, vidrio y metal, limpios y secos.",
        days: [2, 5], time: "08:00 a 10:00", startTime: "08:00"
      },
      {
        key: "organicos", name: "Orgánicos", icon: "i-leaf", color: "#b47b3d",
        description: "Restos de frutas, verduras, yerba y poda.",
        days: [3, 6], time: "18:00 a 20:00", startTime: "18:00"
      },
      {
        key: "restos", name: "Restos no reciclables", icon: "i-trash", color: "#84948c",
        description: "Residuos de higiene y no recuperables, bien embolsados.",
        days: [1, 4, 0], time: "21:00 a 23:00", startTime: "21:00"
      }
    ],
    "Cerro de las Rosas": [
      {
        key: "reciclables", name: "Reciclables", icon: "i-recycle", color: "#2f9a69",
        description: "Papel, cartón, plástico, vidrio y metal, limpios y secos.",
        days: [1, 4], time: "07:00 a 09:00", startTime: "07:00"
      },
      {
        key: "organicos", name: "Orgánicos", icon: "i-leaf", color: "#b47b3d",
        description: "Restos de frutas, verduras, yerba y poda.",
        days: [5], time: "17:00 a 19:00", startTime: "17:00"
      },
      {
        key: "restos", name: "Restos no reciclables", icon: "i-trash", color: "#84948c",
        description: "Residuos de higiene y no recuperables, bien embolsados.",
        days: [2, 6], time: "06:00 a 08:00", startTime: "06:00"
      }
    ],
    "Alberdi": [
      {
        key: "reciclables", name: "Reciclables", icon: "i-recycle", color: "#2f9a69",
        description: "Papel, cartón, plástico, vidrio y metal, limpios y secos.",
        days: [2, 6], time: "18:00 a 20:00", startTime: "18:00"
      },
      {
        key: "organicos", name: "Orgánicos", icon: "i-leaf", color: "#b47b3d",
        description: "Restos de frutas, verduras, yerba y poda.",
        days: [1, 4], time: "07:00 a 09:00", startTime: "07:00"
      },
      {
        key: "restos", name: "Restos no reciclables", icon: "i-trash", color: "#84948c",
        description: "Residuos de higiene y no recuperables, bien embolsados.",
        days: [3, 5], time: "21:00 a 23:00", startTime: "21:00"
      }
    ],
    "Alta Córdoba": [
      {
        key: "reciclables", name: "Reciclables", icon: "i-recycle", color: "#2f9a69",
        description: "Papel, cartón, plástico, vidrio y metal, limpios y secos.",
        days: [3, 6], time: "08:00 a 10:00", startTime: "08:00"
      },
      {
        key: "organicos", name: "Orgánicos", icon: "i-leaf", color: "#b47b3d",
        description: "Restos de frutas, verduras, yerba y poda.",
        days: [2, 5], time: "18:00 a 20:00", startTime: "18:00"
      },
      {
        key: "restos", name: "Restos no reciclables", icon: "i-trash", color: "#84948c",
        description: "Residuos de higiene y no recuperables, bien embolsados.",
        days: [1, 4, 0], time: "06:00 a 08:00", startTime: "06:00"
      }
    ],
    "General Paz": [
      {
        key: "reciclables", name: "Reciclables", icon: "i-recycle", color: "#2f9a69",
        description: "Papel, cartón, plástico, vidrio y metal, limpios y secos.",
        days: [1, 5], time: "20:00 a 22:00", startTime: "20:00"
      },
      {
        key: "organicos", name: "Orgánicos", icon: "i-leaf", color: "#b47b3d",
        description: "Restos de frutas, verduras, yerba y poda.",
        days: [3, 6], time: "07:00 a 09:00", startTime: "07:00"
      },
      {
        key: "restos", name: "Restos no reciclables", icon: "i-trash", color: "#84948c",
        description: "Residuos de higiene y no recuperables, bien embolsados.",
        days: [2, 4], time: "21:00 a 23:00", startTime: "21:00"
      }
    ],
    "Villa Belgrano": [
      {
        key: "reciclables", name: "Reciclables", icon: "i-recycle", color: "#2f9a69",
        description: "Papel, cartón, plástico, vidrio y metal, limpios y secos.",
        days: [2, 4], time: "07:00 a 09:00", startTime: "07:00"
      },
      {
        key: "organicos", name: "Orgánicos", icon: "i-leaf", color: "#b47b3d",
        description: "Restos de frutas, verduras, yerba y poda.",
        days: [1, 5], time: "18:00 a 20:00", startTime: "18:00"
      },
      {
        key: "restos", name: "Restos no reciclables", icon: "i-trash", color: "#84948c",
        description: "Residuos de higiene y no recuperables, bien embolsados.",
        days: [3, 6], time: "06:00 a 08:00", startTime: "06:00"
      }
    ],
    "Güemes": [
      {
        key: "reciclables", name: "Reciclables", icon: "i-recycle", color: "#2f9a69",
        description: "Papel, cartón, plástico, vidrio y metal, limpios y secos.",
        days: [1, 4], time: "18:00 a 20:00", startTime: "18:00"
      },
      {
        key: "organicos", name: "Orgánicos", icon: "i-leaf", color: "#b47b3d",
        description: "Restos de frutas, verduras, yerba y poda.",
        days: [2, 5], time: "07:00 a 09:00", startTime: "07:00"
      },
      {
        key: "restos", name: "Restos no reciclables", icon: "i-trash", color: "#84948c",
        description: "Residuos de higiene y no recuperables, bien embolsados.",
        days: [3, 6], time: "21:00 a 23:00", startTime: "21:00"
      }
    ]
  };

  /* ========================================================================
     2. UTILIDADES GENERALES
     ======================================================================== */

  const NO_DATA = Symbol("sin-datos");
  let storageAvailable = true;
  let toastCounter = 0;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const REPORT_TO_STATUS = {
    full: "full",
    damaged: "damaged",
    available: "available"
  };

  const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const SHORT_DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const TRAVEL_STOPWORDS = new Set([
    "donde", "va", "van", "una", "uno", "un", "el", "la", "los", "las", "de", "del",
    "que", "como", "en", "y", "o", "para", "mi", "se", "tira", "tirar", "desecha",
    "desechar", "basura", "residuo", "esto", "esa", "ese", "al", "a", "por", "con"
  ]);

  function storageGet(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      storageAvailable = false;
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      storageAvailable = false;
      return false;
    }
  }

  function loadArraySeed(key, seedFactory, sanitize) {
    const stored = storageGet(key, NO_DATA);
    if (Array.isArray(stored)) {
      return sanitize(stored);
    }
    const seed = seedFactory();
    storageSet(key, seed);
    return seed;
  }

  function makeId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[¿?¡!.,;:()[\]{}"“”'’]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function searchTokens(query) {
    return normalizeText(query)
      .split(/\s+/)
      .filter((token) => token.length > 1 && !TRAVEL_STOPWORDS.has(token));
  }

  function capitalize(value) {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function debounce(callback, wait = 180) {
    let timeoutId;
    return function debounced(...args) {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => callback.apply(this, args), wait);
    };
  }

  function pluralize(value, singular, plural) {
    return `${value} ${value === 1 ? singular : plural}`;
  }

  /* --- Fechas locales (sin conversiones UTC para evitar corrimientos) --- */
  function startOfDay(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function dateToISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function isoToDate(isoDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate))) return null;
    const [year, month, day] = isoDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  }

  function todayISO() {
    return dateToISO(new Date());
  }

  function daysBetween(start, end) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((startOfDay(end) - startOfDay(start)) / oneDay);
  }

  function getWeekStart(date = new Date()) {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    return startOfDay(addDays(date, diff));
  }

  function formatKg(value) {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(Number(value) || 0);
  }

  function formatInteger(value) {
    return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(Number(value) || 0);
  }

  function formatLongDate(date) {
    return capitalize(
      new Intl.DateTimeFormat("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long"
      }).format(date)
    );
  }

  function formatShortDate(date) {
    return new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "short"
    }).format(date).replace(".", "");
  }

  function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";
    return capitalize(
      new Intl.DateTimeFormat("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date)
    );
  }

  function timeAgo(timestamp) {
    const date = new Date(timestamp);
    const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (Number.isNaN(diffSeconds)) return "";
    if (diffSeconds < 60) return "Hace un momento";
    const minutes = Math.floor(diffSeconds / 60);
    if (minutes < 60) return `Hace ${pluralize(minutes, "minuto", "minutos")}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${pluralize(hours, "hora", "horas")}`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${pluralize(days, "día", "días")}`;
    return capitalize(
      new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" }).format(date)
    );
  }

  function joinDays(dayNumbers) {
    const names = [...new Set(dayNumbers)].sort((a, b) => {
      const order = [1, 2, 3, 4, 5, 6, 0];
      return order.indexOf(a) - order.indexOf(b);
    }).map((day) => DAY_NAMES[day]);
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} y ${names[1].toLowerCase()}`;
    return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1].toLowerCase()}`;
  }

  function getMaterialTotals(records) {
    const byMaterial = Object.fromEntries(MATERIALS.map((material) => [material.key, 0]));
    records.forEach((record) => {
      if (byMaterial[record.material] !== undefined) {
        byMaterial[record.material] += Number(record.kg) || 0;
      }
    });
    return byMaterial;
  }

  function getCurrentStreak(records) {
    const dates = [...new Set(records.map((record) => record.date).filter(Boolean))].sort().reverse();
    if (!dates.length) return 0;
    const today = todayISO();
    const yesterday = dateToISO(addDays(new Date(), -1));
    let cursor = dates[0] === today ? today : dates[0] === yesterday ? yesterday : null;
    if (!cursor) return 0;
    let streak = 0;
    dates.forEach((date) => {
      if (date === cursor) {
        streak += 1;
        cursor = dateToISO(addDays(isoToDate(cursor), -1));
      } else if (date < cursor) {
        // Al no ser consecutiva, se corta la racha actual.
        cursor = "";
      }
    });
    return streak;
  }

  function getMaxStreak(records) {
    const dates = [...new Set(records.map((record) => record.date).filter(Boolean))].sort();
    let maxStreak = 0;
    let current = 0;
    let previousDate = null;
    dates.forEach((date) => {
      const parsed = isoToDate(date);
      if (!parsed) return;
      if (previousDate && daysBetween(previousDate, parsed) === 1) {
        current += 1;
      } else {
        current = 1;
      }
      maxStreak = Math.max(maxStreak, current);
      previousDate = parsed;
    });
    return maxStreak;
  }

  function getTrackingStats(records) {
    const byMaterial = getMaterialTotals(records);
    const total = Object.values(byMaterial).reduce((sum, value) => sum + value, 0);
    const populatedMaterials = MATERIALS.filter((material) => byMaterial[material.key] > 0);
    const topMaterial = populatedMaterials
      .slice()
      .sort((a, b) => byMaterial[b.key] - byMaterial[a.key])[0] || null;
    const thisMonthPrefix = todayISO().slice(0, 7);
    const monthlyTotal = records
      .filter((record) => record.date && record.date.startsWith(thisMonthPrefix))
      .reduce((sum, record) => sum + Number(record.kg), 0);

    return {
      total,
      count: records.length,
      byMaterial,
      populatedMaterials,
      topMaterial,
      distinctMaterials: populatedMaterials.length,
      currentStreak: getCurrentStreak(records),
      maxStreak: getMaxStreak(records),
      monthlyTotal
    };
  }

  /* --- Datos iniciales de ejemplo --- */
  function createSeedReports() {
    const now = Date.now();
    return [
      {
        id: "seed-report-1",
        pointId: "c-mercado-norte",
        pointName: "Contenedor Mercado Norte",
        type: "full",
        comment: "Está desbordado y hay bolsas alrededor.",
        timestamp: new Date(now - 48 * 60 * 1000).toISOString()
      },
      {
        id: "seed-report-2",
        pointId: "c-plaza-guemes",
        pointName: "Contenedor Plaza Güemes",
        type: "damaged",
        comment: "Le falta la tapa y está sucio.",
        timestamp: new Date(now - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "seed-report-3",
        pointId: "pv-ciudad-universitaria",
        pointName: "Punto Verde Ciudad Universitaria",
        type: "available",
        comment: "Limpio y con lugar para dejar reciclables.",
        timestamp: new Date(now - 29 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  function createSeedRecords() {
    const baseDate = startOfDay(new Date());
    return [
      { id: "seed-rec-1", material: "plastico", kg: 2.4, date: dateToISO(baseDate) },
      { id: "seed-rec-2", material: "papel", kg: 1.8, date: dateToISO(addDays(baseDate, -1)) },
      { id: "seed-rec-3", material: "vidrio", kg: 0.8, date: dateToISO(addDays(baseDate, -1)) },
      { id: "seed-rec-4", material: "organico", kg: 3.2, date: dateToISO(addDays(baseDate, -2)) },
      { id: "seed-rec-5", material: "plastico", kg: 4.1, date: dateToISO(addDays(baseDate, -8)) },
      { id: "seed-rec-6", material: "metal", kg: 1.4, date: dateToISO(addDays(baseDate, -15)) },
      { id: "seed-rec-7", material: "papel", kg: 2.7, date: dateToISO(addDays(baseDate, -22)) },
      { id: "seed-rec-8", material: "electronicos", kg: 0.9, date: dateToISO(addDays(baseDate, -35)) }
    ];
  }

  function sanitizePoints(data) {
    if (!Array.isArray(data)) return null;
    return data
      .filter((point) => point && point.name && Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng)))
      .map((point, index) => ({
        id: String(point.id || `point-${index}`),
        name: String(point.name),
        address: String(point.address || "Córdoba, Argentina"),
        lat: Number(point.lat),
        lng: Number(point.lng),
        type: point.type === "Contenedor" ? "Contenedor" : "Punto verde",
        materials: Array.isArray(point.materials)
          ? point.materials.filter((material) => MATERIAL_MAP[material])
          : [],
        status: STATUS[point.status] ? point.status : "available",
        hours: String(point.hours || "Consultar horario")
      }));
  }

  function sanitizeReports(data) {
    if (!Array.isArray(data)) return null;
    return data
      .filter((report) => report && report.id && report.pointId && REPORT_TO_STATUS[report.type])
      .map((report) => {
        const timestamp = new Date(report.timestamp);
        return {
          id: String(report.id),
          pointId: String(report.pointId),
          pointName: String(report.pointName || "Punto de reciclaje"),
          type: report.type,
          comment: String(report.comment || "").slice(0, 180),
          timestamp: Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString()
        };
      })
      .filter((report) => report.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  function sanitizeRecords(data) {
    if (!Array.isArray(data)) return null;
    return data
      .filter((record) => record && MATERIAL_MAP[record.material] && Number(record.kg) > 0 && isoToDate(record.date))
      .map((record) => ({
        id: String(record.id || makeId("record")),
        material: record.material,
        kg: Math.round(Number(record.kg) * 100) / 100,
        date: String(record.date)
      }));
  }

  function loadPoints() {
    return loadArraySeed(STORAGE_KEYS.points, () => JSON.parse(JSON.stringify(SEED_POINTS)), (data) => {
      const sanitized = sanitizePoints(data);
      if (!sanitized || !sanitized.length) {
        const seed = JSON.parse(JSON.stringify(SEED_POINTS));
        storageSet(STORAGE_KEYS.points, seed);
        return seed;
      }
      return sanitized;
    });
  }

  function loadReports() {
    return loadArraySeed(STORAGE_KEYS.reports, createSeedReports, (data) => sanitizeReports(data) || []);
  }

  function loadRecords() {
    return loadArraySeed(STORAGE_KEYS.records, createSeedRecords, (data) => sanitizeRecords(data) || []);
  }

  function loadNeighborhood() {
    const stored = storageGet(STORAGE_KEYS.neighborhood, null);
    if (typeof stored === "string" && NEIGHBORHOODS[stored]) return stored;
    storageSet(STORAGE_KEYS.neighborhood, DEFAULT_NEIGHBORHOOD);
    return DEFAULT_NEIGHBORHOOD;
  }

  function loadReminder() {
    const stored = storageGet(STORAGE_KEYS.reminder, null);
    if (stored && typeof stored === "object" && typeof stored.enabled === "boolean") {
      return {
        enabled: stored.enabled,
        neighborhood: NEIGHBORHOODS[stored.neighborhood] ? stored.neighborhood : null,
        createdAt: stored.createdAt || null
      };
    }
    return { enabled: false, neighborhood: null, createdAt: null };
  }

  function loadQuizResult() {
    const stored = storageGet(STORAGE_KEYS.quiz, null);
    if (!stored || typeof stored !== "object") {
      return { best: 0, attempts: 0, lastScore: null, lastDate: null };
    }
    return {
      best: clamp(Number(stored.best) || 0, 0, 5),
      attempts: Math.max(0, Number(stored.attempts) || 0),
      lastScore: Number.isFinite(Number(stored.lastScore)) ? clamp(Number(stored.lastScore), 0, 5) : null,
      lastDate: typeof stored.lastDate === "string" ? stored.lastDate : null
    };
  }

  /* ========================================================================
     3. ESTADO DE LA APLICACIÓN
     ======================================================================== */

  const state = {
    points: loadPoints(),
    reports: loadReports(),
    records: loadRecords(),
    neighborhood: loadNeighborhood(),
    reminder: loadReminder(),
    quiz: loadQuizResult(),
    filters: { material: "all", search: "" },
    activePointId: null,
    trendMode: "week",
    guide: { matches: [], activeIndex: -1 },
    quizSession: null,
    charts: { material: null, trend: null },
    trackingReady: false,
    countersAnimated: false,
    mapUnavailable: false
  };

  const mapState = {
    instance: null,
    layer: null,
    markers: new Map()
  };

  /* ========================================================================
     4. TEMA CLARO / OSCURO
     ======================================================================== */

  function initTheme() {
    const toggle = $("#themeToggle");
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    applyTheme(currentTheme, false);

    toggle?.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme, true);
    });
  }

  function applyTheme(theme, persist) {
    const normalizedTheme = theme === "dark" ? "dark" : "light";
    const isDark = normalizedTheme === "dark";
    document.documentElement.dataset.theme = normalizedTheme;
    document.documentElement.style.colorScheme = normalizedTheme;

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", isDark ? "#0a1611" : "#f5f7f1");

    const toggle = $("#themeToggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", isDark ? "Activar modo claro" : "Activar modo oscuro");
      toggle.setAttribute("title", isDark ? "Activar modo claro" : "Activar modo oscuro");
    }

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEYS.theme, normalizedTheme);
      } catch (error) {
        storageAvailable = false;
      }
    }

    if (state.trackingReady) {
      window.setTimeout(renderCharts, 30);
    }
  }

  /* ========================================================================
     5. NOTIFICACIONES TOAST
     ======================================================================== */

  function showToast(message, variant = "success", duration = 4200) {
    const root = $("#toastRoot");
    if (!root) return;

    while (root.children.length >= 4) {
      root.firstElementChild?.remove();
    }

    const toast = document.createElement("div");
    toast.className = `toast${variant === "error" ? " toast--error" : variant === "info" ? " toast--info" : ""}`;
    toast.id = `toast-${++toastCounter}`;

    const iconId = variant === "error" ? "#i-alert" : variant === "info" ? "#i-info" : "#i-check";
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true"><svg class="icon"><use href="${iconId}"></use></svg></span>
      <p class="toast-copy">${escapeHTML(message)}</p>
      <button class="toast-close" type="button" aria-label="Cerrar notificación">
        <svg class="icon" aria-hidden="true"><use href="#i-x"></use></svg>
      </button>
    `;

    const removeToast = () => {
      if (!toast.isConnected) return;
      toast.classList.add("is-leaving");
      window.setTimeout(() => toast.remove(), 190);
    };

    toast.querySelector(".toast-close")?.addEventListener("click", removeToast);
    root.appendChild(toast);

    if (duration > 0) {
      window.setTimeout(removeToast, duration);
    }
  }

  /* ========================================================================
     6. INICIO, CONTADORES Y HERO
     ======================================================================== */

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getCounterTargets() {
    const stats = getTrackingStats(state.records);
    return {
      kg: stats.total,
      points: state.points.length,
      reports: state.reports.length,
      neighbors: 1274
    };
  }

  function formatCounterValue(value, decimals = 0) {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(Number(value) || 0);
  }

  function initHero() {
    refreshHeroDashboard();
    initCounters();
  }

  function refreshHeroDashboard() {
    const stats = getTrackingStats(state.records);
    const targets = getCounterTargets();
    const heroKg = $("#heroKg");
    const ring = $("#impactRing");
    const goalPercent = clamp((stats.monthlyTotal / MONTHLY_GOAL) * 100, 0, 100);
    const totalProgress = clamp(stats.total, 0, 100);

    if (heroKg) heroKg.textContent = formatKg(stats.total);
    if (ring) {
      ring.style.setProperty("--progress", totalProgress.toFixed(1));
      ring.setAttribute("aria-label", `${formatKg(stats.total)} kilos reciclados de una meta de 100 kilos`);
    }

    const goalPct = $("#heroGoalPct");
    const goalBar = $("#heroGoalBar");
    const monthlyText = $("#heroMonthlyText");
    const streak = $("#heroStreak");
    const floatingPoints = $("#floatingPoints");

    if (goalPct) goalPct.textContent = `${Math.round(goalPercent)}%`;
    if (goalBar) goalBar.style.width = `${Math.max(goalPercent, stats.monthlyTotal > 0 ? 2 : 0)}%`;
    if (monthlyText) monthlyText.textContent = `${formatKg(stats.monthlyTotal)} de ${MONTHLY_GOAL} kg este mes`;
    if (streak) streak.textContent = pluralize(stats.currentStreak, "día", "días");
    if (floatingPoints) floatingPoints.textContent = String(state.points.length);

    const latestBox = $("#heroLastRecord");
    if (latestBox) {
      const paragraph = latestBox.querySelector("p");
      const latest = state.records
        .slice()
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
      if (paragraph) {
        if (latest) {
          const material = MATERIAL_MAP[latest.material]?.label || latest.material;
          paragraph.innerHTML = `Último aporte: <strong>${escapeHTML(material)} · ${formatKg(latest.kg)} kg</strong>`;
        } else {
          paragraph.innerHTML = "Todavía no hay registros. <strong>¡Empezá hoy!</strong>";
        }
      }
    }

    $$("[data-counter]").forEach((element) => {
      const key = element.dataset.counter;
      const value = targets[key] ?? 0;
      element.dataset.target = String(value);
      if (element.dataset.animated === "true") {
        element.textContent = formatCounterValue(value, Number(element.dataset.decimals) || 0);
      }
    });
  }

  function initCounters() {
    const counters = $$("[data-counter]");
    if (!counters.length) return;

    const animateAll = () => counters.forEach(animateCounter);

    counters.forEach((counter) => {
      counter.textContent = formatCounterValue(0, Number(counter.dataset.decimals) || 0);
    });

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      animateAll();
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.25 });

    counters.forEach((counter) => observer.observe(counter));
  }

  function animateCounter(element) {
    if (!element || element.dataset.animated === "true") return;
    const target = Number(element.dataset.target) || 0;
    const decimals = Number(element.dataset.decimals) || 0;
    const duration = prefersReducedMotion() ? 0 : 1100;
    const startTime = performance.now();

    if (duration === 0) {
      element.textContent = formatCounterValue(target, decimals);
      element.dataset.animated = "true";
      return;
    }

    function tick(now) {
      const progress = clamp((now - startTime) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = formatCounterValue(target * eased, decimals);
      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        element.textContent = formatCounterValue(target, decimals);
        element.dataset.animated = "true";
      }
    }

    window.requestAnimationFrame(tick);
  }

  /* ========================================================================
     7. NAVEGACIÓN Y COMPORTAMIENTO GLOBAL
     ======================================================================== */

  function initNavigation() {
    const header = $("#siteHeader");
    const toggle = $("#navToggle");
    const nav = $("#primaryNav");
    if (!header || !toggle) return;

    const setMenuState = (open, restoreFocus = false) => {
      header.classList.toggle("nav-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      if (open) {
        nav?.querySelector("a")?.focus();
      } else if (restoreFocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener("click", () => {
      setMenuState(!header.classList.contains("nav-open"));
    });

    nav?.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenuState(false);
    });

    document.addEventListener("click", (event) => {
      if (!header.classList.contains("nav-open")) return;
      if (!header.contains(event.target)) setMenuState(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("nav-open")) {
        setMenuState(false, true);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 960 && header.classList.contains("nav-open")) {
        setMenuState(false);
      }
    });
  }

  function scrollToSection(sectionId, focusSelector) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height"), 10) || 78;
    const top = section.getBoundingClientRect().top + window.scrollY - headerHeight - 18;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: prefersReducedMotion() ? "auto" : "smooth"
    });
    if (focusSelector) {
      window.setTimeout(() => {
        const target = $(focusSelector);
        target?.focus({ preventScroll: true });
      }, prefersReducedMotion() ? 0 : 520);
    }
  }

  function initScrollUI() {
    const header = $("#siteHeader");
    const backToTop = $("#backToTop");
    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY;
      header?.classList.toggle("is-scrolled", scrollY > 10);
      backToTop?.classList.toggle("is-visible", scrollY > 650);
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  function initScrollSpy() {
    const links = $$("#primaryNav a");
    const sectionIds = ["inicio", "mapa", "reportar", "guia", "calendario", "seguimiento"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!links.length || !sections.length) return;

    const setActive = (id) => {
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    if (!("IntersectionObserver" in window)) {
      setActive("inicio");
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActive(visible.target.id);
    }, {
      rootMargin: "-38% 0px -52% 0px",
      threshold: [0, 0.15, 0.4]
    });

    sections.forEach((section) => observer.observe(section));
    setActive("inicio");
  }

  function initRevealAnimations() {
    const items = $$(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

    items.forEach((item) => observer.observe(item));
  }

  /* ========================================================================
     8. MAPA, FILTROS Y LISTA SINCRONIZADA
     ======================================================================== */

  function getVisiblePoints() {
    const query = normalizeText(state.filters.search);
    return state.points.filter((point) => {
      const materialMatch = state.filters.material === "all" || point.materials.includes(state.filters.material);
      if (!materialMatch) return false;
      if (!query) return true;
      const haystack = normalizeText(`${point.name} ${point.address}`);
      return haystack.includes(query);
    });
  }

  function buildMapFilters() {
    const container = $("#materialFilters");
    if (!container) return;

    const allButton = `
      <button class="filter-chip" type="button" data-material="all" aria-pressed="true">
        Todos
      </button>
    `;

    const materialButtons = MATERIALS.map((material) => `
      <button class="filter-chip" type="button" data-material="${material.key}" aria-pressed="false">
        <span class="chip-dot" style="--chip-color:${material.color}"></span>${escapeHTML(material.short)}
      </button>
    `).join("");

    container.innerHTML = allButton + materialButtons;
  }

  function updateMapFilterButtons() {
    $$("#materialFilters [data-material]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.material === state.filters.material));
    });
  }

  function resetMapFilters() {
    state.filters = { material: "all", search: "" };
    const search = $("#pointSearch");
    const clearButton = $("#clearPointSearch");
    if (search) search.value = "";
    if (clearButton) clearButton.hidden = true;
    updateMapFilterButtons();
    state.activePointId = null;
    refreshMapAndList({ fit: true });
  }

  function initMap() {
    buildMapFilters();

    const search = $("#pointSearch");
    const clearButton = $("#clearPointSearch");
    const resetButton = $("#resetMapFilters");
    const emptyResetButton = $("#mapResetEmpty");
    const filterContainer = $("#materialFilters");
    const placesList = $("#placesList");

    const debouncedSearch = debounce(() => {
      state.activePointId = null;
      refreshMapAndList({ fit: true });
    }, 180);

    search?.addEventListener("input", () => {
      state.filters.search = search.value;
      if (clearButton) clearButton.hidden = !search.value;
      debouncedSearch();
    });

    clearButton?.addEventListener("click", () => {
      if (search) {
        search.value = "";
        search.focus();
      }
      state.filters.search = "";
      clearButton.hidden = true;
      refreshMapAndList({ fit: true });
    });

    filterContainer?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-material]");
      if (!button) return;
      state.filters.material = button.dataset.material;
      state.activePointId = null;
      updateMapFilterButtons();
      refreshMapAndList({ fit: true });
    });

    resetButton?.addEventListener("click", resetMapFilters);
    emptyResetButton?.addEventListener("click", resetMapFilters);

    placesList?.addEventListener("click", (event) => {
      const card = event.target.closest("[data-point-id]");
      if (!card) return;
      focusPointOnMap(card.dataset.pointId);
    });

    if (typeof window.L === "undefined") {
      state.mapUnavailable = true;
      const fallback = $("#mapFallback");
      if (fallback) fallback.hidden = false;
      refreshMapAndList();
      return;
    }

    try {
      mapState.instance = window.L.map("map", {
        center: [-31.4075, -64.205],
        zoom: 12,
        zoomControl: false,
        scrollWheelZoom: false
      });

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
      }).addTo(mapState.instance);

      window.L.control.zoom({ position: "bottomright" }).addTo(mapState.instance);
      window.L.control.scale({ position: "bottomleft", imperial: false }).addTo(mapState.instance);
      mapState.layer = window.L.layerGroup().addTo(mapState.instance);

      refreshMapAndList({ fit: true });
    } catch (error) {
      state.mapUnavailable = true;
      const fallback = $("#mapFallback");
      if (fallback) fallback.hidden = false;
      refreshMapAndList();
    }
  }

  function refreshMapAndList(options = {}) {
    const visiblePoints = getVisiblePoints();
    const mapEmpty = $("#mapEmpty");
    const placesCount = $("#placesCount");
    const summary = $("#mapStatusSummary");

    if (placesCount) placesCount.textContent = String(visiblePoints.length);
    if (summary) {
      const hasFilters = state.filters.material !== "all" || state.filters.search.trim() !== "";
      summary.textContent = hasFilters
        ? `${visiblePoints.length} de ${state.points.length} lugares`
        : `${state.points.length} lugares en el mapa`;
    }

    if (state.activePointId && !visiblePoints.some((point) => point.id === state.activePointId)) {
      state.activePointId = null;
    }

    renderPlacesList(visiblePoints);

    if (mapEmpty) {
      mapEmpty.hidden = visiblePoints.length > 0 || state.mapUnavailable;
    }

    if (!mapState.instance || !mapState.layer || typeof window.L === "undefined") {
      return;
    }

    mapState.layer.clearLayers();
    mapState.markers.clear();

    visiblePoints.forEach((point) => {
      const marker = createMarker(point);
      marker.addTo(mapState.layer);
      mapState.markers.set(point.id, marker);
    });

    if (options.fit) {
      fitMapToPoints(visiblePoints);
    }
  }

  function createMarker(point) {
    const iconId = point.type === "Punto verde" ? "#i-recycle" : "#i-trash";
    const icon = window.L.divIcon({
      className: "eco-div-icon",
      html: `<span class="eco-marker eco-marker--${point.status}" aria-hidden="true"><svg class="icon"><use href="${iconId}"></use></svg></span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 30],
      popupAnchor: [0, -26]
    });

    const marker = window.L.marker([point.lat, point.lng], {
      icon,
      title: point.name,
      alt: `${point.name}, ${point.type}, ${STATUS[point.status].label}`,
      riseOnHover: true
    });

    marker.bindPopup(buildPointPopup(point), {
      maxWidth: 280,
      closeButton: true,
      autoPanPadding: [30, 30]
    });

    marker.on("click", () => setActivePoint(point.id));
    marker.on("popupopen", (event) => {
      const button = event.popup.getElement()?.querySelector(".popup-report-button");
      button?.addEventListener("click", () => {
        mapState.instance?.closePopup();
        preselectReportPoint(point.id);
      });
    });

    return marker;
  }

  function buildPointPopup(point) {
    const materials = point.materials
      .map((key) => MATERIAL_MAP[key])
      .filter(Boolean)
      .map((material) => `<span>${escapeHTML(material.short)}</span>`)
      .join("");

    return `
      <div class="eco-popup">
        <div class="eco-popup-head">
          <div>
            <span class="eco-popup-type">${escapeHTML(point.type)}</span>
            <h3>${escapeHTML(point.name)}</h3>
          </div>
          <span class="status-pill status-pill--${point.status}">
            ${escapeHTML(STATUS[point.status].label)}
          </span>
        </div>
        <p class="eco-popup-address">
          <svg class="icon" aria-hidden="true"><use href="#i-map-pin"></use></svg>
          ${escapeHTML(point.address)}
        </p>
        <p class="eco-popup-address">
          <svg class="icon" aria-hidden="true"><use href="#i-clock"></use></svg>
          ${escapeHTML(point.hours)}
        </p>
        <div class="popup-materials" aria-label="Materiales aceptados">${materials}</div>
        <button class="popup-report-button" type="button">
          <svg class="icon" aria-hidden="true"><use href="#i-alert"></use></svg>
          Reportar este lugar
        </button>
      </div>
    `;
  }

  function renderPlacesList(points) {
    const list = $("#placesList");
    if (!list) return;

    if (!points.length) {
      list.innerHTML = `
        <div class="places-empty">
          <svg class="icon" aria-hidden="true"><use href="#i-search"></use></svg>
          <p>No encontramos lugares con ese criterio. Probá con otro material o limpiá los filtros.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = points.map((point) => {
      const isActive = point.id === state.activePointId;
      const materialTags = point.materials
        .map((key) => MATERIAL_MAP[key])
        .filter(Boolean)
        .map((material) => `<span class="material-tag">${escapeHTML(material.short)}</span>`)
        .join("");

      const iconId = point.type === "Punto verde" ? "#i-recycle" : "#i-trash";

      return `
        <button
          class="place-card${isActive ? " is-active" : ""}"
          type="button"
          data-point-id="${escapeHTML(point.id)}"
          aria-label="Ver ${escapeHTML(point.name)} en el mapa. Estado: ${escapeHTML(STATUS[point.status].label)}."
          ${isActive ? 'aria-current="true"' : ""}
        >
          <div class="place-card-top">
            <span class="place-type">
              <svg class="icon" aria-hidden="true"><use href="${iconId}"></use></svg>
              ${escapeHTML(point.type)}
            </span>
            <span class="status-pill status-pill--${point.status}">
              ${escapeHTML(STATUS[point.status].label)}
            </span>
          </div>
          <h4>${escapeHTML(point.name)}</h4>
          <p class="place-address">
            <svg class="icon" aria-hidden="true"><use href="#i-map-pin"></use></svg>
            ${escapeHTML(point.address)}
          </p>
          <div class="place-materials">${materialTags}</div>
          <span class="place-link-hint">
            Ver en el mapa
            <svg class="icon" aria-hidden="true"><use href="#i-arrow-right"></use></svg>
          </span>
        </button>
      `;
    }).join("");
  }

  function setActivePoint(pointId) {
    state.activePointId = pointId;
    const cards = $$(".place-card", $("#placesList") || document);
    cards.forEach((card) => {
      const active = card.dataset.pointId === pointId;
      card.classList.toggle("is-active", active);
      if (active) {
        card.setAttribute("aria-current", "true");
      } else {
        card.removeAttribute("aria-current");
      }
    });

    const activeCard = cards.find((card) => card.dataset.pointId === pointId);
    if (activeCard) {
      const list = $("#placesList");
      if (list) {
        const top = activeCard.offsetTop - list.offsetTop - 6;
        list.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
    }
  }

  function focusPointOnMap(pointId) {
    const point = state.points.find((item) => item.id === pointId);
    if (!point) return;
    setActivePoint(pointId);

    if (!mapState.instance || state.mapUnavailable) {
      showToast("El mapa no está disponible, pero podés ver los datos del lugar en la lista.", "info");
      return;
    }

    const marker = mapState.markers.get(pointId);
    const targetZoom = Math.max(mapState.instance.getZoom(), 14);
    mapState.instance.flyTo([point.lat, point.lng], targetZoom, {
      duration: prefersReducedMotion() ? 0 : 0.55
    });
    marker?.openPopup();
  }

  function fitMapToPoints(points) {
    if (!mapState.instance || !window.L) return;
    if (!points.length) {
      mapState.instance.setView([-31.4075, -64.205], 12);
      return;
    }
    if (points.length === 1) {
      mapState.instance.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    const bounds = window.L.latLngBounds(points.map((point) => [point.lat, point.lng]));
    mapState.instance.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }

  function applyMapMaterialFilter(materialKey) {
    if (!MATERIAL_MAP[materialKey]) return;
    state.filters.material = materialKey;
    state.filters.search = "";
    state.activePointId = null;
    const search = $("#pointSearch");
    if (search) search.value = "";
    const clear = $("#clearPointSearch");
    if (clear) clear.hidden = true;
    updateMapFilterButtons();
    refreshMapAndList({ fit: true });
    scrollToSection("mapa");
  }

  /* ========================================================================
     9. REPORTES DE CONTENEDORES
     ======================================================================== */

  function renderReportSelect() {
    const select = $("#reportPoint");
    if (!select) return;
    const currentValue = select.value;

    const greenPoints = state.points.filter((point) => point.type === "Punto verde");
    const containers = state.points.filter((point) => point.type !== "Punto verde");

    const buildOption = (point) => `
      <option value="${escapeHTML(point.id)}">
        ${escapeHTML(point.name)} · ${escapeHTML(STATUS[point.status].label)}
      </option>
    `;

    select.innerHTML = `
      <option value="">Seleccioná un lugar</option>
      ${greenPoints.length ? `<optgroup label="Puntos verdes">${greenPoints.map(buildOption).join("")}</optgroup>` : ""}
      ${containers.length ? `<optgroup label="Contenedores">${containers.map(buildOption).join("")}</optgroup>` : ""}
    `;

    if (currentValue && state.points.some((point) => point.id === currentValue)) {
      select.value = currentValue;
    }
  }

  function initReporting() {
    renderReportSelect();
    renderReportHistory();

    const form = $("#reportForm");
    const pointSelect = $("#reportPoint");
    const comment = $("#reportComment");
    const charCount = $("#reportCommentCount");

    pointSelect?.addEventListener("change", clearReportErrors);
    $$('input[name="reportType"]', form).forEach((radio) => {
      radio.addEventListener("change", clearReportErrors);
    });

    comment?.addEventListener("input", () => {
      if (charCount) charCount.textContent = `${comment.value.length}/180`;
    });

    form?.addEventListener("submit", handleReportSubmit);
  }

  function clearReportErrors() {
    const pointField = $("#reportPoint")?.closest(".field");
    const typeGroup = $("#reportTypeGroup");
    const pointError = $("#reportPointError");
    const typeError = $("#reportTypeError");

    pointField?.classList.remove("has-error");
    typeGroup?.classList.remove("has-error");
    $("#reportPoint")?.setAttribute("aria-invalid", "false");
    typeGroup?.setAttribute("aria-invalid", "false");
    if (pointError) pointError.textContent = "";
    if (typeError) typeError.textContent = "";
  }

  function handleReportSubmit(event) {
    event.preventDefault();
    clearReportErrors();

    const form = event.currentTarget;
    const pointId = $("#reportPoint")?.value || "";
    const selectedType = form.querySelector('input[name="reportType"]:checked')?.value || "";
    const comment = ($("#reportComment")?.value || "").trim();
    const point = state.points.find((item) => item.id === pointId);
    let firstInvalid = null;

    if (!point) {
      const field = $("#reportPoint")?.closest(".field");
      field?.classList.add("has-error");
      $("#reportPoint")?.setAttribute("aria-invalid", "true");
      const error = $("#reportPointError");
      if (error) error.textContent = "Elegí el punto o contenedor que querés reportar.";
      firstInvalid = $("#reportPoint");
    }

    if (!REPORT_TO_STATUS[selectedType]) {
      $("#reportTypeGroup")?.classList.add("has-error");
      $("#reportTypeGroup")?.setAttribute("aria-invalid", "true");
      const error = $("#reportTypeError");
      if (error) error.textContent = "Seleccioná cómo está el contenedor.";
      if (!firstInvalid) firstInvalid = form.querySelector('input[name="reportType"]');
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const newStatus = REPORT_TO_STATUS[selectedType];
    point.status = newStatus;

    const report = {
      id: makeId("report"),
      pointId: point.id,
      pointName: point.name,
      type: selectedType,
      comment: comment.slice(0, 180),
      timestamp: new Date().toISOString()
    };

    state.reports.unshift(report);
    storageSet(STORAGE_KEYS.points, state.points);
    storageSet(STORAGE_KEYS.reports, state.reports);

    form.reset();
    clearReportErrors();
    const charCount = $("#reportCommentCount");
    if (charCount) charCount.textContent = "0/180";

    renderReportSelect();
    renderReportHistory();
    refreshMapAndList();
    refreshHeroDashboard();

    const reportsList = $("#reportsList");
    if (reportsList) reportsList.scrollTop = 0;

    showToast(`${point.name} ahora figura como “${STATUS[newStatus].label}”. ¡Gracias por avisar!`);
  }

  function renderReportHistory() {
    const list = $("#reportsList");
    const count = $("#reportsCount");
    if (!list) return;
    if (count) count.textContent = String(state.reports.length);

    const sortedReports = state.reports
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (!sortedReports.length) {
      list.innerHTML = `
        <div class="reports-empty">
          <svg class="icon" aria-hidden="true"><use href="#i-alert"></use></svg>
          <p>Todavía no hay reportes. Si ves un contenedor lleno o dañado, podés ser quien avise primero.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = sortedReports.map((report) => {
      const status = REPORT_TO_STATUS[report.type];
      const label = STATUS[status].label;
      const commentMarkup = report.comment
        ? `<p class="report-item-comment"><svg class="icon" aria-hidden="true"><use href="#i-info"></use></svg>${escapeHTML(report.comment)}</p>`
        : "";
      return `
        <article class="report-item">
          <div class="report-item-top">
            <span class="report-status report-status--${status}">${escapeHTML(label)}</span>
            <time datetime="${escapeHTML(report.timestamp)}" title="${escapeHTML(formatDateTime(report.timestamp))}">
              ${escapeHTML(timeAgo(report.timestamp))}
            </time>
          </div>
          <h4>${escapeHTML(report.pointName)}</h4>
          ${commentMarkup}
        </article>
      `;
    }).join("");
  }

  function preselectReportPoint(pointId) {
    const point = state.points.find((item) => item.id === pointId);
    if (!point) {
      showToast("No pudimos encontrar ese punto. Elegilo manualmente en la lista.", "error");
      return;
    }

    renderReportSelect();
    const select = $("#reportPoint");
    if (select) {
      select.value = pointId;
      clearReportErrors();
    }
    scrollToSection("reportar", "#reportPoint");
  }

  /* ========================================================================
     10. GUÍA DE CLASIFICACIÓN
     ======================================================================== */

  function initGuide() {
    renderCategoryAccordion();
    initGuideSearch();
    initQuiz();
  }

  function renderCategoryAccordion() {
    const accordion = $("#categoryAccordion");
    if (!accordion) return;

    accordion.innerHTML = CATEGORY_ORDER.map((key) => {
      const category = CATEGORIES[key];
      const yesItems = category.yes.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
      const noItems = category.no.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
      const triggerId = `category-trigger-${key}`;
      const panelId = `category-panel-${key}`;

      return `
        <section class="accordion-item cat-${key}" data-category="${key}">
          <h3>
            <button class="accordion-trigger" type="button" id="${triggerId}" aria-expanded="false" aria-controls="${panelId}">
              <span class="category-icon" aria-hidden="true">${category.icon}</span>
              <span class="accordion-title">
                <strong>${escapeHTML(category.label)}</strong>
                <small>${escapeHTML(category.container)} · ${category.yes.length} ejemplos</small>
              </span>
              <svg class="icon accordion-chevron" aria-hidden="true"><use href="#i-chevron-down"></use></svg>
            </button>
          </h3>
          <div class="accordion-panel" id="${panelId}" role="region" aria-labelledby="${triggerId}" hidden>
            <p>${escapeHTML(category.description)}</p>
            <div class="do-dont-grid">
              <div class="do-list">
                <h4><svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg> Sí va</h4>
                <ul>${yesItems}</ul>
              </div>
              <div class="dont-list">
                <h4><svg class="icon" aria-hidden="true"><use href="#i-x"></use></svg> No va</h4>
                <ul>${noItems}</ul>
              </div>
            </div>
            <p class="category-tip">
              <svg class="icon" aria-hidden="true"><use href="#i-sparkles"></use></svg>
              <span><strong>Consejo:</strong> ${escapeHTML(category.tip)}</span>
            </p>
          </div>
        </section>
      `;
    }).join("");

    accordion.addEventListener("click", (event) => {
      const trigger = event.target.closest(".accordion-trigger");
      if (!trigger) return;
      const item = trigger.closest(".accordion-item");
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (!item || !panel) return;
      const wasOpen = trigger.getAttribute("aria-expanded") === "true";

      $$(".accordion-trigger", accordion).forEach((otherTrigger) => {
        if (otherTrigger === trigger) return;
        otherTrigger.setAttribute("aria-expanded", "false");
        const otherPanel = document.getElementById(otherTrigger.getAttribute("aria-controls"));
        if (otherPanel) otherPanel.hidden = true;
      });
      $$(".accordion-item", accordion).forEach((otherItem) => {
        if (otherItem !== item) otherItem.classList.remove("is-open");
      });

      trigger.setAttribute("aria-expanded", String(!wasOpen));
      panel.hidden = wasOpen;
      item.classList.toggle("is-open", !wasOpen);
    });
  }

  function getWasteMatches(query) {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return [];
    const tokens = searchTokens(query);
    const effectiveTokens = tokens.length ? tokens : normalizedQuery.split(" ").filter(Boolean);

    return WASTE_ITEMS
      .map((item, index) => {
        const normalizedName = normalizeText(item.name);
        const haystack = normalizeText(`${item.name} ${(item.keywords || []).join(" ")}`);
        const allTokensMatch = effectiveTokens.every((token) => haystack.includes(token));
        if (!allTokensMatch) return null;

        let score = 55;
        if (normalizedName === normalizedQuery) score = 130;
        else if (normalizedName.startsWith(normalizedQuery)) score = 110;
        else if (normalizedName.includes(normalizedQuery)) score = 95;
        else if (effectiveTokens.every((token) => normalizedName.includes(token))) score = 85;
        else if (normalizedName.split(" ").some((word) => word.startsWith(effectiveTokens[0]))) score = 72;

        return { item, score, index };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((entry) => entry.item);
  }

  function initGuideSearch() {
    const form = $("#guideSearchForm");
    const input = $("#guideSearch");
    const suggestions = $("#guideSuggestions");
    const result = $("#guideResult");
    if (!form || !input || !suggestions || !result) return;

    input.addEventListener("input", () => {
      const query = input.value.trim();
      state.guide.matches = query.length >= 2 ? getWasteMatches(query) : [];
      state.guide.activeIndex = -1;
      renderGuideSuggestions();
    });

    input.addEventListener("keydown", (event) => {
      const isOpen = !suggestions.hidden;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (!isOpen && input.value.trim().length >= 2) {
          state.guide.matches = getWasteMatches(input.value);
          state.guide.activeIndex = -1;
          renderGuideSuggestions();
        }
        if (suggestions.hidden || !state.guide.matches.length) return;
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const count = state.guide.matches.length;
        const nextIndex = (state.guide.activeIndex + direction + count) % count;
        setGuideActiveIndex(nextIndex);
      } else if (event.key === "Enter" && isOpen && state.guide.activeIndex >= 0) {
        event.preventDefault();
        const item = state.guide.matches[state.guide.activeIndex];
        if (item) {
          input.value = item.name;
          hideGuideSuggestions();
          renderWasteResult(item);
        }
      } else if (event.key === "Escape") {
        hideGuideSuggestions();
      }
    });

    suggestions.addEventListener("click", (event) => {
      const option = event.target.closest(".suggestion-option");
      if (!option) return;
      const index = Number(option.dataset.suggestionIndex);
      const item = state.guide.matches[index];
      if (!item) return;
      input.value = item.name;
      hideGuideSuggestions();
      renderWasteResult(item);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = input.value.trim();
      if (!query) {
        showToast("Escribí un residuo para buscarlo en la guía.", "info");
        input.focus();
        return;
      }
      state.guide.matches = getWasteMatches(query);
      hideGuideSuggestions();
      if (!state.guide.matches.length) {
        renderNoWasteResult(query);
        return;
      }
      renderWasteResult(state.guide.matches[0]);
    });

    $$("[data-guide-query]").forEach((button) => {
      button.addEventListener("click", () => {
        const query = button.dataset.guideQuery;
        input.value = query;
        state.guide.matches = getWasteMatches(query);
        hideGuideSuggestions();
        if (state.guide.matches.length) {
          renderWasteResult(state.guide.matches[0]);
        } else {
          renderNoWasteResult(query);
        }
      });
    });

    result.addEventListener("click", (event) => {
      const mapButton = event.target.closest("[data-map-filter]");
      if (!mapButton) return;
      applyMapMaterialFilter(mapButton.dataset.mapFilter);
    });

    document.addEventListener("click", (event) => {
      if (suggestions.hidden) return;
      if (!event.target.closest(".guide-search-box")) hideGuideSuggestions();
    });
  }

  function renderGuideSuggestions() {
    const input = $("#guideSearch");
    const suggestions = $("#guideSuggestions");
    if (!input || !suggestions) return;
    const matches = state.guide.matches;

    if (!input.value.trim() || !matches.length) {
      if (input.value.trim().length >= 2) {
        suggestions.innerHTML = `<div class="suggestion-empty">No encontramos ese residuo. Probá con otra palabra.</div>`;
        suggestions.hidden = false;
        input.setAttribute("aria-expanded", "true");
      } else {
        hideGuideSuggestions();
      }
      return;
    }

    suggestions.innerHTML = matches.slice(0, 6).map((item, index) => {
      const category = CATEGORIES[item.category];
      return `
        <div class="suggestion-option cat-${item.category}" role="option" id="guide-suggestion-${index}"
          aria-selected="false" data-suggestion-index="${index}">
          <span class="suggestion-dot"></span>
          <span class="suggestion-name">${escapeHTML(item.name)}</span>
          <span class="suggestion-category">${escapeHTML(category.shortLabel)}</span>
        </div>
      `;
    }).join("");

    suggestions.hidden = false;
    input.setAttribute("aria-expanded", "true");
    input.removeAttribute("aria-activedescendant");
    state.guide.activeIndex = -1;
  }

  function setGuideActiveIndex(index) {
    const input = $("#guideSearch");
    const suggestions = $("#guideSuggestions");
    if (!input || !suggestions) return;
    state.guide.activeIndex = index;

    $$(".suggestion-option", suggestions).forEach((option) => {
      const active = Number(option.dataset.suggestionIndex) === index;
      option.classList.toggle("is-active", active);
      option.setAttribute("aria-selected", String(active));
      if (active) {
        input.setAttribute("aria-activedescendant", option.id);
        option.scrollIntoView({ block: "nearest" });
      }
    });
  }

  function hideGuideSuggestions() {
    const input = $("#guideSearch");
    const suggestions = $("#guideSuggestions");
    if (suggestions) suggestions.hidden = true;
    if (input) {
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
    }
    state.guide.activeIndex = -1;
  }

  function renderWasteResult(item) {
    const result = $("#guideResult");
    if (!result) return;
    const category = CATEGORIES[item.category];
    const tip = item.tip || category.tip;
    const mapAction = MATERIAL_MAP[item.category]
      ? `<button class="text-button waste-result-map-link" type="button" data-map-filter="${item.category}">
           Ver puntos que aceptan ${escapeHTML(category.shortLabel.toLowerCase())}
           <svg class="icon" aria-hidden="true"><use href="#i-arrow-right"></use></svg>
         </button>`
      : "";

    result.innerHTML = `
      <article class="waste-result cat-${item.category}">
        <div class="waste-result-head">
          <div class="waste-result-icon" aria-hidden="true">${category.icon}</div>
          <div class="waste-result-copy">
            <p class="waste-result-eyebrow"><strong>${escapeHTML(item.name)}</strong> va en</p>
            <h4 class="waste-result-title">
              <span class="color-swatch" aria-hidden="true"></span>
              ${escapeHTML(category.container)}
            </h4>
            <span class="waste-result-category">${escapeHTML(category.label)}</span>
          </div>
        </div>
        <p class="waste-result-description">${escapeHTML(category.description)}</p>
        <div class="waste-result-tip">
          <svg class="icon" aria-hidden="true"><use href="#i-sparkles"></use></svg>
          <p><strong>Consejo:</strong> ${escapeHTML(tip)}</p>
        </div>
        ${mapAction}
      </article>
    `;
  }

  function renderNoWasteResult(query) {
    const result = $("#guideResult");
    if (!result) return;
    result.innerHTML = `
      <article class="waste-result waste-result--empty">
        <div class="waste-result-icon" aria-hidden="true">🔎</div>
        <div>
          <h4>No encontramos “${escapeHTML(query)}”</h4>
          <p>Probá con otra palabra o revisá las categorías de abajo. También podés consultar en tu punto verde más cercano.</p>
        </div>
      </article>
    `;
  }

  /* ========================================================================
     11. MINI QUIZ
     ======================================================================== */

  function initQuiz() {
    const content = $("#quizContent");
    if (!content) return;

    renderQuizStart();

    content.addEventListener("click", (event) => {
      if (event.target.closest("[data-quiz-start]")) {
        startQuiz();
        return;
      }
      const answerButton = event.target.closest("[data-quiz-answer]");
      if (answerButton) {
        answerQuiz(answerButton.dataset.quizAnswer);
        return;
      }
      if (event.target.closest("[data-quiz-next]")) {
        advanceQuiz();
      }
    });
  }

  function renderQuizStart() {
    const content = $("#quizContent");
    if (!content) return;
    const { best, attempts, lastScore } = state.quiz;
    const bestText = attempts > 0
      ? `<span>Mejor resultado · ${pluralize(attempts, "intento", "intentos")}</span><strong>${best}/5</strong>`
      : `<span>Tu mejor resultado</span><strong>—</strong>`;
    const lastAttempt = attempts > 0 && lastScore !== null
      ? `<span>Último intento: ${lastScore}/5</span>`
      : `<span>Sin intentos todavía</span>`;

    content.innerHTML = `
      <div class="quiz-start">
        <div class="quiz-start-meta">
          <span class="quiz-start-icon" aria-hidden="true">
            <svg class="icon"><use href="#i-sparkles"></use></svg>
          </span>
          <div>
            <strong>5 preguntas al azar</strong>
            <span>Un minuto para aprender algo nuevo</span>
          </div>
        </div>
        <p class="quiz-best">${bestText}</p>
        <p class="quiz-best quiz-last-attempt">${lastAttempt}</p>
        <button class="button button-light" type="button" data-quiz-start>
          Empezar el quiz
          <svg class="icon" aria-hidden="true"><use href="#i-arrow-right"></use></svg>
        </button>
      </div>
    `;
  }

  function shuffleArray(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }

  function startQuiz() {
    state.quizSession = {
      questions: shuffleArray(QUIZ_BANK).slice(0, 5),
      index: 0,
      score: 0,
      answered: false
    };
    renderQuizQuestion();
  }

  function buildQuizOptions(correctCategory) {
    const allCategories = [...CATEGORY_ORDER, "general"];
    const distractors = shuffleArray(allCategories.filter((key) => key !== correctCategory)).slice(0, 3);
    return shuffleArray([correctCategory, ...distractors]);
  }

  function renderQuizQuestion() {
    const content = $("#quizContent");
    const session = state.quizSession;
    if (!content || !session) return;

    const question = session.questions[session.index];
    if (!question) {
      finishQuiz();
      return;
    }

    session.answered = false;
    const options = buildQuizOptions(question.category);
    const progressDots = session.questions.map((_, index) => {
      const className = index < session.index
        ? "quiz-dot is-done"
        : index === session.index
          ? "quiz-dot is-current"
          : "quiz-dot";
      return `<span class="${className}"></span>`;
    }).join("");

    content.innerHTML = `
      <div class="quiz-progress-top">
        <span>Pregunta ${session.index + 1} de ${session.questions.length}</span>
        <div class="quiz-dots" aria-hidden="true">${progressDots}</div>
      </div>
      <div class="quiz-question">
        <span class="quiz-qnumber">Elegí una opción</span>
        <h4 id="quizQuestionTitle" tabindex="-1">${escapeHTML(question.question)}</h4>
      </div>
      <div class="quiz-options" role="group" aria-labelledby="quizQuestionTitle">
        ${options.map((key) => {
          const category = CATEGORIES[key];
          return `
            <button class="quiz-option cat-${key}" type="button" data-quiz-answer="${key}">
              <span class="option-dot" aria-hidden="true"></span>
              <span class="quiz-option-label">${escapeHTML(category.optionLabel)}</span>
              <svg class="icon option-state-icon" aria-hidden="true"><use href="#i-check"></use></svg>
            </button>
          `;
        }).join("")}
      </div>
      <div class="quiz-feedback" id="quizFeedback" aria-live="polite" hidden></div>
      <button class="quiz-next" type="button" data-quiz-next hidden>
        ${session.index === session.questions.length - 1 ? "Ver mi resultado" : "Siguiente pregunta"}
        <svg class="icon" aria-hidden="true"><use href="#i-arrow-right"></use></svg>
      </button>
    `;

    window.requestAnimationFrame(() => {
      $("#quizQuestionTitle")?.focus({ preventScroll: true });
    });
  }

  function answerQuiz(selectedCategory) {
    const session = state.quizSession;
    const content = $("#quizContent");
    if (!session || !content || session.answered) return;

    const question = session.questions[session.index];
    const isCorrect = selectedCategory === question.category;
    session.answered = true;
    if (isCorrect) session.score += 1;

    const buttons = $$(".quiz-option", content);
    buttons.forEach((button) => {
      button.disabled = true;
      const optionCategory = button.dataset.quizAnswer;
      if (optionCategory === question.category) {
        button.classList.add("is-correct");
      } else if (optionCategory === selectedCategory) {
        button.classList.add("is-wrong");
        button.querySelector(".option-state-icon use")?.setAttribute("href", "#i-x");
      }
    });

    const correctCategory = CATEGORIES[question.category];
    const feedback = $("#quizFeedback");
    if (feedback) {
      feedback.hidden = false;
      feedback.classList.toggle("is-wrong", !isCorrect);
      feedback.innerHTML = isCorrect
        ? `<strong>¡Exacto!</strong> ${escapeHTML(question.explanation)}`
        : `<strong>Casi.</strong> La respuesta correcta es <strong>${escapeHTML(correctCategory.container)}</strong>. ${escapeHTML(question.explanation)}`;
    }

    const dots = $$(".quiz-dot", content);
    if (dots[session.index]) {
      dots[session.index].classList.remove("is-current");
      dots[session.index].classList.add("is-done");
    }

    const nextButton = $("[data-quiz-next]", content);
    if (nextButton) {
      nextButton.hidden = false;
      window.requestAnimationFrame(() => nextButton.focus({ preventScroll: true }));
    }
  }

  function advanceQuiz() {
    const session = state.quizSession;
    if (!session) return;
    if (session.index >= session.questions.length - 1) {
      finishQuiz();
      return;
    }
    session.index += 1;
    session.answered = false;
    renderQuizQuestion();
  }

  function finishQuiz() {
    const session = state.quizSession;
    if (!session) return;

    const previousBest = Number(state.quiz.best) || 0;
    const isNewBest = session.score > previousBest;
    state.quiz = {
      best: Math.max(previousBest, session.score),
      attempts: (Number(state.quiz.attempts) || 0) + 1,
      lastScore: session.score,
      lastDate: todayISO()
    };
    storageSet(STORAGE_KEYS.quiz, state.quiz);
    renderQuizResult(isNewBest);
  }

  function renderQuizResult(isNewBest) {
    const content = $("#quizContent");
    const session = state.quizSession;
    if (!content || !session) return;

    const score = session.score;
    let title = "Todo se aprende";
    let message = "Revisá la guía rápida y volvé a intentarlo. Cada pregunta te deja un aprendizaje nuevo.";
    if (score === 5) {
      title = "¡Ecoexperto/a!";
      message = "Respondiste todo bien. Estás listo o lista para enseñarles a otros cómo separar mejor.";
    } else if (score === 4) {
      title = "Muy buen ojo";
      message = "Te falta muy poco para el puntaje perfecto. Una vuelta más por la guía y lo lográs.";
    } else if (score === 3) {
      title = "Vas por buen camino";
      message = "La base está. Repasá las categorías que más dudas te dejaron y probá de nuevo.";
    }

    content.innerHTML = `
      <div class="quiz-result" aria-live="polite">
        <div class="quiz-score-ring" aria-label="${score} de 5 respuestas correctas">
          <span>${score}</span><small>/5</small>
        </div>
        <h4>${escapeHTML(title)}</h4>
        <p>${escapeHTML(message)}</p>
        <p class="quiz-best-line">
          ${isNewBest ? "¡Nuevo récord personal!" : `Tu mejor resultado es ${state.quiz.best}/5.`}
        </p>
        <button class="button button-light" type="button" data-quiz-start>
          Volver a jugar
          <svg class="icon" aria-hidden="true"><use href="#i-recycle"></use></svg>
        </button>
      </div>
    `;
  }

  /* ========================================================================
     12. CALENDARIO DE RECOLECCIÓN
     ======================================================================== */

  function initCalendar() {
    const select = $("#neighborhoodSelect");
    const reminderToggle = $("#reminderToggle");
    const disableReminder = $("#disableReminder");
    if (!select) return;

    select.innerHTML = Object.keys(NEIGHBORHOODS)
      .map((name) => `<option value="${escapeHTML(name)}">${escapeHTML(name)}</option>`)
      .join("");
    select.value = state.neighborhood;

    select.addEventListener("change", () => {
      const newNeighborhood = select.value;
      if (!NEIGHBORHOODS[newNeighborhood]) return;
      state.neighborhood = newNeighborhood;
      storageSet(STORAGE_KEYS.neighborhood, newNeighborhood);

      if (state.reminder.enabled) {
        state.reminder.neighborhood = newNeighborhood;
        storageSet(STORAGE_KEYS.reminder, state.reminder);
        renderCalendar();
        showToast(`Recordatorio actualizado para ${newNeighborhood}.`, "info");
      } else {
        renderCalendar();
      }
    });

    reminderToggle?.addEventListener("click", () => {
      setReminder(!state.reminder.enabled);
    });

    disableReminder?.addEventListener("click", () => {
      setReminder(false);
    });

    renderCalendar();
  }

  function setReminder(enabled) {
    const schedules = NEIGHBORHOODS[state.neighborhood] || [];
    const next = getNextCollection(schedules);
    state.reminder = {
      enabled,
      neighborhood: enabled ? state.neighborhood : null,
      createdAt: new Date().toISOString()
    };
    storageSet(STORAGE_KEYS.reminder, state.reminder);
    renderCalendar();

    if (enabled && next) {
      showToast(`Recordatorio activado: ${next.schedule.name.toLowerCase()} en ${state.neighborhood}.`);
    } else if (enabled) {
      showToast("Recordatorio activado para tu barrio.");
    } else {
      showToast("Recordatorio desactivado.", "info");
    }
  }

  function getScheduleWindow(schedule) {
    const match = /(\d{1,2}):(\d{2})\s*(?:a|-)\s*(\d{1,2}):(\d{2})/.exec(String(schedule.time || ""));
    if (!match) return null;
    const start = Number(match[1]) * 60 + Number(match[2]);
    const end = Number(match[3]) * 60 + Number(match[4]);
    return { start, end: end < start ? end + 24 * 60 : end };
  }

  function getNextCollection(schedules) {
    if (!schedules?.length) return null;
    const now = new Date();
    const baseDate = startOfDay(now);
    const currentDay = baseDate.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const options = [];

    schedules.forEach((schedule) => {
      const windowInfo = getScheduleWindow(schedule);

      schedule.days.forEach((day) => {
        let offset = (day - currentDay + 7) % 7;

        /* Si la recolección de hoy ya terminó, la próxima es dentro de 7 días. */
        if (offset === 0 && windowInfo && currentMinutes >= windowInfo.end) {
          offset = 7;
        }

        options.push({
          schedule,
          date: addDays(baseDate, offset),
          offset,
          startMinutes: windowInfo ? windowInfo.start : 0
        });
      });
    });

    options.sort((a, b) => {
      const dateDifference = a.date.getTime() - b.date.getTime();
      if (dateDifference !== 0) return dateDifference;
      return a.startMinutes - b.startMinutes;
    });

    return options[0] || null;
  }

  function formatWeekRange(monday) {
    const sunday = addDays(monday, 6);
    const sameMonth = monday.getMonth() === sunday.getMonth();
    if (sameMonth) {
      const month = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(monday);
      return `${monday.getDate()} al ${sunday.getDate()} de ${month}`;
    }
    return `${formatShortDate(monday)} al ${formatShortDate(sunday)}`;
  }

  function renderCalendar() {
    const schedules = NEIGHBORHOODS[state.neighborhood] || [];
    const next = getNextCollection(schedules);

    renderWeekGrid(schedules);
    renderScheduleList(schedules, next);
    renderNextCollection(next);
    renderReminderState(next);
  }

  function renderWeekGrid(schedules) {
    const grid = $("#weekGrid");
    const label = $("#weekLabel");
    if (!grid) return;

    const today = startOfDay(new Date());
    const weekStart = getWeekStart(today);
    if (label) label.textContent = capitalize(formatWeekRange(weekStart));

    const orderedDays = [1, 2, 3, 4, 5, 6, 0];
    grid.innerHTML = orderedDays.map((weekday, index) => {
      const date = addDays(weekStart, index);
      const events = schedules.filter((schedule) => schedule.days.includes(weekday));
      const isToday = dateToISO(date) === dateToISO(today);
      const isCollection = events.length > 0;
      const month = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(date);
      const accessibleDate = `${DAY_NAMES[weekday]} ${date.getDate()} de ${month}${isToday ? ", hoy" : ""}`;
      const eventNames = events.map((schedule) => schedule.name).join(", ");
      const shortLabel = events.length
        ? `${events[0].name.split(" ")[0]}${events.length > 1 ? ` +${events.length - 1}` : ""}`
        : "";

      const dots = events.map((schedule) => `
        <span class="day-event-dot" style="--event-color:${schedule.color}" title="${escapeHTML(schedule.name)}"></span>
      `).join("");

      return `
        <div class="week-day${isCollection ? " is-collection" : ""}${isToday ? " is-today" : ""}"
          aria-label="${escapeHTML(accessibleDate)}${eventNames ? `: ${escapeHTML(eventNames)}` : ": sin recolección"}">
          <span class="week-day-name">${SHORT_DAY_NAMES[weekday]}</span>
          <span class="week-day-number">${date.getDate()}</span>
          <div class="week-day-dots" aria-hidden="true">${dots}</div>
          <span class="week-day-label">${escapeHTML(shortLabel)}</span>
          <span class="sr-only">${eventNames ? `Recolección: ${escapeHTML(eventNames)}.` : "Sin recolección."}</span>
        </div>
      `;
    }).join("");
  }

  function renderScheduleList(schedules, next) {
    const list = $("#scheduleList");
    if (!list) return;

    if (!schedules.length) {
      list.innerHTML = `<div class="schedule-empty">No hay horarios cargados para este barrio.</div>`;
      return;
    }

    list.innerHTML = schedules.map((schedule) => {
      const frequency = `${schedule.days.length}× por semana`;
      const nextOccurrence = next && next.schedule.key === schedule.key
        ? `<span class="schedule-next-label">Próx.: ${escapeHTML(formatCompactRelativeDate(next.date))}</span>`
        : "";
      return `
        <article class="schedule-item" style="--event-color:${schedule.color}">
          <span class="schedule-icon" aria-hidden="true">
            <svg class="icon"><use href="#${schedule.icon}"></use></svg>
          </span>
          <div class="schedule-copy">
            <div class="schedule-title-row">
              <h4>${escapeHTML(schedule.name)}</h4>
              <span class="schedule-frequency">${frequency}</span>
            </div>
            <p class="schedule-description">${escapeHTML(schedule.description)}</p>
            <p class="schedule-days">
              <span><svg class="icon" aria-hidden="true"><use href="#i-calendar"></use></svg>${escapeHTML(joinDays(schedule.days))}</span>
              <span><svg class="icon" aria-hidden="true"><use href="#i-clock"></use></svg>${escapeHTML(schedule.time)}</span>
              ${nextOccurrence}
            </p>
          </div>
        </article>
      `;
    }).join("");
  }

  function formatCompactRelativeDate(date) {
    const offset = daysBetween(new Date(), date);
    if (offset === 0) return "hoy";
    if (offset === 1) return "mañana";
    return new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(date);
  }

  function formatNextCollectionDate(date) {
    const offset = daysBetween(new Date(), date);
    if (offset === 0) return `Hoy, ${formatLongDate(date).toLowerCase()}`;
    if (offset === 1) return `Mañana, ${formatLongDate(date).toLowerCase()}`;
    return formatLongDate(date);
  }

  function renderNextCollection(next) {
    const type = $("#nextType");
    const date = $("#nextDate");
    const time = $("#nextTime");
    const neighborhood = $("#nextNeighborhood");
    const iconContainer = $("#nextIcon");
    const iconUse = iconContainer?.querySelector("use");

    if (!next) {
      if (type) type.textContent = "Sin horarios";
      if (date) date.textContent = "No hay recolección programada";
      if (time) time.textContent = "Consultá con tu municipio";
      if (neighborhood) neighborhood.textContent = state.neighborhood;
      return;
    }

    if (type) type.textContent = next.schedule.name;
    if (date) date.textContent = formatNextCollectionDate(next.date);
    if (time) time.textContent = next.schedule.time;
    if (neighborhood) neighborhood.textContent = state.neighborhood;
    if (iconContainer) {
      iconContainer.dataset.tone = next.schedule.key === "organicos" ? "organico" : next.schedule.key;
    }
    iconUse?.setAttribute("href", `#${next.schedule.icon}`);

    const reminderButton = $("#reminderToggle");
    if (reminderButton) {
      const active = Boolean(state.reminder.enabled);
      reminderButton.setAttribute("aria-pressed", String(active));
      const text = reminderButton.querySelector("span");
      const buttonIcon = reminderButton.querySelector("use");
      if (text) text.textContent = active ? "Recordatorio activo" : "Activar recordatorio";
      buttonIcon?.setAttribute("href", active ? "#i-bell-off" : "#i-bell");
    }
  }

  function renderReminderState(next) {
    const notice = $("#reminderNotice");
    const noticeText = $("#reminderNoticeText");
    if (!notice) return;

    const active = Boolean(state.reminder.enabled);
    if (!active || !next) {
      notice.hidden = true;
      return;
    }

    notice.hidden = false;
    if (noticeText) {
      noticeText.textContent = `${next.schedule.name} · ${formatNextCollectionDate(next.date)} · ${next.schedule.time}. Te avisaremos un día antes (aviso simulado).`;
    }
  }

  /* ========================================================================
     13. MI SEGUIMIENTO: FORMULARIO, MÉTRICAS Y LOGROS
     ======================================================================== */

  function initTracking() {
    populateMaterialSelect();
    setupTrackingDate();
    renderTracking();

    const form = $("#trackingForm");
    form?.addEventListener("submit", handleTrackingSubmit);

    $("#recordMaterial")?.addEventListener("change", () => clearTrackingField("#recordMaterial", "#materialError"));
    $("#recordQuantity")?.addEventListener("input", () => clearTrackingField("#recordQuantity", "#quantityError"));
    $("#recordDate")?.addEventListener("input", () => clearTrackingField("#recordDate", "#dateError"));
    $("#recordDate")?.addEventListener("change", () => clearTrackingField("#recordDate", "#dateError"));

    $$(".segmented [data-trend]").forEach((button) => {
      button.addEventListener("click", () => {
        state.trendMode = button.dataset.trend === "month" ? "month" : "week";
        $$(".segmented [data-trend]").forEach((otherButton) => {
          const active = otherButton === button;
          otherButton.classList.toggle("is-active", active);
          otherButton.setAttribute("aria-pressed", String(active));
        });
        renderCharts();
      });
    });

    $("#exportBtn")?.addEventListener("click", exportRecordsCSV);
    $("#clearDataBtn")?.addEventListener("click", openClearDialog);
    $("#cancelClearBtn")?.addEventListener("click", closeClearDialog);
    $("#confirmClearBtn")?.addEventListener("click", clearAllRecords);
    $("#scrollToForm")?.addEventListener("click", () => {
      scrollToSection("seguimiento", "#recordMaterial");
    });

    state.trackingReady = true;
    renderCharts();
  }

  function populateMaterialSelect() {
    const select = $("#recordMaterial");
    if (!select) return;
    const current = select.value;
    select.innerHTML = `
      <option value="">Elegí un material</option>
      ${MATERIALS.map((material) => `<option value="${material.key}">${escapeHTML(material.label)}</option>`).join("")}
    `;
    if (current && MATERIAL_MAP[current]) select.value = current;
  }

  function setupTrackingDate() {
    const dateInput = $("#recordDate");
    if (!dateInput) return;
    const today = todayISO();
    dateInput.max = today;
    if (!dateInput.value) dateInput.value = today;
  }

  function clearTrackingField(inputSelector, errorSelector) {
    const input = $(inputSelector);
    const error = $(errorSelector);
    input?.closest(".field")?.classList.remove("has-error");
    input?.setAttribute("aria-invalid", "false");
    if (error) error.textContent = "";
  }

  function clearTrackingErrors() {
    clearTrackingField("#recordMaterial", "#materialError");
    clearTrackingField("#recordQuantity", "#quantityError");
    clearTrackingField("#recordDate", "#dateError");
  }

  function setTrackingError(inputSelector, errorSelector, message) {
    const input = $(inputSelector);
    const error = $(errorSelector);
    input?.closest(".field")?.classList.add("has-error");
    input?.setAttribute("aria-invalid", "true");
    if (error) error.textContent = message;
  }

  function handleTrackingSubmit(event) {
    event.preventDefault();
    clearTrackingErrors();

    const material = $("#recordMaterial")?.value || "";
    const quantityInput = $("#recordQuantity");
    const dateInput = $("#recordDate");
    const quantityText = String(quantityInput?.value || "").trim().replace(",", ".");
    const quantity = Number(quantityText);
    const date = dateInput?.value || "";
    let firstInvalid = null;

    if (!MATERIAL_MAP[material]) {
      setTrackingError("#recordMaterial", "#materialError", "Elegí el material que reciclaste.");
      firstInvalid = $("#recordMaterial");
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setTrackingError("#recordQuantity", "#quantityError", "Ingresá una cantidad mayor a 0 kg.");
      if (!firstInvalid) firstInvalid = quantityInput;
    } else if (quantity > 1000) {
      setTrackingError("#recordQuantity", "#quantityError", "Por ahora podés registrar hasta 1000 kg por vez.");
      if (!firstInvalid) firstInvalid = quantityInput;
    }

    if (!date) {
      setTrackingError("#recordDate", "#dateError", "Elegí la fecha del registro.");
      if (!firstInvalid) firstInvalid = dateInput;
    } else if (!isoToDate(date)) {
      setTrackingError("#recordDate", "#dateError", "La fecha no es válida.");
      if (!firstInvalid) firstInvalid = dateInput;
    } else if (date > todayISO()) {
      setTrackingError("#recordDate", "#dateError", "La fecha no puede ser futura.");
      if (!firstInvalid) firstInvalid = dateInput;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const previousStats = getTrackingStats(state.records);
    const previousUnlocked = new Set(
      getAchievementData(previousStats).filter((achievement) => achievement.unlocked).map((achievement) => achievement.id)
    );

    state.records.push({
      id: makeId("record"),
      material,
      kg: Math.round(quantity * 100) / 100,
      date
    });
    storageSet(STORAGE_KEYS.records, state.records);

    if (quantityInput) quantityInput.value = "";
    if (dateInput) dateInput.value = todayISO();
    setupTrackingDate();

    renderTracking();
    showToast(`${formatKg(quantity)} kg de ${MATERIAL_MAP[material].label.toLowerCase()} registrados. ¡Buen trabajo!`);

    const updatedStats = getTrackingStats(state.records);
    const newAchievements = getAchievementData(updatedStats)
      .filter((achievement) => achievement.unlocked && !previousUnlocked.has(achievement.id));

    if (newAchievements.length) {
      const titles = newAchievements.map((achievement) => `“${achievement.title}”`).join(", ");
      window.setTimeout(() => {
        showToast(`Nuevo logro desbloqueado: ${titles}.`, "success", 5600);
      }, 650);
    }

    $("#recordQuantity")?.focus();
  }

  function renderTracking() {
    const stats = getTrackingStats(state.records);
    const totalElement = $("#statTotalKg");
    const totalMeta = $("#statTotalMeta");
    const recordsElement = $("#statRecords");
    const streakElement = $("#statStreak");
    const streakMeta = $("#streakMeta");
    const topMaterialElement = $("#statTopMaterial");
    const topMaterialMeta = $("#statTopMaterialMeta");
    const exportButton = $("#exportBtn");
    const clearButton = $("#clearDataBtn");

    if (totalElement) totalElement.textContent = formatKg(stats.total);
    if (totalMeta) totalMeta.textContent = `${formatKg(stats.monthlyTotal)} kg registrados este mes`;
    if (recordsElement) recordsElement.textContent = String(stats.count);
    if (streakElement) streakElement.textContent = String(stats.currentStreak);

    if (streakMeta) {
      if (stats.currentStreak > 0) {
        streakMeta.textContent = `Máximo histórico: ${pluralize(stats.maxStreak, "día", "días")}`;
      } else if (stats.count > 0) {
        streakMeta.textContent = "Registrá hoy para retomar la racha";
      } else {
        streakMeta.textContent = "Registrá hoy para empezar";
      }
    }

    if (topMaterialElement && topMaterialMeta) {
      if (stats.topMaterial) {
        const topKg = stats.byMaterial[stats.topMaterial.key];
        const share = stats.total > 0 ? Math.round((topKg / stats.total) * 100) : 0;
        topMaterialElement.textContent = stats.topMaterial.short;
        topMaterialMeta.textContent = `${formatKg(topKg)} kg · ${share}% del total`;
      } else {
        topMaterialElement.textContent = "—";
        topMaterialMeta.textContent = "Todavía sin datos";
      }
    }

    if (exportButton) exportButton.disabled = stats.count === 0;
    if (clearButton) clearButton.disabled = stats.count === 0;

    renderAchievements(stats);
    renderCharts();
    refreshHeroDashboard();
  }

  function getAchievementData(stats) {
    const definitions = [
      {
        id: "first-kg",
        icon: "🌱",
        title: "Primer kilo",
        description: "Registrá al menos 1 kg reciclado.",
        value: stats.total,
        target: 1,
        progressText: `${formatKg(Math.min(stats.total, 1))} / 1 kg`
      },
      {
        id: "plastic-10",
        icon: "🧴",
        title: "Plástico en serio",
        description: "Acumulá 10 kg de plástico.",
        value: stats.byMaterial.plastico,
        target: 10,
        progressText: `${formatKg(Math.min(stats.byMaterial.plastico, 10))} / 10 kg`
      },
      {
        id: "five-records",
        icon: "📅",
        title: "Constancia",
        description: "Completá 5 registros de reciclaje.",
        value: stats.count,
        target: 5,
        progressText: `${Math.min(stats.count, 5)} / 5 registros`
      },
      {
        id: "diverse-materials",
        icon: "🎨",
        title: "Mezcla perfecta",
        description: "Reciclá al menos 4 materiales distintos.",
        value: stats.distinctMaterials,
        target: 4,
        progressText: `${Math.min(stats.distinctMaterials, 4)} / 4 materiales`
      },
      {
        id: "streak-7",
        icon: "🔥",
        title: "Racha verde",
        description: "Alcanzá 7 días consecutivos reciclando.",
        value: stats.maxStreak,
        target: 7,
        progressText: `${Math.min(stats.maxStreak, 7)} / 7 días`
      },
      {
        id: "club-50",
        icon: "🏆",
        title: "Club de los 50",
        description: "Llegá a 50 kg reciclados en total.",
        value: stats.total,
        target: 50,
        progressText: `${formatKg(Math.min(stats.total, 50))} / 50 kg`
      }
    ];

    return definitions.map((definition) => {
      const unlocked = definition.value >= definition.target;
      return {
        ...definition,
        unlocked,
        progress: clamp((definition.value / definition.target) * 100, 0, 100)
      };
    });
  }

  function renderAchievements(stats) {
    const grid = $("#achievementsGrid");
    const count = $("#achievementCount");
    if (!grid) return;

    const achievements = getAchievementData(stats);
    const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
    if (count) count.textContent = `${unlockedCount}/${achievements.length}`;

    grid.innerHTML = achievements.map((achievement) => `
      <article class="achievement ${achievement.unlocked ? "is-unlocked" : "is-locked"}"
        aria-label="${escapeHTML(achievement.title)}. ${achievement.unlocked ? "Desbloqueado" : "Bloqueado"}. ${escapeHTML(achievement.description)}">
        <span class="achievement-icon" aria-hidden="true">${achievement.icon}</span>
        <div class="achievement-copy">
          <div class="achievement-title-row">
            <h4>${escapeHTML(achievement.title)}</h4>
            <span class="achievement-state">${achievement.unlocked ? "Logrado" : "Bloqueado"}</span>
          </div>
          <p>${escapeHTML(achievement.description)}</p>
          <div class="achievement-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"
            aria-valuenow="${Math.round(achievement.progress)}" aria-label="Progreso de ${escapeHTML(achievement.title)}">
            <span style="width:${achievement.progress.toFixed(1)}%"></span>
          </div>
          <span class="achievement-progress-label">${achievement.unlocked ? "Completado" : escapeHTML(achievement.progressText)}</span>
        </div>
      </article>
    `).join("");
  }

  /* --- Exportación y borrado --- */
  function csvEscape(value) {
    const text = String(value);
    if (/[",\r\n]/.test(text)) {
      return `"${text.replaceAll('"', '""')}"`;
    }
    return text;
  }

  function exportRecordsCSV() {
    if (!state.records.length) {
      showToast("Todavía no hay registros para exportar.", "info");
      return;
    }

    const header = ["Material", "Cantidad (kg)", "Fecha"];
    const rows = state.records
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((record) => [
        MATERIAL_MAP[record.material]?.label || record.material,
        String(record.kg).replace(".", ","),
        record.date
      ]);

    const csv = [header, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\r\n");

    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ecopunto-registros-${todayISO()}.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`${pluralize(state.records.length, "registro exportado", "registros exportados")} en CSV.`);
  }

  function openClearDialog() {
    if (!state.records.length) {
      showToast("No hay registros para borrar.", "info");
      return;
    }

    const dialog = $("#clearDialog");
    if (dialog && typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else if (window.confirm("¿Querés borrar todos tus registros de reciclaje?")) {
      clearAllRecords();
    }
  }

  function closeClearDialog() {
    const dialog = $("#clearDialog");
    if (dialog?.open) dialog.close();
  }

  function clearAllRecords() {
    state.records = [];
    storageSet(STORAGE_KEYS.records, state.records);
    closeClearDialog();
    renderTracking();
    showToast("Tus registros de reciclaje fueron eliminados.", "info");
  }

  /* ========================================================================
     14. GRÁFICOS DE IMPACTO
     ======================================================================== */

  function getChartTheme() {
    const styles = getComputedStyle(document.documentElement);
    const readToken = (token, fallback) => styles.getPropertyValue(token).trim() || fallback;
    const isDark = document.documentElement.dataset.theme === "dark";

    return {
      isDark,
      brand: readToken("--brand", "#187a4d"),
      ink: readToken("--ink", "#17332a"),
      muted: readToken("--muted", "#637970"),
      line: readToken("--line", "#dfe8dc"),
      surface: readToken("--surface", "#ffffff"),
      fontFamily: getComputedStyle(document.body).fontFamily || "Plus Jakarta Sans, sans-serif",
      tooltipBg: isDark ? "#1b3628" : "#17332a",
      tooltipText: "#f3faf5"
    };
  }

  function colorWithAlpha(color, alpha) {
    const value = String(color).trim();
    const shortHex = /^#([0-9a-f]{3})$/i.exec(value);
    const longHex = /^#([0-9a-f]{6})$/i.exec(value);
    let red;
    let green;
    let blue;

    if (shortHex) {
      red = parseInt(shortHex[1][0].repeat(2), 16);
      green = parseInt(shortHex[1][1].repeat(2), 16);
      blue = parseInt(shortHex[1][2].repeat(2), 16);
    } else if (longHex) {
      red = parseInt(longHex[1].slice(0, 2), 16);
      green = parseInt(longHex[1].slice(2, 4), 16);
      blue = parseInt(longHex[1].slice(4, 6), 16);
    } else {
      return value;
    }

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  function getWeeklyTrend(records) {
    const currentWeekStart = getWeekStart(new Date());
    const buckets = [];

    for (let offset = 7; offset >= 0; offset -= 1) {
      const start = addDays(currentWeekStart, -7 * offset);
      const end = addDays(start, 6);
      const total = records.reduce((sum, record) => {
        const date = isoToDate(record.date);
        if (!date) return sum;
        const timestamp = startOfDay(date).getTime();
        return timestamp >= start.getTime() && timestamp <= end.getTime()
          ? sum + (Number(record.kg) || 0)
          : sum;
      }, 0);

      buckets.push({
        label: formatShortDate(start),
        fullLabel: `${formatShortDate(start)} al ${formatShortDate(end)}`,
        value: Math.round(total * 10) / 10
      });
    }

    return buckets;
  }

  function getMonthlyTrend(records) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const buckets = [];

    for (let offset = 5; offset >= 0; offset -= 1) {
      const start = new Date(
        currentMonthStart.getFullYear(),
        currentMonthStart.getMonth() - offset,
        1
      );
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      const total = records.reduce((sum, record) => {
        const date = isoToDate(record.date);
        if (!date) return sum;
        const timestamp = startOfDay(date).getTime();
        return timestamp >= start.getTime() && timestamp <= end.getTime()
          ? sum + (Number(record.kg) || 0)
          : sum;
      }, 0);

      buckets.push({
        label: capitalize(
          new Intl.DateTimeFormat("es-AR", { month: "short" }).format(start).replace(".", "")
        ),
        fullLabel: capitalize(
          new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(start)
        ),
        value: Math.round(total * 10) / 10
      });
    }

    return buckets;
  }

  function setChartEmptyState(canvas, emptyElement, isEmpty, message) {
    if (emptyElement) {
      emptyElement.hidden = !isEmpty;
      if (isEmpty && message) {
        const paragraph = emptyElement.querySelector("p");
        if (paragraph) paragraph.textContent = message;
      }
    }

    if (canvas) {
      canvas.hidden = isEmpty;
      canvas.style.display = isEmpty ? "none" : "";
      if (isEmpty) {
        canvas.setAttribute("aria-hidden", "true");
      } else {
        canvas.removeAttribute("aria-hidden");
      }
    }
  }

  function destroyChart(name) {
    const chart = state.charts[name];
    if (chart && typeof chart.destroy === "function") {
      try {
        chart.destroy();
      } catch (error) {
        // Si el gráfico ya fue descartado, seguimos con la siguiente renderización.
      }
    }
    state.charts[name] = null;
  }

  function renderCharts() {
    const barCanvas = $("#materialChart");
    const trendCanvas = $("#trendChart");
    const barEmpty = $("#barEmpty");
    const trendEmpty = $("#trendEmpty");
    if (!barCanvas || !trendCanvas) return;

    destroyChart("material");
    destroyChart("trend");

    if (typeof window.Chart !== "function") {
      setChartEmptyState(
        barCanvas,
        barEmpty,
        true,
        "No pudimos cargar la librería de gráficos. Revisá tu conexión y recargá la página."
      );
      setChartEmptyState(
        trendCanvas,
        trendEmpty,
        true,
        "No pudimos cargar la librería de gráficos. Revisá tu conexión y recargá la página."
      );
      return;
    }

    const stats = getTrackingStats(state.records);
    const theme = getChartTheme();
    const tickFont = { family: theme.fontFamily, size: 11, weight: "600" };
    const axisTitleFont = { family: theme.fontFamily, size: 10, weight: "700" };
    const animation = prefersReducedMotion()
      ? false
      : { duration: 650, easing: "easeOutQuart" };

    const materialData = MATERIALS
      .map((material) => ({ material, value: stats.byMaterial[material.key] || 0 }))
      .filter((entry) => entry.value > 0);

    const hasMaterialData = materialData.length > 0;
    setChartEmptyState(barCanvas, barEmpty, !hasMaterialData);

    if (hasMaterialData) {
      try {
        const labels = materialData.map((entry) => entry.material.short);
        const values = materialData.map((entry) => Math.round(entry.value * 10) / 10);

        state.charts.material = new window.Chart(barCanvas, {
          type: "bar",
          data: {
            labels,
            datasets: [{
              label: "Kilogramos reciclados",
              data: values,
              backgroundColor: materialData.map((entry) => colorWithAlpha(entry.material.color, 0.78)),
              borderColor: materialData.map((entry) => entry.material.color),
              borderWidth: 1,
              borderRadius: 8,
              borderSkipped: false,
              maxBarThickness: 46
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation,
            layout: { padding: { top: 6, right: 6 } },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: theme.tooltipBg,
                titleColor: theme.tooltipText,
                bodyColor: theme.tooltipText,
                borderColor: colorWithAlpha(theme.line, 0.3),
                borderWidth: 1,
                padding: 10,
                cornerRadius: 10,
                displayColors: false,
                callbacks: {
                  label: (context) => `${formatKg(context.parsed.y)} kg`
                }
              }
            },
            scales: {
              x: {
                border: { display: false },
                grid: { display: false },
                ticks: {
                  color: theme.muted,
                  font: tickFont,
                  autoSkip: false,
                  maxRotation: 32,
                  minRotation: 0
                }
              },
              y: {
                beginAtZero: true,
                border: { display: false },
                grid: { color: colorWithAlpha(theme.line, 0.75), drawTicks: false },
                ticks: {
                  color: theme.muted,
                  font: tickFont,
                  padding: 8,
                  callback: (value) => formatInteger(value)
                },
                title: {
                  display: true,
                  text: "kg",
                  color: theme.muted,
                  font: axisTitleFont
                }
              }
            }
          }
        });
      } catch (error) {
        setChartEmptyState(
          barCanvas,
          barEmpty,
          true,
          "No pudimos dibujar este gráfico. Probá recargar la página."
        );
      }
    }

    const trendData = state.trendMode === "month"
      ? getMonthlyTrend(state.records)
      : getWeeklyTrend(state.records);
    const hasTrendData = trendData.some((bucket) => bucket.value > 0);
    const emptyTrendMessage = state.records.length
      ? "No hay registros en este período. Probá con otra vista o sumá un aporte."
      : undefined;
    setChartEmptyState(trendCanvas, trendEmpty, !hasTrendData, emptyTrendMessage);

    if (hasTrendData) {
      try {
        const periodLabel = state.trendMode === "month" ? "Mes" : "Semana";

        state.charts.trend = new window.Chart(trendCanvas, {
          type: "line",
          data: {
            labels: trendData.map((bucket) => bucket.label),
            datasets: [{
              label: "Kilogramos reciclados",
              data: trendData.map((bucket) => bucket.value),
              fullLabels: trendData.map((bucket) => bucket.fullLabel),
              borderColor: theme.brand,
              backgroundColor: colorWithAlpha(theme.brand, 0.13),
              fill: true,
              tension: 0.34,
              borderWidth: 2.5,
              pointRadius: 3.5,
              pointHoverRadius: 6,
              pointBackgroundColor: theme.surface,
              pointBorderColor: theme.brand,
              pointBorderWidth: 2,
              pointHoverBorderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation,
            interaction: { mode: "index", intersect: false },
            layout: { padding: { top: 8, right: 8 } },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: theme.tooltipBg,
                titleColor: theme.tooltipText,
                bodyColor: theme.tooltipText,
                borderColor: colorWithAlpha(theme.line, 0.3),
                borderWidth: 1,
                padding: 10,
                cornerRadius: 10,
                displayColors: false,
                callbacks: {
                  title: (items) => {
                    const index = items[0]?.dataIndex ?? 0;
                    return trendData[index]?.fullLabel || items[0]?.label || "";
                  },
                  label: (context) => `${formatKg(context.parsed.y)} kg`
                }
              }
            },
            scales: {
              x: {
                border: { display: false },
                grid: { display: false },
                ticks: {
                  color: theme.muted,
                  font: tickFont,
                  maxRotation: 0,
                  autoSkip: false
                }
              },
              y: {
                beginAtZero: true,
                border: { display: false },
                grid: { color: colorWithAlpha(theme.line, 0.75), drawTicks: false },
                ticks: {
                  color: theme.muted,
                  font: tickFont,
                  padding: 8,
                  callback: (value) => formatInteger(value)
                },
                title: {
                  display: true,
                  text: `kg por ${periodLabel.toLowerCase()}`,
                  color: theme.muted,
                  font: axisTitleFont
                }
              }
            }
          }
        });
      } catch (error) {
        setChartEmptyState(
          trendCanvas,
          trendEmpty,
          true,
          "No pudimos dibujar este gráfico. Probá recargar la página."
        );
      }
    }
  }

  /* ========================================================================
     15. FORMULARIO DE CONTACTO (DEMO)
     ======================================================================== */

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
  }

  function initContact() {
    const form = $("#contactForm");
    if (!form) return;

    const nameInput = $("#contactName");
    const emailInput = $("#contactEmail");
    const messageInput = $("#contactMessage");
    const feedback = $("#contactFeedback");
    const fields = [nameInput, emailInput, messageInput].filter(Boolean);

    const resetContactState = () => {
      fields.forEach((field) => {
        field.closest(".field")?.classList.remove("has-error");
        field.setAttribute("aria-invalid", "false");
      });
      if (feedback) {
        feedback.textContent = "";
        feedback.classList.remove("is-error");
      }
    };

    fields.forEach((field) => field.addEventListener("input", resetContactState));

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      resetContactState();

      const name = (nameInput?.value || "").trim();
      const email = (emailInput?.value || "").trim();
      const message = (messageInput?.value || "").trim();
      let invalidField = null;
      let errorMessage = "";

      if (name.length < 2) {
        invalidField = nameInput;
        errorMessage = "Contanos tu nombre para poder responderte.";
      } else if (!isValidEmail(email)) {
        invalidField = emailInput;
        errorMessage = "Revisá el email: parece que falta algo.";
      } else if (message.length < 10) {
        invalidField = messageInput;
        errorMessage = "Escribí un mensaje un poco más largo (mínimo 10 caracteres).";
      }

      if (errorMessage) {
        invalidField?.closest(".field")?.classList.add("has-error");
        invalidField?.setAttribute("aria-invalid", "true");
        if (feedback) {
          feedback.textContent = errorMessage;
          feedback.classList.add("is-error");
        }
        invalidField?.focus();
        return;
      }

      form.reset();
      if (feedback) {
        feedback.textContent = `¡Gracias, ${name}! Tu mensaje quedó registrado en esta demostración. No se envía a ningún servidor.`;
        feedback.classList.remove("is-error");
      }
      showToast("Mensaje registrado en esta demo. ¡Gracias por escribirnos!");
      fields[0]?.focus();
    });
  }

  /* ========================================================================
     16. INICIALIZACIÓN GENERAL
     ======================================================================== */

  function initClearDialog() {
    const dialog = $("#clearDialog");
    if (!dialog) return;

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeClearDialog();
    });

    dialog.addEventListener("close", () => {
      const clearButton = $("#clearDataBtn");
      if (clearButton && !clearButton.disabled) {
        clearButton.focus();
      } else {
        $("#recordMaterial")?.focus();
      }
    });
  }

  function initYear() {
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function init() {
    initTheme();
    initNavigation();
    initHero();
    initMap();
    initReporting();
    initGuide();
    initCalendar();
    initTracking();
    initContact();
    initClearDialog();
    initScrollUI();
    initScrollSpy();
    initRevealAnimations();
    initYear();

    if (!storageAvailable) {
      window.setTimeout(() => {
        showToast(
          "Tu navegador bloqueó el almacenamiento local. La app funciona, pero los cambios no se conservarán al cerrar.",
          "error",
          7000
        );
      }, 900);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
