import type { ja } from './translations/ja';

/**
 * 対応言語コード。当面は日本語・英語のみ。
 * 言語を追加するときは、ここのユニオンと SUPPORTED_LANGUAGES(language.ts)、
 * および translations/ 配下の辞書を追加する。
 */
export type Language = 'ja' | 'en';

/**
 * 翻訳キー。ja.ts(ソースオブトゥルース)のキー集合そのもの。
 * 存在しないキーを t() に渡すとコンパイルエラーになる。
 */
export type MessageKey = keyof typeof ja;

/** 1言語ぶんの完全な辞書。全 MessageKey を必ず持つ。en.ts はこの型で縛る。 */
export type Translations = Record<MessageKey, string>;

/** t() のプレースホルダ置換に渡す値。{name} → params.name。 */
export type TranslateParams = Record<string, string | number>;

/** I18nProvider が提供する値。useI18n() の戻り値。 */
export interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey, params?: TranslateParams) => string;
}
