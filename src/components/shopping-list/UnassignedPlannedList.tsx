import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import type { Product } from '../../types';

function UnassignedRow({ product }: { product: Product }) {
  const { stores, getCheapestStoreId, setPurchaseStore } = useAppData();
  const cheapestStoreId = getCheapestStoreId(product.id);
  const [selected, setSelected] = useState(cheapestStoreId ?? '');

  const unitLabel = product.unit === 'その他' ? product.customUnit || 'その他' : product.unit;

  return (
    <li className="unassigned-row">
      <div className="unassigned-row__info">
        <strong>{product.name}</strong>
        <span>{product.quantity ? `${product.quantity}${unitLabel}` : unitLabel}</span>
      </div>
      <div className="unassigned-row__actions">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} aria-label="購入する店舗">
          <option value="" disabled>
            店舗を選択
          </option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
              {store.id === cheapestStoreId ? '(最安)' : ''}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!selected}
          onClick={() => setPurchaseStore(product.id, selected)}
        >
          決定
        </button>
      </div>
    </li>
  );
}

export function UnassignedPlannedList({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div className="unassigned-section">
      <h3>店舗未選択の購入予定</h3>
      <ul className="unassigned-list">
        {products.map((product) => (
          <UnassignedRow key={product.id} product={product} />
        ))}
      </ul>
    </div>
  );
}
