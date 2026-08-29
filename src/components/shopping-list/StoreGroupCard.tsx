import { useState } from 'react';
import { useAppData } from '../../context/useAppData';
import { useI18n, joinQuantityUnit, resolveUnitLabel, formatPriceNumber } from '../../i18n';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { scrollAppContentToTop } from '../../utils/scroll';
import type { ManualListItem, Product, ShoppingListEntry, Store, StoreChangeRequest } from '../../types';

type PendingDelete = { kind: 'entry' | 'manual'; id: string; name: string };

export function StoreGroupCard({
  store,
  entries,
  manualItems,
  onRequestStoreChange,
}: {
  store: Store;
  entries: { entry: ShoppingListEntry; product: Product | null }[];
  manualItems: ManualListItem[];
  onRequestStoreChange: (request: StoreChangeRequest) => void;
}) {
  const { getPrice, removeShoppingListEntry, removeManualItem, resetShoppingListForStore } = useAppData();
  const { t, language } = useI18n();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (entries.length === 0 && manualItems.length === 0) return null;

  const total =
    entries.reduce((sum, { product }) => sum + (product ? getPrice(product.id, store.id) ?? 0 : 0), 0) +
    manualItems.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="store-group-card">
      <div className="store-group-card__header">
        <h3>{store.name}</h3>
        <div className="store-group-card__header-meta">
          <span className="store-group-card__total">
            {t('shoppingList.total')} {formatPriceNumber(total, language)}
          </span>
          <button
            type="button"
            className="store-group-card__reset-btn"
            onClick={() => setConfirmingReset(true)}
          >
            {t('shoppingList.reset')}
          </button>
        </div>
      </div>

      <ul className="store-group-card__list">
        {entries.map(({ entry, product }) => {
          const displayName = product ? product.name : entry.customName || t('shoppingList.unnamed');
          const price = product ? getPrice(product.id, store.id) : undefined;
          // 単位未設定・未知の単位・その他で独自単位が空欄の場合は null になる。
          // ProductCard・AddToShoppingListModal と同じ表示仕様(数量のみ表示/何も表示しない)に揃える。
          // 既知の単位は現在言語のラベル、'その他' の customUnit はユーザー入力のまま。
          const unitLabel = product ? resolveUnitLabel(product.unit, product.customUnit, t) : null;
          const quantityLabel = product ? joinQuantityUnit(product.quantity, unitLabel, language) : '';
          return (
            <li key={entry.id} className="store-group-card__item">
              <div className="store-group-card__item-main">
                <span className="store-group-card__item-name">{displayName}</span>
                <span className="store-group-card__item-meta">{quantityLabel}</span>
                <span className="store-group-card__item-amount">
                  {price !== undefined
                    ? formatPriceNumber(price, language)
                    : product
                      ? t('product.priceUnset')
                      : ''}
                </span>
              </div>
              <div className="store-group-card__item-actions">
                {product && (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() =>
                      onRequestStoreChange({
                        entryId: entry.id,
                        productId: product.id,
                        originStoreId: store.id,
                      })
                    }
                  >
                    {t('shoppingList.buyElsewhere')}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--danger-outline"
                  onClick={() => setPendingDelete({ kind: 'entry', id: entry.id, name: displayName })}
                >
                  {t('common.delete')}
                </button>
              </div>
            </li>
          );
        })}
        {manualItems.map((item) => (
          <li key={item.id} className="store-group-card__item">
            <div className="store-group-card__item-main">
              <span className="store-group-card__item-name">{item.name}</span>
              <span className="store-group-card__item-meta">{item.quantity}</span>
              <span className="store-group-card__item-amount">{formatPriceNumber(item.amount, language)}</span>
            </div>
            <div className="store-group-card__item-actions">
              <button
                type="button"
                className="btn btn--danger-outline"
                onClick={() => setPendingDelete({ kind: 'manual', id: item.id, name: item.name })}
              >
                {t('common.delete')}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {pendingDelete && (
        <ConfirmDialog
          title={t('shoppingList.deleteItemConfirmTitle')}
          message={t('shoppingList.deleteItemConfirmMessage', { name: pendingDelete.name })}
          confirmLabel={t('common.confirmDelete')}
          onConfirm={() => {
            if (pendingDelete.kind === 'entry') {
              removeShoppingListEntry(pendingDelete.id);
            } else {
              removeManualItem(pendingDelete.id);
            }
            setPendingDelete(null);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {confirmingReset && (
        <ConfirmDialog
          title={t('shoppingList.resetStoreConfirmTitle')}
          message={t('shoppingList.resetStoreConfirmMessage', { store: store.name })}
          confirmLabel={t('shoppingList.deleteAllAction')}
          onConfirm={() => {
            resetShoppingListForStore(store.id);
            setConfirmingReset(false);
            scrollAppContentToTop();
          }}
          onCancel={() => {
            setConfirmingReset(false);
            scrollAppContentToTop();
          }}
        />
      )}
    </div>
  );
}
