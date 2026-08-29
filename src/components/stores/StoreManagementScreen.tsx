import { useState } from 'react';
import { useAppData } from '../../context/useAppData';
import { useI18n } from '../../i18n';
import type { Language } from '../../i18n';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { StoreFormModal } from './StoreFormModal';
import { BackupRestoreSection } from './BackupRestoreSection';

export function StoreManagementScreen({
  onReplayOnboarding,
}: {
  /** 「使い方をもう一度見る」押下時に呼ばれる。App 側でオンボーディングを再表示する。 */
  onReplayOnboarding?: () => void;
}) {
  const { stores, addStore, renameStore, removeStore, moveStore } = useAppData();
  const { t, language, setLanguage } = useI18n();
  const [isAdding, setIsAdding] = useState(false);
  const [editingStore, setEditingStore] = useState<{ id: string; name: string } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  return (
    <section className="screen">
      <div className="screen__header">
        <h2>{t('screen.stores.title')}</h2>
        <button type="button" className="btn btn--primary" onClick={() => setIsAdding(true)}>
          {t('screen.stores.addStore')}
        </button>
      </div>

      {stores.length === 0 && <p className="empty-hint">{t('store.emptyList')}</p>}

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
                aria-label={t('store.moveUp')}
              >
                ↑
              </button>
              <button
                type="button"
                className="icon-btn"
                disabled={index === stores.length - 1}
                onClick={() => moveStore(store.id, 'down')}
                aria-label={t('store.moveDown')}
              >
                ↓
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setEditingStore({ id: store.id, name: store.name })}
                aria-label={t('store.editTitle')}
              >
                ✎
              </button>
              <button
                type="button"
                className="icon-btn icon-btn--danger"
                onClick={() => setPendingDeleteId(store.id)}
                aria-label={t('store.deleteAria')}
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>

      <BackupRestoreSection />

      <section className="about-section">
        <h3>{t('settings.display')}</h3>
        <label className="form__field">
          <span>{t('settings.language')}</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </label>
      </section>

      <section className="about-section">
        <h3>{t('about.title')}</h3>
        <a
          className="about-section__link"
          href="https://soralabnext.github.io/kaimono-hikaku-app/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('about.privacyPolicy')}
        </a>
        <button
          type="button"
          className="about-section__link"
          onClick={() => onReplayOnboarding?.()}
        >
          {t('onboarding.replay')}
        </button>
      </section>

      {isAdding && (
        <StoreFormModal
          title={t('store.addTitle')}
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
          title={t('store.editTitle')}
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
          title={t('store.deleteConfirmTitle')}
          message={t('store.deleteConfirmMessage')}
          confirmLabel={t('common.confirmDelete')}
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
