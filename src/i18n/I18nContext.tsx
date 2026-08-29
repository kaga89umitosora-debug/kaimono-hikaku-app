import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Language, MessageKey, TranslateParams } from './types';
import { I18nContext } from './i18nContextDefinition';
import { DEFAULT_LANGUAGE, getLanguage, setLanguage as persistLanguage } from './language';
import { translate } from './translate';

/**
 * 表示言語と翻訳関数 t() をツリー全体へ供給する Provider。
 *
 * 初期言語の決定順:
 *   1. initialLanguage prop (テスト・明示指定用。通常は未使用)
 *   2. getLanguage()        保存済みの選択 (khcui:lang)
 *   3. DEFAULT_LANGUAGE     未設定なら 'ja'
 *
 * この段階では初回言語選択画面が無いため、未設定時に detectDefaultLanguage() は
 * 使わない。端末言語による突然の英語化を防ぎ、既存ユーザーの日本語表示を維持する。
 * detectDefaultLanguage() は将来の初回言語選択画面で初期候補の提示に用いる。
 */
export function I18nProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(
    () => initialLanguage ?? getLanguage() ?? DEFAULT_LANGUAGE
  );

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    persistLanguage(next);
  }, []);

  const t = useCallback(
    (key: MessageKey, params?: TranslateParams) => translate(language, key, params),
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
