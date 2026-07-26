import { useKeyboardVisible } from '../../utils/keyboard';

export type Screen = 'stores' | 'products' | 'list';

const NAV_ITEMS: { key: Screen; label: string; icon: string }[] = [
  { key: 'stores', label: '店舗', icon: '🏬' },
  { key: 'products', label: '商品比較', icon: '⚖️' },
  { key: 'list', label: '買い物リスト', icon: '🛒' },
];

export function BottomNav({ current, onChange }: { current: Screen; onChange: (screen: Screen) => void }) {
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
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
