import type { Language, MessageKey, TranslateParams, Translations } from './types';
import { DEFAULT_LANGUAGE } from './language';
import { ja } from './translations/ja';
import { en } from './translations/en';

/** 言語コード → 辞書。React に依存しない純粋な参照テーブル。 */
const DICTIONARIES: Record<Language, Translations> = { ja, en };

/**
 * "{name}" 形式のプレースホルダを params の値で置換する。
 * params が無ければテンプレートをそのまま返す。
 * 対応する値が無いプレースホルダは置換せず原文のまま残す。
 * ICU MessageFormat などの複雑な構文は扱わない(意図的に単純化)。
 */
export function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
  );
}

/**
 * 指定言語で key を翻訳する。React 非依存(useI18n の t() はこれを言語固定で呼ぶだけ)。
 * 万一キーが辞書に無い場合は、既定言語 → キー文字列そのもの の順にフォールバックする。
 */
export function translate(language: Language, key: MessageKey, params?: TranslateParams): string {
  const dict = DICTIONARIES[language] ?? DICTIONARIES[DEFAULT_LANGUAGE];
  const template = dict[key] ?? DICTIONARIES[DEFAULT_LANGUAGE][key] ?? key;
  return interpolate(template, params);
}
