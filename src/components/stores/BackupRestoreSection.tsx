import { useRef, useState, type ChangeEvent } from 'react';
import { collectBackupData, downloadBackup, parseBackupFile, restoreBackupData } from '../../utils/backup';
import { useI18n } from '../../i18n';
import { ConfirmDialog } from '../common/ConfirmDialog';

export function BackupRestoreSection() {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    downloadBackup(collectBackupData());
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    setPendingFile(file);
  };

  const handleConfirmRestore = async () => {
    if (!pendingFile) return;
    try {
      const text = await pendingFile.text();
      const payload = parseBackupFile(text);
      restoreBackupData(payload);
      setPendingFile(null);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('backup.restoreFailed'));
      setPendingFile(null);
    }
  };

  return (
    <section className="backup-section">
      <h3>{t('backup.title')}</h3>
      <p className="backup-section__hint">{t('backup.hint')}</p>
      <div className="backup-section__actions">
        <button type="button" className="btn btn--ghost" onClick={handleExport}>
          {t('backup.export')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => fileInputRef.current?.click()}>
          {t('backup.import')}
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChange} hidden />
      </div>
      {error && <p className="backup-section__error">{error}</p>}

      {pendingFile && (
        <ConfirmDialog
          title={t('backup.restoreConfirmTitle')}
          message={t('backup.restoreConfirmMessage', { name: pendingFile.name })}
          confirmLabel={t('backup.restoreConfirmAction')}
          onConfirm={handleConfirmRestore}
          onCancel={() => setPendingFile(null)}
        />
      )}
    </section>
  );
}
