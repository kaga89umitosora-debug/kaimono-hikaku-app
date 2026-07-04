import { useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { UnassignedPlannedList } from './UnassignedPlannedList';
import { StoreGroupCard } from './StoreGroupCard';

export function ShoppingListScreen() {
  const { products, stores, manualItems } = useAppData();

  const plannedProducts = useMemo(() => products.filter((p) => p.planned), [products]);
  const unassigned = useMemo(
    () => plannedProducts.filter((p) => !p.purchaseStoreId),
    [plannedProducts]
  );
  const hasAnyItem = plannedProducts.length > 0 || manualItems.length > 0;

  return (
    <section className="screen">
      <div className="screen__header">
        <h2>買い物リスト</h2>
      </div>

      {!hasAnyItem && (
        <p className="empty-hint">購入予定の商品がありません。商品比較画面でチェックしてください。</p>
      )}

      <UnassignedPlannedList products={unassigned} />

      <div className="store-group-list">
        {stores.map((store) => (
          <StoreGroupCard
            key={store.id}
            store={store}
            products={plannedProducts.filter((p) => p.purchaseStoreId === store.id)}
            manualItems={manualItems.filter((m) => m.storeId === store.id)}
          />
        ))}
      </div>
    </section>
  );
}
