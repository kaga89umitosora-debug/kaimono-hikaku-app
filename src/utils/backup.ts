export const BACKUP_KEY_PREFIX = 'khc:';

export interface BackupPayload {
  exportedAt: string;
  data: Record<string, unknown>;
}

export function collectBackupData(): BackupPayload {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(BACKUP_KEY_PREFIX)) continue;
    try {
      data[key] = JSON.parse(localStorage.getItem(key) ?? 'null');
    } catch {
      // 壊れた値はバックアップ対象から除外する
    }
  }
  return { exportedAt: new Date().toISOString(), data };
}

export function downloadBackup(payload: BackupPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const stamp = payload.exportedAt.slice(0, 19).replace(/[:T]/g, '-');
  const a = document.createElement('a');
  a.href = url;
  a.download = `kaimono-hikaku-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseBackupFile(text: string): BackupPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('JSONとして読み込めませんでした。');
  }
  const candidate = parsed as Partial<BackupPayload> | null;
  if (!candidate || typeof candidate !== 'object' || typeof candidate.data !== 'object' || candidate.data === null) {
    throw new Error('バックアップファイルの形式が正しくありません。');
  }
  return candidate as BackupPayload;
}

/** 現在のkhc:データを全て消してから、バックアップの内容で復元する(古いキーが残らないようにするため) */
export function restoreBackupData(payload: BackupPayload): void {
  const keys = Object.keys(payload.data).filter((k) => k.startsWith(BACKUP_KEY_PREFIX));
  if (keys.length === 0) {
    throw new Error('復元できるデータが見つかりませんでした。');
  }

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(BACKUP_KEY_PREFIX)) localStorage.removeItem(key);
  }

  for (const key of keys) {
    localStorage.setItem(key, JSON.stringify(payload.data[key]));
  }
}
