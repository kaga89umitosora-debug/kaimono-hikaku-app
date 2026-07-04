import { useState, type FormEvent } from 'react';
import { Modal } from '../common/Modal';
import { UNIT_OPTIONS } from '../../types';
import type { Unit } from '../../types';

export interface ProductFormValue {
  name: string;
  quantity: number | null;
  unit: Unit;
  customUnit?: string;
}

export function ProductFormModal({
  title,
  initialValue,
  onSubmit,
  onClose,
}: {
  title: string;
  initialValue?: ProductFormValue;
  onSubmit: (value: ProductFormValue) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialValue?.name ?? '');
  const [quantity, setQuantity] = useState(
    initialValue?.quantity != null ? String(initialValue.quantity) : ''
  );
  const [unit, setUnit] = useState<Unit>(initialValue?.unit ?? '個');
  const [customUnit, setCustomUnit] = useState(initialValue?.customUnit ?? '');

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
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        <label className="form__field">
          <span>商品名</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="例: いちご" />
        </label>
        <label className="form__field">
          <span>数量(任意)</span>
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
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              placeholder="例: 本・枚・袋・箱など"
            />
          </label>
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
