import { useRef, useState, type ChangeEvent } from 'react';
import { collectBackupData, downloadBackup, parseBackupFile, restoreBackupData } from '../../utils/backup';
import { ConfirmDialog } from '../common/ConfirmDialog';

export function BackupRestoreSection() {
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
      setError(err instanceof Error ? err.message : '復元に失敗しました。');
      setPendingFile(null);
    }
  };

  return (
    <section className="backup-section">
      <h3>データのバックアップ・復元</h3>
      <p className="backup-section__hint">
        店舗・商品・価格などのデータをJSONファイルに書き出し/読み込みできます。
      </p>
      <div className="backup-section__actions">
        <button type="button" className="btn btn--ghost" onClick={handleExport}>
          JSONを書き出す
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => fileInputRef.current?.click()}>
          JSONから復元する
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChange} hidden />
      </div>
      {error && <p className="backup-section__error">{error}</p>}

      {pendingFile && (
        <ConfirmDialog
          title="データを復元しますか?"
          message={`現在保存されているデータは上書きされます。「${pendingFile.name}」から復元してよろしいですか?`}
          confirmLabel="復元する"
          onConfirm={handleConfirmRestore}
          onCancel={() => setPendingFile(null)}
        />
      )}
    </section>
  );
}
