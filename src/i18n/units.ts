import type { Unit } from '../types';
import { getDisplayUnit } from '../utils/calculations';
import type { Language, MessageKey } from './types';

/**
 * 保存値(Unit) → 表示ラベルの翻訳キー。
 * 'その他' はここに含めない: 実際の商品表示では customUnit(ユーザー入力)を
 * そのまま出すため。セレクトの選択肢としての 'その他' は unitOptionLabel() が
 * 'unit.other' を返す。
 *
 * ※ ここにあるのは「表示ラベル」用のキーであり、保存値そのものではない。
 *   Product.unit / UNIT_OPTIONS の値(= '個' / '袋' / 'その他' …)は一切変更しない。
 */
const UNIT_LABEL_KEYS = {
  '個': 'unit.piece',
  g: 'unit.g',
  kg: 'unit.kg',
  ml: 'unit.ml',
  L: 'unit.l',
  '袋': 'unit.bag',
} satisfies Record<Exclude<Unit, 'その他'>, MessageKey>;

type Translate = (key: MessageKey) => string;

/**
 * 単位セレクト(<option>)の表示ラベル。<option> の value は Unit の保存値のまま使い、
 * 表示テキストだけをここで翻訳する。'その他' → 'unit.other'。
 */
export function unitOptionLabel(unit: Unit, t: Translate): string {
  if (unit === 'その他') return t('unit.other');
  return t(UNIT_LABEL_KEYS[unit]);
}

/**
 * 実際の商品表示に使う単位ラベル。getDisplayUnit と同じく「表示できなければ null」。
 * - unit === 'その他' → customUnit(ユーザー入力)をそのまま。空欄なら null(翻訳しない)。
 * - 既知の単位(個 / g / kg / ml / L / 袋) → 現在言語の翻訳ラベル。
 * - 未設定・未知の値 → null。
 *
 * 保存値(unit / customUnit)は読み取るだけで一切変更しない。
 */
export function resolveUnitLabel(
  unit: Unit | undefined,
  customUnit: string | undefined,
  t: Translate
): string | null {
  const raw = getDisplayUnit(unit, customUnit);
  if (raw === null) return null;
  // 'その他' のときの raw は customUnit(ユーザー入力)。翻訳せずそのまま返す。
  if (unit === 'その他') return raw;
  return t(UNIT_LABEL_KEYS[unit as keyof typeof UNIT_LABEL_KEYS]);
}

/**
 * 「数量 + 単位ラベル」の結合。英語は数字と単位の間に半角スペースを入れる
 * (例: ja "150g" / "3個"、en "150 g" / "3 piece")。
 * 数量の判定は既存表示ロジックに合わせ「falsy(null / 0)なら単位のみ」。
 * これは表示だけの整形で、数量の保存形式は変更しない。
 */
export function joinQuantityUnit(
  quantity: number | null,
  unitLabel: string | null,
  language: Language
): string {
  const u = unitLabel ?? '';
  if (!quantity) return u;
  return language === 'en' && u ? `${quantity} ${u}` : `${quantity}${u}`;
}
