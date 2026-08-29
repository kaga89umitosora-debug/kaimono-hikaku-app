import { useState } from 'react';
import { Modal } from '../common/Modal';
import { ONBOARDING_STEP_IDS } from '../../onboarding/steps';
import { markOnboardingSeen } from '../../utils/onboarding';
import { useI18n } from '../../i18n';

/**
 * 初回操作説明の土台。3ステップを順番に表示するだけのコンポーネント。
 *
 * オンボーディングの終了操作(スキップ / 最終ページの「はじめる」/ 共通Modalの
 * 背景タップ)はすべて finish() を通し、markOnboardingSeen() で表示済みバージョンを
 * 保存してから props.onClose() を呼ぶ。「次へ」「戻る」では保存しない。
 *
 * 表示文言は i18n 辞書 (onboarding.<id>.* / common.*) から取得する。ステップの
 * 順序・個数のみ src/onboarding/steps.ts の ONBOARDING_STEP_IDS が持つ。
 */
export function OnboardingModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);

  const stepId = ONBOARDING_STEP_IDS[index];
  const isFirst = index === 0;
  const isLast = index === ONBOARDING_STEP_IDS.length - 1;

  /** オンボーディング終了の共通処理。表示済みバージョンを保存してから閉じる。 */
  const finish = () => {
    markOnboardingSeen();
    onClose();
  };

  const goBack = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => {
    if (isLast) {
      finish();
      return;
    }
    setIndex((i) => Math.min(ONBOARDING_STEP_IDS.length - 1, i + 1));
  };

  return (
    <Modal title={t(`onboarding.${stepId}.title`)} onClose={finish}>
      <div className="onboarding">
        <p className="onboarding__body">{t(`onboarding.${stepId}.body`)}</p>

        <div
          className="onboarding__progress"
          role="img"
          aria-label={`${index + 1} / ${ONBOARDING_STEP_IDS.length}`}
        >
          {ONBOARDING_STEP_IDS.map((id, i) => (
            <span
              key={id}
              className={`onboarding__dot ${i === index ? 'is-active' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding__nav">
          {isFirst ? (
            // 1ページ目は戻る先がないため「戻る」を表示しない。
            // ただし右側の「次へ」の位置・幅を2/3ページ目と揃えるため、
            // 同じ幅(flex: 1)の空プレースホルダーで左半分を占有する。
            <span className="onboarding__nav-btn" aria-hidden="true" />
          ) : (
            <button
              type="button"
              className="btn btn--ghost onboarding__nav-btn"
              onClick={goBack}
            >
              {t('common.back')}
            </button>
          )}
          <button
            type="button"
            className="btn btn--primary onboarding__nav-btn"
            onClick={goNext}
          >
            {isLast ? t('common.start') : t('common.next')}
          </button>
        </div>

        <button
          type="button"
          className="btn btn--ghost btn--block onboarding__skip"
          onClick={finish}
        >
          {t('common.skip')}
        </button>
      </div>
    </Modal>
  );
}
