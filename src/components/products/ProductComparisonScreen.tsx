import { useEffect, useMemo, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { SearchBox } from './SearchBox';
import { ProductFormModal } from './ProductFormModal';
import { ProductCard } from './ProductCard';
import type { StoreChangeRequest } from '../../types';

export function ProductComparisonScreen({
  storeChangeRequest,
  onStoreChangeHandled,
  prefillAddName,
  onPrefillHandled,
}: {
  /** 買い物リストの「他店購入」から遷移してきた場合のリクエスト */
  storeChangeRequest?: StoreChangeRequest | null;
  onStoreChangeHandled?: () => void;
  /** 買い物リストの「この中にない→商品比較リストに追加する」から遷移してきた場合の初期商品名 */
  prefillAddName?: string | null;
  onPrefillHandled?: () => void;
}) {
  const { products } = useAppData();
  const [keyword, setKeyword] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // 他店購入で遷移してきた商品が検索フィルターで隠れないようにする
  useEffect(() => {
    if (storeChangeRequest) {
      setKeyword('');
    }
  }, [storeChangeRequest]);

  useEffect(() => {
    if (prefillAddName) {
      setIsAdding(true);
    }
  }, [prefillAddName]);

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    if (!kw) return products;
    return products.filter((p) => p.name.includes(kw));
  }, [products, keyword]);

  return (
    <section className="screen">
      <div className="screen__header">
        <h2>商品比較</h2>
        <button type="button" className="btn btn--primary" onClick={() => setIsAdding(true)}>
          + 商品を追加
        </button>
      </div>

      <SearchBox value={keyword} onChange={setKeyword} />

      {filtered.length === 0 && <p className="empty-hint">該当する商品がありません。</p>}

      <div className="product-list">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            storeChangeRequest={
              storeChangeRequest?.productId === product.id ? storeChangeRequest : undefined
            }
            onStoreChangeHandled={onStoreChangeHandled}
          />
        ))}
      </div>

      {isAdding && (
        <ProductFormModal
          title="商品を追加"
          initialName={prefillAddName ?? undefined}
          onClose={() => {
            setIsAdding(false);
            onPrefillHandled?.();
          }}
        />
      )}
    </section>
  );
}
