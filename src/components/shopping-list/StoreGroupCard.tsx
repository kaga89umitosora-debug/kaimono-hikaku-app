import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { ManualItemFormModal } from './ManualItemFormModal';
import type { ManualListItem, Product, ShoppingListEntry, Store } from '../../types';

export function StoreGroupCard({
  store,
  entries,
  manualItems,
}: {
  store: Store;
  entries: { entry: ShoppingListEntry; product: Product }[];
  manualItems: ManualListItem[];
}) {
  const { getPrice, removeShoppingListEntry, removeManualItem, addManualItem } = useAppData();
  const [isAdding, setIsAdding] = useState(false);

  if (entries.length === 0 && manualItems.length === 0) return null;

  const total =
    entries.reduce((sum, { product }) => sum + (getPrice(product.id, store.id) ?? 0), 0) +
    manualItems.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="store-group-card">
      <div className="store-group-card__header">
        <h3>{store.name}</h3>
        <span className="store-group-card__total">合計 {total.toLocaleString()}円</span>
      </div>

      <ul className="store-group-card__list">
        {entries.map(({ entry, product }) => {
          const price = getPrice(product.id, store.id);
          const unitLabel = product.unit === 'その他' ? product.customUnit || 'その他' : product.unit;
          return (
            <li key={entry.id} className="store-group-card__item">
              <label className="checkbox">
                <input type="checkbox" onChange={() => removeShoppingListEntry(entry.id)} />
                <span className="store-group-card__item-name">{product.name}</span>
              </label>
              <span className="store-group-card__item-meta">
                {product.quantity ? `${product.quantity}${unitLabel}` : unitLabel}
              </span>
              <span className="store-group-card__item-amount">
                {price !== undefined ? `${price.toLocaleString()}円` : '未入力'}
              </span>
            </li>
          );
        })}
        {manualItems.map((item) => (
          <li key={item.id} className="store-group-card__item">
            <label className="checkbox">
              <input type="checkbox" onChange={() => removeManualItem(item.id)} />
              <span className="store-group-card__item-name">{item.name}</span>
            </label>
            <span className="store-group-card__item-meta">{item.quantity}</span>
            <span className="store-group-card__item-amount">{item.amount.toLocaleString()}円</span>
          </li>
        ))}
      </ul>

      <button type="button" className="btn btn--ghost" onClick={() => setIsAdding(true)}>
        + 商品を追加
      </button>

      {isAdding && (
        <ManualItemFormModal
          onSubmit={(input) => {
            addManualItem({ storeId: store.id, ...input });
            setIsAdding(false);
          }}
          onClose={() => setIsAdding(false)}
        />
      )}
    </div>
  );
}
