import { useState, type FormEvent } from 'react';
import { Modal } from '../common/Modal';
import { useI18n } from '../../i18n';

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
  const { t } = useI18n();
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
          <span>{t('store.nameLabel')}</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('store.namePlaceholder')}
          />
        </label>
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn--primary" disabled={!name.trim()}>
            {t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
