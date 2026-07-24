import type { Store } from '../../types';

export function StoreFilterTabs({
  stores,
  counts,
  selectedStoreId,
  onSelect,
}: {
  stores: Store[];
  counts: Record<string, number>;
  selectedStoreId: string | null;
  onSelect: (storeId: string | null) => void;
}) {
  return (
    <div className="store-filter-tabs">
      <button
        type="button"
        className={`store-filter-tab ${selectedStoreId === null ? 'is-active' : ''}`}
        onClick={() => onSelect(null)}
      >
        すべて
      </button>
      {stores.map((store) => (
        <button
          key={store.id}
          type="button"
          className={`store-filter-tab ${selectedStoreId === store.id ? 'is-active' : ''}`}
          onClick={() => onSelect(store.id)}
        >
          {store.name}
          {counts[store.id] ? `(${counts[store.id]})` : ''}
        </button>
      ))}
    </div>
  );
}
