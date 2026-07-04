import { useState, type FormEvent } from 'react';
import { Modal } from '../common/Modal';

export function ManualItemFormModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (value: { name: string; quantity: string; amount: number }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedAmount = Number(amount);
    if (!trimmedName || amount === '' || Number.isNaN(parsedAmount)) return;
    onSubmit({ name: trimmedName, quantity: quantity.trim(), amount: parsedAmount });
  };

  return (
    <Modal title="商品を手入力で追加" onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        <label className="form__field">
          <span>商品名</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 牛乳" />
        </label>
        <label className="form__field">
          <span>内容量(任意)</span>
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="例: 1本" />
        </label>
        <label className="form__field">
          <span>金額</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="例: 250"
          />
        </label>
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            キャンセル
          </button>
          <button type="submit" className="btn btn--primary" disabled={!name.trim() || amount === ''}>
            追加
          </button>
        </div>
      </form>
    </Modal>
  );
}
