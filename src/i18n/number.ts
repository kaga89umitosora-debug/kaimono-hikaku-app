import type { Language } from './types';

/** Language → Intl 用の表示ロケール。整形にしか使わず、価格ロジックには影響させない。 */
const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  ja: 'ja-JP',
  en: 'en-US',
};

/**
 * 価格数値の表示用整形。
 *
 * - 通貨記号・通貨名は付けない(このアプリは通貨管理を持たず、数値だけで比較する)。
 * - ロケールに応じた桁区切りのみ適用(例: 1000 → "1,000")。
 * - 末尾の不要なゼロは付けない(2.5 → "2.5"、200 → "200")。
 * - 小数桁は Intl.NumberFormat の既定(最大3桁)。従来 StoreGroupCard で使っていた
 *   toLocaleString() と同じ挙動で、合計値の浮動小数ノイズも出さない。保存値は変更しない(表示専用)。
 */
export function formatPriceNumber(amount: number, language: Language): string {
  const locale = LOCALE_BY_LANGUAGE[language] ?? 'en-US';
  return new Intl.NumberFormat(locale).format(amount);
}
