import { useKeyboardVisible } from '../../utils/keyboard';
import { useI18n } from '../../i18n';
import type { MessageKey } from '../../i18n';

export type Screen = 'stores' | 'products' | 'list';

const NAV_ITEMS: { key: Screen; labelKey: MessageKey; icon: string }[] = [
  { key: 'stores', labelKey: 'nav.stores', icon: '🏬' },
  { key: 'products', labelKey: 'nav.products', icon: '⚖️' },
  { key: 'list', labelKey: 'nav.shoppingList', icon: '🛒' },
];

export function BottomNav({ current, onChange }: { current: Screen; onChange: (screen: Screen) => void }) {
  const { t } = useI18n();
  // ソフトウェアキーボード表示中は、入力領域を圧迫しないよう下部タブ自体を描画しない。
  const isKeyboardVisible = useKeyboardVisible();
  if (isKeyboardVisible) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`bottom-nav__button ${current === item.key ? 'is-active' : ''}`}
          onClick={() => onChange(item.key)}
        >
          <span className="bottom-nav__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span>{t(item.labelKey)}</span>
        </button>
      ))}
    </nav>
  );
}
