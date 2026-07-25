import type { Price } from '../types';

/**
 * 最安判定用の比較値。
 * 数量が入力されている場合は単価(価格÷数量)、未入力の場合は価格そのものを使う。
 */
export function getComparisonValue(price: number, quantity: number | null): number {
  if (quantity && quantity > 0) {
    return price / quantity;
  }
  return price;
}

export function getUnitPriceLabel(price: number, quantity: number | null): string | null {
  if (!quantity || quantity <= 0) return null;
  return `${(price / quantity).toFixed(2)} 円/単位`;
}

/** 同一商品の店舗別価格の中から最安の店舗IDを返す。価格未入力の店舗は対象外(0円は有効な価格として扱う)。 */
export function findCheapestStoreId(prices: Price[], quantity: number | null): string | null {
  const priced = prices.filter((p) => p.price >= 0);
  if (priced.length === 0) return null;

  let cheapest = priced[0];
  let cheapestValue = getComparisonValue(cheapest.price, quantity);

  for (const p of priced.slice(1)) {
    const value = getComparisonValue(p.price, quantity);
    if (value < cheapestValue) {
      cheapest = p;
      cheapestValue = value;
    }
  }

  return cheapest.storeId;
}
