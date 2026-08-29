/**
 * i18n 基盤の公開エントリ。次ブロック以降、各コンポーネントは
 *   import { useI18n } from '../i18n';
 * のようにここから取り込む。
 *
 * ブロックA時点ではどこからも import されておらず、アプリの実行経路には入っていない。
 */
export type {
  Language,
  MessageKey,
  Translations,
  TranslateParams,
  I18nContextValue,
} from './types';

export {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  getLanguage,
  setLanguage,
  detectDefaultLanguage,
} from './language';

export { translate, interpolate } from './translate';
export { unitOptionLabel, resolveUnitLabel, joinQuantityUnit } from './units';
export { formatPriceNumber } from './number';
export { I18nProvider } from './I18nContext';
export { useI18n } from './useI18n';
