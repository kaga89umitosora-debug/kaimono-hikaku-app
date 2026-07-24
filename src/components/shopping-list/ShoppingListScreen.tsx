import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { StoreGroupCard } from './StoreGroupCard';
import { StoreFilterTabs } from './StoreFilterTabs';
import { AddToShoppingListModal } from './AddToShoppingListModal';
import type { Product, ShoppingListEntry, Store, StoreChangeRequest } from '../../types';

type ResolvedEntry = { entry: ShoppingListEntry; product: Product | null };

function resolveEntries(entries: ShoppingListEntry[], products: Product[], store: Store): ResolvedEntry[] {
  const resolved: ResolvedEntry[] = [];
  for (const entry of entries) {
    if (entry.storeId !== store.id) continue;
    if (entry.productId === null) {
      resolved.push({ entry, product: null });
      continue;
    }
    const product = products.find((p) => p.id === entry.productId);
    if (product) resolved.push({ entry, product });
  }
  return resolved;
}

export function ShoppingListScreen({
  onRequestStoreChange,
  onNavigateToAddProduct,
}: {
  onRequestStoreChange: (request: StoreChangeRequest) => void;
  onNavigateToAddProduct: (name: string) => void;
}) {
  const { stores, products, manualItems, shoppingListEntries } = useAppData();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);

  const visibleStores = selectedStoreId === null ? stores : stores.filter((s) => s.id === selectedStoreId);

  const counts: Record<string, number> = {};
  for (const store of stores) {
    counts[store.id] =
      shoppingListEntries.filter((e) => e.storeId === store.id).length +
      manualItems.filter((m) => m.storeId === store.id).length;
  }

  const hasAnyItemAtAll = shoppingListEntries.length > 0 || manualItems.length > 0;
  const hasItemsForSelection =
    selectedStoreId === null ? hasAnyItemAtAll : (counts[selectedStoreId] ?? 0) > 0;

  return (
    <section className="screen">
      <div className="screen__header">
        <h2>買い物リスト</h2>
        <button type="button" className="btn btn--primary" onClick={() => setIsAddingItem(true)}>
          + 商品を追加
        </button>
      </div>

      {stores.length > 0 && (
        <StoreFilterTabs
          stores={stores}
          counts={counts}
          selectedStoreId={selectedStoreId}
          onSelect={setSelectedStoreId}
        />
      )}

      {!hasItemsForSelection && (
        <p className="empty-hint">
          {selectedStoreId === null
            ? '買い物リストに商品がありません。「+ 商品を追加」または商品比較画面で店舗の価格をタップして追加してください。'
            : 'この店舗の買い物リストには商品がありません。'}
        </p>
      )}

      <div className="store-group-list">
        {visibleStores.map((store) => (
          <StoreGroupCard
            key={store.id}
            store={store}
            entries={resolveEntries(shoppingListEntries, products, store)}
            manualItems={manualItems.filter((m) => m.storeId === store.id)}
            onRequestStoreChange={onRequestStoreChange}
          />
        ))}
      </div>

      {isAddingItem && (
        <AddToShoppingListModal
          selectedStoreId={selectedStoreId}
          onClose={() => setIsAddingItem(false)}
          onNavigateToAddProduct={(name) => {
            setIsAddingItem(false);
            onNavigateToAddProduct(name);
          }}
        />
      )}
    </section>
  );
}
