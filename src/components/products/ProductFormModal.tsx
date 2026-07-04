import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Modal } from '../common/Modal';
import { UNIT_OPTIONS } from '../../types';
import type { Unit } from '../../types';
import { useAppData } from '../../context/AppDataContext';

export interface ProductFormValue {
  name: string;
  quantity: number | null;
  unit: Unit;
  customUnit?: string;
}

export function ProductFormModal({
  title,
  productId,
  initialValue,
  onSubmit,
  onClose,
}: {
  title: string;
  /** 既存商品を編集する場合のみ渡す。指定時は店舗別の価格編集欄も表示する。 */
  productId?: string;
  initialValue?: ProductFormValue;
  onSubmit: (value: ProductFormValue) => void;
  onClose: () => void;
}) {
  const { stores, getPrice, setPrice } = useAppData();
  const [name, setName] = useState(initialValue?.name ?? '');
  const [quantity, setQuantity] = useState(
    initialValue?.quantity != null ? String(initialValue.quantity) : ''
  );
  const [unit, setUnit] = useState<Unit>(initialValue?.unit ?? '個');
  const [customUnit, setCustomUnit] = useState(initialValue?.customUnit ?? '');
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    if (!productId) return {};
    const initial: Record<string, string> = {};
    for (const store of stores) {
      const price = getPrice(productId, store.id);
      initial[store.id] = price !== undefined ? String(price) : '';
    }
    return initial;
  });
  const customUnitInputRef = useRef<HTMLInputElement>(null);
  const isFirstUnitRender = useRef(true);

  useEffect(() => {
    if (isFirstUnitRender.current) {
      isFirstUnitRender.current = false;
      return;
    }
    if (unit === 'その他') {
      customUnitInputRef.current?.focus();
    }
  }, [unit]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (unit === 'その他' && !customUnit.trim()) return;

    onSubmit({
      name: trimmedName,
      quantity: quantity === '' ? null : Number(quantity),
      unit,
      customUnit: unit === 'その他' ? customUnit.trim() : undefined,
    });

    if (productId) {
      for (const store of stores) {
        const raw = prices[store.id] ?? '';
        setPrice(productId, store.id, raw === '' ? null : Number(raw));
      }
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        <label className="form__field">
          <span>商品名</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="例: いちご" />
        </label>
        <label className="form__field">
          <span>内容量</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="未入力の場合は価格そのもので比較"
          />
        </label>
        <label className="form__field">
          <span>単位</span>
          <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            {UNIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        {unit === 'その他' && (
          <label className="form__field">
            <span>単位(自由入力)</span>
            <input
              ref={customUnitInputRef}
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              placeholder="例: 本・枚・袋・箱など"
            />
          </label>
        )}
        {productId && (
          <div className="form__field">
            <span>各店舗の価格</span>
            {stores.length === 0 && <p className="empty-hint">先に店舗を登録してください。</p>}
            <div className="form__price-list">
              {stores.map((store) => (
                <label key={store.id} className="form__price-row">
                  <span className="form__price-row-store">{store.name}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={prices[store.id] ?? ''}
                    placeholder="未入力"
                    onChange={(e) =>
                      setPrices((prev) => ({ ...prev, [store.id]: e.target.value }))
                    }
                  />
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            キャンセル
          </button>
          <button type="submit" className="btn btn--primary" disabled={!name.trim()}>
            保存
          </button>
        </div>
      </form>
    </Modal>
  );
}
