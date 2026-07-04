import { useState, type FormEvent } from 'react';
import { Modal } from '../common/Modal';

export function StoreFormModal({
  title,
  initialName,
  onSubmit,
  onClose,
}: {
  title: string;
  initialName: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        <label className="form__field">
          <span>店舗名</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="例: Aスーパー" />
        </label>
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
