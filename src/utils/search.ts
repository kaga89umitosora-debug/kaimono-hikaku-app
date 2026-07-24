import type { Product } from '../types';

/** 大文字/小文字・全角/半角・前後の空白の違いを吸収した比較用文字列を作る */
export function normalizeForSearch(text: string): string {
  return text.trim().toLowerCase().normalize('NFKC');
}

export function isExactMatch(name: string, query: string): boolean {
  return normalizeForSearch(name) === normalizeForSearch(query);
}

export function matchesQuery(name: string, query: string): boolean {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) return false;
  return normalizeForSearch(name).includes(normalizedQuery);
}

/** 商品名の部分一致候補を返す。完全一致を先頭に、最大limit件まで。 */
export function searchProductCandidates(products: Product[], query: string, limit = 8): Product[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const matches = products.filter((p) => matchesQuery(p.name, trimmed));
  const exact = matches.filter((p) => isExactMatch(p.name, trimmed));
  const partial = matches.filter((p) => !isExactMatch(p.name, trimmed));

  return [...exact, ...partial].slice(0, limit);
}
