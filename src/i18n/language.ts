import type { Language } from './types';

/**
 * 表示言語の永続化キー。
 * 既存アプリデータ/バックアップ対象の 'khc:' 接頭辞は意図的に避けている
 * (backup.ts は 'khc:' で始まるキーのみを対象とするため、この設定は
 *  バックアップJSONに混入せず、復元時に削除・上書きもされない)。
 */
const STORAGE_KEY = 'khcui:lang';

/** 対応言語の一覧。言語を追加するときはここと types.ts / translations を更新する。 */
export const SUPPORTED_LANGUAGES = ['ja', 'en'] as const;

/**
 * 既定言語。localStorage 未設定かつブラウザ判定でも決まらない場合のフォールバック。
 * 既存ユーザー(日本語表示)を突然英語にしないため、'ja' を厳守する。
 */
export const DEFAULT_LANGUAGE: Language = 'ja';

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/**
 * 保存済みの表示言語を返す。
 * - 未設定 / 不正値 / localStorage アクセス例外 → null
 * 呼び出し側は null のとき detectDefaultLanguage() か DEFAULT_LANGUAGE へフォールバックする。
 */
export function getLanguage(): Language | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isLanguage(raw) ? raw : null;
  } catch {
    return null;
  }
}

/**
 * 表示言語を保存する。
 * 書き込みで例外が起きても(プライベートモード・容量超過など)アプリを落とさない。
 */
export function setLanguage(language: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // 保存できなくても致命的ではないため無視する。
  }
}

/**
 * ブラウザの言語設定から既定言語を推定する。
 * navigator.languages / navigator.language の先頭要素から順に、対応言語に
 * 一致するものを探す。見つからなければ DEFAULT_LANGUAGE('ja')。
 *
 * 「未設定の既存ユーザーを絶対に英語化しない」ことを最優先する場合は、
 * 接続側でこの関数を使わず DEFAULT_LANGUAGE を直接使う運用も可能。
 * (初回言語選択画面ではこの推定値を初期選択のヒントとして使う想定)
 */
export function detectDefaultLanguage(): Language {
  try {
    const tags = [
      ...(Array.isArray(navigator.languages) ? navigator.languages : []),
      navigator.language,
    ];
    for (const tag of tags) {
      if (!tag) continue;
      const primary = tag.toLowerCase().split('-')[0];
      if (isLanguage(primary)) return primary;
    }
  } catch {
    // navigator が無い環境など。フォールバックへ。
  }
  return DEFAULT_LANGUAGE;
}
