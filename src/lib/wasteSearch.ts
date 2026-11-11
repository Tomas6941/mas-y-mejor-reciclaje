import { WASTE_ITEMS } from '@/data/wasteItems';
import type { WasteItem } from '@/types/domain';

/** Palabras vacías típicas de la pregunta "¿dónde va...?". */
export const TRAVEL_STOPWORDS = new Set([
  'donde', 'va', 'van', 'una', 'uno', 'un', 'el', 'la', 'los', 'las', 'de', 'del',
  'que', 'como', 'en', 'y', 'o', 'para', 'mi', 'se', 'tira', 'tirar', 'desecha',
  'desechar', 'basura', 'residuo', 'esto', 'esa', 'ese', 'al', 'a', 'por', 'con',
]);

/** Normaliza texto: sin acentos, minúsculas, sin puntuación. */
export function normalizeText(value: string | null | undefined): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[¿?¡!.,;:()[\]{}"'“”'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Tokens de búsqueda: sin stopwords, de más de 1 carácter. */
export function searchTokens(query: string): string[] {
  return normalizeText(query)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !TRAVEL_STOPWORDS.has(token));
}

/**
 * Busca ítems de residuos con el puntaje del sitio original:
 * exacto 130 · empieza con 110 · incluye 95 · todos los tokens en el nombre 85 ·
 * una palabra empieza con el primer token 72 · base 55.
 */
export function getWasteMatches(query: string): WasteItem[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];
  const tokens = searchTokens(query);
  const effectiveTokens = tokens.length ? tokens : normalizedQuery.split(' ').filter(Boolean);

  return WASTE_ITEMS.map((item, index) => {
    const normalizedName = normalizeText(item.name);
    const haystack = normalizeText(`${item.name} ${(item.keywords || []).join(' ')}`);
    const allTokensMatch = effectiveTokens.every((token) => haystack.includes(token));
    if (!allTokensMatch) return null;

    let score = 55;
    if (normalizedName === normalizedQuery) score = 130;
    else if (normalizedName.startsWith(normalizedQuery)) score = 110;
    else if (normalizedName.includes(normalizedQuery)) score = 95;
    else if (effectiveTokens.every((token) => normalizedName.includes(token))) score = 85;
    else if (normalizedName.split(' ').some((word) => word.startsWith(effectiveTokens[0]))) {
      score = 72;
    }

    return { item, score, index };
  })
    .filter((entry): entry is { item: WasteItem; score: number; index: number } => entry !== null)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}
