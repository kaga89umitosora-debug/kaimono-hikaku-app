import { createContext } from 'react';
import type { I18nContextValue } from './types';

/**
 * I18nProvider(I18nContext.tsx)と useI18n(useI18n.ts)で共有する Context 本体。
 * 既存の appDataContextDefinition.ts と同じく、Provider コンポーネントと Context
 * 生成・hook を別ファイルに分けている(react/only-export-components 対策)。
 */
export const I18nContext = createContext<I18nContextValue | null>(null);
