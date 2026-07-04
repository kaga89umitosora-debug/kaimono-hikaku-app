import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { StoreFormModal } from './StoreFormModal';
import { BackupRestoreSection } from './BackupRestoreSection';

export function StoreManagementScreen() {
  const { stores, addStore, renameStore, removeStore, moveStore } = useAppData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingStore, setEditingStore] = useState<{ id: string; name: string } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  return (
    <section className="screen">
      <div className="screen__header">
        <h2>店舗管理</h2>
        <button type="button" className="btn btn--primary" onClick={() => setIsAdding(true)}>
          + 店舗を追加
        </button>
      </div>

      {stores.length === 0 && <p className="empty-hint">店舗がまだ登録されていません。</p>}

      <ul className="store-list">
        {stores.map((store, index) => (
          <li key={store.id} className="store-list__item">
            <span className="store-list__name">{store.name}</span>
            <div className="store-list__actions">
              <button
                type="button"
                className="icon-btn"
                disabled={index === 0}
                onClick={() => moveStore(store.id, 'up')}
                aria-label="表示順を上へ"
              >
                ↑
              </button>
              <button
                type="button"
                className="icon-btn"
                disabled={index === stores.length - 1}
                onClick={() => moveStore(store.id, 'down')}
                aria-label="表示順を下へ"
              >
                ↓
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setEditingStore({ id: store.id, name: store.name })}
                aria-label="店舗名を編集"
              >
                ✎
              </button>
              <button
                type="button"
                className="icon-btn icon-btn--danger"
                onClick={() => setPendingDeleteId(store.id)}
                aria-label="店舗を削除"
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>

      <BackupRestoreSection />

      {isAdding && (
        <StoreFormModal
          title="店舗を追加"
          initialName=""
          onSubmit={(name) => {
            addStore(name);
            setIsAdding(false);
          }}
          onClose={() => setIsAdding(false)}
        />
      )}

      {editingStore && (
        <StoreFormModal
          title="店舗名を編集"
          initialName={editingStore.name}
          onSubmit={(name) => {
            renameStore(editingStore.id, name);
            setEditingStore(null);
          }}
          onClose={() => setEditingStore(null)}
        />
      )}

      {pendingDeleteId && (
        <ConfirmDialog
          title="店舗を削除しますか?"
          message="この店舗に登録された価格データもすべて削除されます。"
          onConfirm={() => {
            removeStore(pendingDeleteId);
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </section>
  );
}
