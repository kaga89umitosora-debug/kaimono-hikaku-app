/**
 * オンボーディング(初回操作説明)の「表示済み」状態を localStorage で管理する。
 *
 * 保存キーの接頭辞は、既存アプリデータおよびバックアップ対象の 'khc:' を意図的に避けている。
 * これにより backup.ts の collectBackupData / restoreBackupData("khc:" で始まるキーのみを対象)
 * の影響を受けず、
 *   - バックアップJSONにこのUI設定が混入しない
 *   - 古いバックアップを復元してもオンボーディングが再表示されない
 * という状態を保つ。
 *
 * 値は boolean ではなく「見たオンボーディングのバージョン番号」で保存する。
 * 将来オンボーディング内容を更新したら CURRENT_ONBOARDING_VERSION を上げるだけで、
 * 旧バージョンしか見ていない利用者に再表示できる。
 */

/** このキーは 'khc:' 接頭辞ではないため、backup.ts の対象外。 */
const ONBOARDING_SEEN_KEY = 'khcui:onboarding-seen';

/** 現在のオンボーディングバージョン。内容を刷新したらインクリメントする。 */
export const CURRENT_ONBOARDING_VERSION = 1;

/**
 * 現在のバージョンのオンボーディングを既に見たかどうかを返す。
 *
 * - 保存済みバージョンが現在バージョン以上なら true
 * - キーが存在しない(未視聴)なら false
 * - localStorage アクセスで例外が発生した場合は true
 *   (保存できない環境で毎回オンボーディングが表示され続けるのを防ぐため)
 */
export function hasSeenOnboarding(): boolean {
  try {
    const raw = localStorage.getItem(ONBOARDING_SEEN_KEY);
    if (raw === null) return false;
    return Number(raw) >= CURRENT_ONBOARDING_VERSION;
  } catch {
    return true;
  }
}

/**
 * khcui:onboarding-seen が(バージョンを問わず)保存されているかを返す。
 * i18n 導入前からこのアプリを使っている「既存ユーザー」の判定に使う。
 *
 * - キーが存在すれば true(= 既存ユーザー)
 * - キーが無ければ false(= 新規ユーザー)
 * - localStorage アクセス例外時は true(既存ユーザー扱い)。
 *   壊れた環境で初回言語選択画面が毎回出続けるのを避けるため、安全側に倒す。
 */
export function hasOnboardingRecord(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_SEEN_KEY) !== null;
  } catch {
    return true;
  }
}

/**
 * 現在のオンボーディングバージョンを「表示済み」として localStorage へ保存する。
 * 書き込みで例外が起きてもアプリを落とさない。
 */
export function markOnboardingSeen(): void {
  try {
    localStorage.setItem(ONBOARDING_SEEN_KEY, String(CURRENT_ONBOARDING_VERSION));
  } catch {
    // プライベートモード・容量超過など。保存できなくても致命的ではないため無視する。
  }
}
