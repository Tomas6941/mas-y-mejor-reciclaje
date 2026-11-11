import type { MaterialKey, WasteCategory, WasteCategoryKey } from '@/types/domain';

/** Orden de las categorías de materiales reciclables. */
export const CATEGORY_ORDER: MaterialKey[] = [
  'papel',
  'plastico',
  'vidrio',
  'metal',
  'organico',
  'electronicos',
  'pilas',
];

/** Todas las categorías de la guía, incluidos los residuos comunes. */
export const ALL_CATEGORY_KEYS: WasteCategoryKey[] = [...CATEGORY_ORDER, 'general'];

export const CATEGORIES: Record<WasteCategoryKey, WasteCategory> = {
  papel: {
    key: 'papel',
    label: 'Papel y cartón',
    shortLabel: 'Papel',
    container: 'Contenedor azul',
    description:
      'El papel y el cartón limpios y secos vuelven a convertirse en nuevos cuadernos, cajas y packaging.',
    yes: [
      'Diarios, revistas y folletos',
      'Cajas de cartón desarmadas',
      'Papel de oficina limpio',
      'Cuadernos sin espiral metálica',
    ],
    no: [
      'Papel higiénico o servilletas usadas',
      'Cajas de pizza con mucha grasa',
      'Papel plastificado o con brillantina',
      'Cartón mojado o encerado',
    ],
    tip: 'Plegá las cajas para ocupar menos lugar y mantené el papel seco. Si está engrasado, va a residuos comunes.',
    optionLabel: 'Contenedor azul · Papel y cartón',
  },
  plastico: {
    key: 'plastico',
    label: 'Plástico',
    shortLabel: 'Plástico',
    container: 'Contenedor amarillo',
    description:
      'Envases plásticos limpios se transforman en nuevos envases, madera plástica, caños y textiles.',
    yes: [
      'Botellas y bidones limpios',
      'Envases de yogur y shampoo',
      'Tapitas y potes',
      'Bolsas de acarreo limpias',
    ],
    no: ['Vasos de telgopor', 'Sachets metalizados', 'Juguetes de plástico', 'Envases con restos de comida'],
    tip: 'Enjuagá, vaciá y aplastá los envases para que ocupen menos espacio. Las tapitas también van al amarillo.',
    optionLabel: 'Contenedor amarillo · Plásticos',
  },
  vidrio: {
    key: 'vidrio',
    label: 'Vidrio',
    shortLabel: 'Vidrio',
    container: 'Contenedor verde',
    description: 'El vidrio de envase es 100% reciclable y puede volver a la cadena productiva infinitas veces.',
    yes: [
      'Botellas de vidrio',
      'Frascos limpios y sin tapa',
      'Frascos de conserva',
      'Vidrio de envases de alimentos',
    ],
    no: ['Espejos y vidrios laminados', 'Cerámica, loza o porcelana', 'Focos y lámparas', 'Vasos y vidrios rotos'],
    tip: 'Retirá tapas y etiquetas, enjuagá el frasco y llevalo con cuidado. El vidrio roto debe ir envuelto a residuos comunes.',
    optionLabel: 'Contenedor verde · Vidrio',
  },
  metal: {
    key: 'metal',
    label: 'Metal',
    shortLabel: 'Metal',
    container: 'Contenedor gris',
    description: 'Latas y metales se funden para crear nuevos productos con un enorme ahorro de energía y recursos.',
    yes: ['Latas de bebidas', 'Latas de conserva', 'Tapas metálicas', 'Papel aluminio limpio'],
    no: [
      'Aerosoles con contenido',
      'Envases con pintura o solvente',
      'Electrodomésticos de gran tamaño',
      'Metal con restos peligrosos',
    ],
    tip: 'Enjuagá las latas y aplastalas si podés. Los aerosoles vacíos deben tener el pico protegido y ser aceptados en un punto específico.',
    optionLabel: 'Contenedor gris · Metales',
  },
  organico: {
    key: 'organico',
    label: 'Orgánico',
    shortLabel: 'Orgánico',
    container: 'Contenedor marrón',
    description: 'Los restos orgánicos vuelven a la tierra como compost, un abono natural que nutre suelos y plantas.',
    yes: [
      'Restos de fruta y verdura',
      'Yerba mate y café usados',
      'Cáscaras de huevo',
      'Poda, flores y restos de jardín',
    ],
    no: [
      'Plásticos y envoltorios',
      'Aceite usado',
      'Pañales o residuos sanitarios',
      'Grandes cantidades de carne, lácteos o huesos',
    ],
    tip: 'Escurrí los restos y no mezcles envoltorios. Si tenés compostera en casa, la mejor opción es compostar ahí.',
    optionLabel: 'Contenedor marrón · Orgánicos',
  },
  electronicos: {
    key: 'electronicos',
    label: 'Electrónicos',
    shortLabel: 'Electrónicos',
    container: 'Punto verde de RAEE',
    description: 'Los aparatos electrónicos tienen metales y componentes recuperables que no deben terminar en la basura.',
    yes: ['Celulares y cargadores', 'Cables y auriculares', 'Notebooks y tablets', 'Pequeños electrodomésticos'],
    no: [
      'Electrodomésticos grandes sin coordinar',
      'Tubos fluorescentes',
      'Medicamentos vencidos',
      'Residuos peligrosos sin identificar',
    ],
    tip: 'Borrá tus datos personales antes de entregar un dispositivo. No los dejes en la vía pública.',
    optionLabel: 'Punto verde · Electrónicos',
  },
  pilas: {
    key: 'pilas',
    label: 'Pilas y baterías',
    shortLabel: 'Pilas',
    container: 'Punto especial de pilas',
    description: 'Las pilas contienen metales pesados. Van a un punto especial, nunca a la bolsa de residuos comunes.',
    yes: ['Pilas AA, AAA y C', 'Pilas botón', 'Baterías de litio de celular', 'Pequeñas baterías recargables'],
    no: [
      'Pilas tiradas a la basura común',
      'Baterías de auto o moto',
      'Mezclarlas con reciclables',
      'Pilas hinchadas sin protección',
    ],
    tip: 'Pegá cinta en los polos de las pilas para evitar cortocircuitos y guardalas en un frasco seco hasta llevarlas al punto especial.',
    optionLabel: 'Punto especial · Pilas y baterías',
  },
  general: {
    key: 'general',
    label: 'Residuos comunes',
    shortLabel: 'Comunes',
    container: 'Bolsa de residuos comunes',
    description:
      'Este residuo no se recupera en los contenedores de reciclaje. Va a la bolsa de residuos comunes para evitar contaminar el resto.',
    yes: [
      'Residuos de higiene',
      'Materiales con restos de comida o grasa',
      'Telgopor y plásticos metalizados',
      'Vidrios o cerámicas rotas, bien envueltos',
    ],
    no: [
      'Mezclar residuos peligrosos',
      'Volcar líquidos en la bolsa',
      'Desechar pilas o electrónicos',
      'Dejar vidrio roto sin proteger',
    ],
    tip: 'Antes de descartarlo, verificá si un punto verde de tu barrio recibe este material de forma especial.',
    optionLabel: 'Bolsa de residuos comunes',
  },
};
