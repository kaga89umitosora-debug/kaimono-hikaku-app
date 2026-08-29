import { Modal } from './Modal';
import { useI18n } from '../../i18n';

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  /** 未指定なら「削除する」(common.confirmDelete) を既定表示。呼び出し側が渡した値は常に優先。 */
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="confirm-dialog__message">{message}</p>
      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          {t('common.cancel')}
        </button>
        <button type="button" className="btn btn--danger" onClick={onConfirm}>
          {confirmLabel ?? t('common.confirmDelete')}
        </button>
      </div>
    </Modal>
  );
}
