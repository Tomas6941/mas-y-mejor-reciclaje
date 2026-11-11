import type { QuizQuestion } from '@/types/domain';

/** Banco de preguntas del mini quiz. Cada partida toma 5 al azar. */
export const QUIZ_BANK: QuizQuestion[] = [
  {
    question: '¿En qué contenedor va una lata de gaseosa?',
    category: 'metal',
    explanation: 'Las latas son metal reciclable. Vacíalas, enjuagalas y aplastalas si podés.',
  },
  {
    question: '¿Dónde va una caja de pizza limpia y sin restos?',
    category: 'papel',
    explanation: 'El cartón limpio va al contenedor azul. Si está muy engrasada, va a residuos comunes.',
  },
  {
    question: '¿Qué hacés con una pila AAA usada?',
    category: 'pilas',
    explanation: 'Las pilas tienen metales pesados y van a un punto especial. Nunca a la bolsa común.',
  },
  {
    question: '¿Dónde va una botella de vidrio vacía?',
    category: 'vidrio',
    explanation: 'El vidrio de envase va al contenedor verde. Retirá la tapa y enjuagá el envase.',
  },
  {
    question: '¿En qué contenedor va una cáscara de banana?',
    category: 'organico',
    explanation: 'Los restos de fruta son orgánicos y se transforman en compost en el contenedor marrón.',
  },
  {
    question: '¿Dónde llevás un celular viejo que ya no funciona?',
    category: 'electronicos',
    explanation: 'Los electrónicos son RAEE y necesitan un punto verde especial para recuperar sus componentes.',
  },
  {
    question: '¿Dónde va una botella de agua plástica vacía?',
    category: 'plastico',
    explanation: 'Los envases plásticos limpios van al contenedor amarillo. Enjuagalos y aplastálos.',
  },
  {
    question: '¿En qué contenedor va un vaso de telgopor?',
    category: 'general',
    explanation: 'El telgopor no se recicla en estos contenedores: va a la bolsa de residuos comunes.',
  },
  {
    question: '¿Dónde va un frasco de mermelada de vidrio?',
    category: 'vidrio',
    explanation: 'El frasco limpio y sin tapa va al contenedor verde. El vidrio se recicla infinitas veces.',
  },
  {
    question: '¿Dónde llevás un cargador que dejó de funcionar?',
    category: 'electronicos',
    explanation: 'Cargadores y cables son residuos electrónicos: llevalos a un punto verde de RAEE.',
  },
  {
    question: '¿En qué contenedor va una lata de atún?',
    category: 'metal',
    explanation: 'La lata de atún es metal. Enjuagala antes de llevarla al contenedor gris.',
  },
  {
    question: '¿Dónde va una servilleta usada con grasa?',
    category: 'general',
    explanation: 'La grasa contamina el papel reciclable, así que la servilleta va a residuos comunes.',
  },
];
