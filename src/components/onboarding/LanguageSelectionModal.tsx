import { Modal } from '../common/Modal';
import type { Language } from '../../i18n';

/**
 * 初回起動時の言語選択。まだ言語が決まっていないため、タイトルは日本語＋英語の併記固定。
 * 言語を選ぶまで先へ進めない: × ボタンは表示せず(headerActions を空指定)、
 * 背景タップ(onClose)も何もしない。選択でのみ onSelect が呼ばれる。
 */
export function LanguageSelectionModal({
  onSelect,
}: {
  onSelect: (language: Language) => void;
}) {
  return (
    <Modal
      title="言語を選択してください / Choose your language"
      onClose={() => {}}
      headerActions={<></>}
    >
      <div className="form">
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={() => onSelect('ja')}
        >
          日本語
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={() => onSelect('en')}
        >
          English
        </button>
      </div>
    </Modal>
  );
}
