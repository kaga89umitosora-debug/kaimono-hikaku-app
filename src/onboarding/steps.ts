/**
 * オンボーディング(初回操作説明)の「構造」だけを言語非依存で保持する。
 *
 * 表示文言(title / body / ボタン)は i18n 辞書側に置く:
 *   - 見出し: onboarding.<id>.title
 *   - 本文  : onboarding.<id>.body   ('\n' で改行を保持)
 *   - ボタン: common.back / common.next / common.start / common.skip
 *   - 再表示: onboarding.replay
 *
 * OnboardingModal は id をキー語幹として t(`onboarding.${id}.title`) の形で参照する。
 */
export const ONBOARDING_STEP_IDS = ['stores', 'compare', 'list'] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[number];
