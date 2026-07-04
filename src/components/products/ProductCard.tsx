import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { getUnitPriceLabel } from '../../utils/calculations';
import { formatDate } from '../../utils/date';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ProductFormModal } from './ProductFormModal';
import type { Product } from '../../types';

export function ProductCard({ product }: { product: Product }) {
  const { stores, getPrice, setPrice, getCheapestStoreId, setPlanned, updateProduct, removeProduct } =
    useAppData();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const cheapestStoreId = getCheapestStoreId(product.id);
  const unitLabel = product.unit === 'その他' ? product.customUnit || 'その他' : product.unit;

  return (
    <article className="product-card">
      <header className="product-card__header">
        <div>
          <h3>{product.name}</h3>
          <p className="product-card__meta">
            {product.quantity ? `${product.quantity}${unitLabel}` : unitLabel}
            <span className="product-card__updated"> ・更新日 {formatDate(product.updatedAt)}</span>
          </p>
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={product.planned}
            onChange={(e) => setPlanned(product.id, e.target.checked)}
          />
          購入予定
        </label>
      </header>

      <div className="product-card__prices">
        {stores.length === 0 && <p className="empty-hint">先に店舗を登録してください。</p>}
        {stores.map((store) => {
          const price = getPrice(product.id, store.id);
          const isCheapest = price !== undefined && cheapestStoreId === store.id;
          const unitPriceLabel = price !== undefined ? getUnitPriceLabel(price, product.quantity) : null;
          return (
            <div key={store.id} className={`price-cell ${isCheapest ? 'price-cell--cheapest' : ''}`}>
              <span className="price-cell__store">{store.name}</span>
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
          initialValue={product}
          onSubmit={(value) => {
            updateProduct(product.id, value);
            setEditing(false);
          }}
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
    </article>
  );
}
