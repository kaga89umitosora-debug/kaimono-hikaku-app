import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../i18n';

export function Modal({
  title,
  onClose,
  children,
  headerActions,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /**
   * ヘッダー右側に、既定の×ボタンの代わりに表示する任意の操作(ボタン群など)。
   * 未指定の場合は従来通り×ボタンを表示する(既存の呼び出し元への影響なし)。
   */
  headerActions?: ReactNode;
}) {
  const { t } = useI18n();
  const bodyRef = useRef<HTMLDivElement>(null);

  // モーダルを開くたびに、実際のスクロールコンテナ(.modal__body)を必ず先頭へ戻す。
  // document.querySelectorでページ全体から曖昧に探すのではなく、このModalインスタンス自身の
  // .modal__bodyをrefで直接参照する。背景の画面(商品比較画面など)のスクロールには触れない。
  useLayoutEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, []);

  // 商品カード等の祖先要素にbackdrop-filter/transform等が付くと、CSS仕様上そこが
  // position:fixedの包含ブロックになり、ページのスクロール位置次第でモーダルが
  // 画面外にずれてしまう。document.body直下へポータル描画することでこれを避ける。
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2>{title}</h2>
          {headerActions ?? (
            <button type="button" className="modal__close" onClick={onClose} aria-label={t('common.close')}>
              ×
            </button>
          )}
        </div>
        <div className="modal__body" ref={bodyRef}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
