import { Modal } from './Modal';

export function ConfirmDialog({
  title,
  message,
  confirmLabel = '削除する',
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="confirm-dialog__message">{message}</p>
      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          キャンセル
        </button>
        <button type="button" className="btn btn--danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
