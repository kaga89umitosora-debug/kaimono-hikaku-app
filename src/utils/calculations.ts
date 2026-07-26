import type { Price, Unit } from '../types';

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

/**
 * 単価表示に使う実際の単位文字列を決定する。
 * unitが'その他'の場合はcustomUnitをtrimして使い、空欄なら表示できないものとしてnullを返す。
 * unit未設定(古い保存データ等)や未知の値の場合もnullを返す。
 * 保存データそのものは変更しない(trimは表示用の戻り値にのみ適用)。
 */
export function getDisplayUnit(unit: Unit | undefined, customUnit: string | undefined): string | null {
  if (unit === 'その他') {
    const trimmed = customUnit?.trim();
    return trimmed ? trimmed : null;
  }
  if (unit === '個' || unit === 'g' || unit === 'kg' || unit === 'ml' || unit === 'L' || unit === '袋') {
    return unit;
  }
  return null;
}

/**
 * 単価表示(例: "20円/個", "2.5円/g", "0.99円/g")。
 * 計算式(price / quantity)・丸め精度(小数点以下2桁、toFixed(2)相当)は変更しない。
 * toFixed(2)で丸めた文字列をNumber()へ戻すことで、末尾の不要な0(および整数時の小数点)だけを
 * 表示上取り除く。丸め自体はtoFixed(2)がそのまま担うため、精度は従来と同一。
 * 内容量が未入力・0以下、または実際の単位が決定できない(未設定・その他で独自単位が空欄など)
 * 場合は、不自然な表示を避けるためnullを返す(呼び出し側は非表示にする)。
 */
export function getUnitPriceLabel(
  price: number,
  quantity: number | null,
  unit: Unit | undefined,
  customUnit: string | undefined
): string | null {
  if (!quantity || quantity <= 0) return null;
  const displayUnit = getDisplayUnit(unit, customUnit);
  if (!displayUnit) return null;
  const rounded = Number((price / quantity).toFixed(2)).toString();
  return `${rounded}円/${displayUnit}`;
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
