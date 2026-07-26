import { useEffect, useRef, useState } from 'react';

/** ソフトウェアキーボードを通常表示しないinput type(チェックボックス・ボタン・ネイティブピッカー類)。 */
const NON_TEXT_INPUT_TYPES = new Set([
  'checkbox',
  'radio',
  'button',
  'submit',
  'reset',
  'range',
  'color',
  'file',
  'image',
]);

/** input(文字/数値入力系)・textarea・select・contenteditableのいずれかを編集要素とみなす。 */
function isEditableElement(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  if (el instanceof HTMLElement && el.isContentEditable) return true;
  if (el instanceof HTMLInputElement) {
    return !NON_TEXT_INPUT_TYPES.has(el.type);
  }
  return false;
}

/** visualViewportの高さが基準値からこれ以上縮んだら、キーボード表示による縮小とみなす。 */
const KEYBOARD_SHRINK_THRESHOLD = 150;
/** focusout直後に即falseへ戻さず、別の入力欄へのfocusinを待つ猶予時間(入力欄間移動時のちらつき防止用)。 */
const FOCUS_OUT_GRACE_MS = 80;

/**
 * ソフトウェアキーボードが表示中と推定される間だけtrueを返す。
 * 「編集要素にフォーカス中」かつ「visualViewportの高さが基準値より明確に縮小」の
 * 両方が揃った場合のみtrueとする(どちらか一方だけでは誤検知しやすいため)。
 * window.visualViewport非対応のブラウザでは常にfalse(呼び出し側は常時表示のままでよい)。
 */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);
  const baselineRef = useRef<number | null>(null);
  const focusedRef = useRef(false);
  const focusOutTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    baselineRef.current = vv.height;

    const recompute = () => {
      if (baselineRef.current == null) return;
      const shrunk = baselineRef.current - vv.height > KEYBOARD_SHRINK_THRESHOLD;
      setVisible(focusedRef.current && shrunk);
    };

    // 現在の高さが基準値より大きい、またはフォーカス中の編集要素が無い(=キーボードが
    // 原因で縮んでいるとは考えにくい)場合だけ、基準値を現在値へ更新してよい。
    // フォーカス中に縮んでいる値をそのまま基準値にしてしまうと、以後キーボードを
    // 検知できなくなるため上書きしない。
    const maybeUpdateBaseline = () => {
      const hasFocus = isEditableElement(document.activeElement);
      if (baselineRef.current == null || vv.height > baselineRef.current || !hasFocus) {
        baselineRef.current = vv.height;
      }
    };

    const handleViewportResize = () => {
      maybeUpdateBaseline();
      recompute();
    };

    const handleWindowResize = () => {
      maybeUpdateBaseline();
      recompute();
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (!isEditableElement(e.target as Element | null)) return;
      if (focusOutTimerRef.current !== null) {
        clearTimeout(focusOutTimerRef.current);
        focusOutTimerRef.current = null;
      }
      focusedRef.current = true;
      recompute();
    };

    const handleFocusOut = (e: FocusEvent) => {
      if (!isEditableElement(e.target as Element | null)) return;
      if (focusOutTimerRef.current !== null) {
        clearTimeout(focusOutTimerRef.current);
      }
      focusOutTimerRef.current = window.setTimeout(() => {
        focusedRef.current = false;
        focusOutTimerRef.current = null;
        recompute();
      }, FOCUS_OUT_GRACE_MS);
    };

    vv.addEventListener('resize', handleViewportResize);
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      vv.removeEventListener('resize', handleViewportResize);
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      if (focusOutTimerRef.current !== null) {
        clearTimeout(focusOutTimerRef.current);
      }
    };
  }, []);

  return visible;
}
