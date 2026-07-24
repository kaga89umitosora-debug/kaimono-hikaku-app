import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { getUnitPriceLabel } from '../../utils/calculations';
import { formatDate } from '../../utils/date';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';
import { ProductFormModal } from './ProductFormModal';
import type { Product, Store } from '../../types';

export function ProductCard({ product }: { product: Product }) {
  const {
    stores,
    getPrice,
    setPrice,
    getCheapestStoreId,
    removeProduct,
    isInShoppingList,
    addToShoppingList,
  } = useAppData();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pendingAddStore, setPendingAddStore] = useState<Store | null>(null);
  const [duplicateStoreName, setDuplicateStoreName] = useState<string | null>(null);

  const cheapestStoreId = getCheapestStoreId(product.id);
  const unitLabel = product.unit === 'その他' ? product.customUnit || 'その他' : product.unit;

  const handleTapAdd = (store: Store) => {
    if (isInShoppingList(product.id, store.id)) {
      setDuplicateStoreName(store.name);
    } else {
      setPendingAddStore(store);
    }
  };

  return (
    <article className="product-card">
      <header className="product-card__header">
        <div>
          <h3>{product.name}</h3>
          <p className="product-card__meta">
            {product.quantity ? `${product.quantity}${unitLabel}` : unitLabel}
            <span className="product-card__updated"> ・更新日 {formatDate(product.updatedAt)}</span>
          </p>
          {product.comment && <p className="product-card__comment">{product.comment}</p>}
        </div>
      </header>

      <div className="product-card__prices">
        {stores.length === 0 && <p className="empty-hint">先に店舗を登録してください。</p>}
        {stores.map((store) => {
          const price = getPrice(product.id, store.id);
          const isCheapest = price !== undefined && cheapestStoreId === store.id;
          const unitPriceLabel = price !== undefined ? getUnitPriceLabel(price, product.quantity) : null;
          return (
            <div key={store.id} className={`price-cell ${isCheapest ? 'price-cell--cheapest' : ''}`}>
              <button
                type="button"
                className="price-cell__store"
                disabled={price === undefined}
                onClick={() => handleTapAdd(store)}
              >
                {store.name}
                {price !== undefined && <span className="price-cell__amount">{price}円</span>}
              </button>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={price ?? ''}
                placeholder="未入力"
                onChange={(e) => {
                  const raw = e.target.value;
                  setPrice(product.id, store.id, raw === '' ? null : Number(raw));
                }}
              />
              {unitPriceLabel && <span className="price-cell__unit-price">{unitPriceLabel}</span>}
            </div>
          );
        })}
      </div>

      <div className="product-card__actions">
        <button type="button" className="btn btn--ghost" onClick={() => setEditing(true)}>
          編集
        </button>
        <button type="button" className="btn btn--danger-outline" onClick={() => setConfirmingDelete(true)}>
          削除
        </button>
      </div>

      {editing && (
        <ProductFormModal
          title="商品を編集"
          productId={product.id}
          initialValue={product}
          onClose={() => setEditing(false)}
        />
      )}

      {confirmingDelete && (
        <ConfirmDialog
          title="商品を削除しますか?"
          message={`「${product.name}」の価格データもすべて削除されます。`}
          onConfirm={() => {
            removeProduct(product.id);
            setConfirmingDelete(false);
          }}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}

      {pendingAddStore && (
        <ConfirmDialog
          title="買い物リストへ追加しますか?"
          message={`「${product.name}」を${pendingAddStore.name}の買い物リストへ追加しますか?`}
          confirmLabel="追加する"
          onConfirm={() => {
            addToShoppingList(product.id, pendingAddStore.id);
            setPendingAddStore(null);
          }}
          onCancel={() => setPendingAddStore(null)}
        />
      )}

      {duplicateStoreName && (
        <Modal title="買い物リスト" onClose={() => setDuplicateStoreName(null)}>
          <p className="confirm-dialog__message">すでに登録されています。</p>
          <div className="form__actions">
            <button type="button" className="btn btn--primary" onClick={() => setDuplicateStoreName(null)}>
              閉じる
            </button>
          </div>
        </Modal>
      )}
    </article>
  );
}
