import { useAppData } from '../../context/AppDataContext';
import { StoreGroupCard } from './StoreGroupCard';
import type { Product, ShoppingListEntry, Store } from '../../types';

function resolveEntries(
  entries: ShoppingListEntry[],
  products: Product[],
  store: Store
): { entry: ShoppingListEntry; product: Product }[] {
  return entries
    .filter((entry) => entry.storeId === store.id)
    .flatMap((entry) => {
      const product = products.find((p) => p.id === entry.productId);
      return product ? [{ entry, product }] : [];
    });
}

export function ShoppingListScreen() {
  const { stores, products, manualItems, shoppingListEntries } = useAppData();

  const hasAnyItem = shoppingListEntries.length > 0 || manualItems.length > 0;

  return (
    <section className="screen">
      <div className="screen__header">
        <h2>買い物リスト</h2>
      </div>

      {!hasAnyItem && (
        <p className="empty-hint">
          買い物リストに商品がありません。商品比較画面で店舗の価格をタップして追加してください。
        </p>
      )}

      <div className="store-group-list">
        {stores.map((store) => (
          <StoreGroupCard
            key={store.id}
            store={store}
            entries={resolveEntries(shoppingListEntries, products, store)}
            manualItems={manualItems.filter((m) => m.storeId === store.id)}
          />
        ))}
      </div>
    </section>
  );
}
