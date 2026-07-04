const KEY_PREFIX = 'khc:';

export function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
  } catch {
    // ストレージ容量超過等は無視し、次回操作時に再試行させる
  }
}
