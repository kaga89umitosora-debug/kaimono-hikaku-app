import { useState } from 'react';
import { useAppData } from '../../context/useAppData';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { getDisplayUnit } from '../../utils/calculations';
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
          <span className="store-group-card__total">合計 {total.toLocaleString()}円</span>
          <button
            type="button"
            className="store-group-card__reset-btn"
            onClick={() => setConfirmingReset(true)}
          >
            リセット
          </button>
        </div>
      </div>

      <ul className="store-group-card__list">
        {entries.map(({ entry, product }) => {
          const displayName = product ? product.name : entry.customName || '(名称未設定)';
          const price = product ? getPrice(product.id, store.id) : undefined;
          // 単位未設定・未知の単位・その他で独自単位が空欄の場合はnullになる。
          // ProductCard・AddToShoppingListModalと同じ表示仕様(数量のみ表示/何も表示しない)に揃える。
          const displayUnit = product ? getDisplayUnit(product.unit, product.customUnit) : null;
          const quantityLabel = product
            ? product.quantity
              ? `${product.quantity}${displayUnit ?? ''}`
              : displayUnit ?? ''
            : '';
          return (
            <li key={entry.id} className="store-group-card__item">
              <div className="store-group-card__item-main">
                <span className="store-group-card__item-name">{displayName}</span>
                <span className="store-group-card__item-meta">{quantityLabel}</span>
                <span className="store-group-card__item-amount">
                  {price !== undefined ? `${price.toLocaleString()}円` : product ? '価格未設定' : ''}
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
                    他店購入
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--danger-outline"
                  onClick={() => setPendingDelete({ kind: 'entry', id: entry.id, name: displayName })}
                >
                  削除
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
              <span className="store-group-card__item-amount">{item.amount.toLocaleString()}円</span>
            </div>
            <div className="store-group-card__item-actions">
              <button
                type="button"
                className="btn btn--danger-outline"
                onClick={() => setPendingDelete({ kind: 'manual', id: item.id, name: item.name })}
              >
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>

      {pendingDelete && (
        <ConfirmDialog
          title="買い物リストから削除しますか?"
          message={`「${pendingDelete.name}」を買い物リストから削除しますか?`}
          confirmLabel="削除する"
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
          title="買い物リストをリセットしますか?"
          message={`${store.name}の買い物リストをすべて削除しますか?`}
          confirmLabel="すべて削除する"
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
