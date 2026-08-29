import { useContext } from 'react';
import type { I18nContextValue } from './types';
import { I18nContext } from './i18nContextDefinition';

/**
 * 表示言語 / setLanguage / t() を取得する hook。
 * I18nProvider の外で呼ぶと開発時に気づけるよう明示的に throw する。
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
