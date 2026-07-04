import { useMemo, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { SearchBox } from './SearchBox';
import { ProductFormModal } from './ProductFormModal';
import { ProductCard } from './ProductCard';

export function ProductComparisonScreen() {
  const { products, addProduct } = useAppData();
  const [keyword, setKeyword] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [autoFocusProductId, setAutoFocusProductId] = useState<string | null>(null);

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
            autoFocusPrice={product.id === autoFocusProductId}
            onAutoFocusHandled={() => setAutoFocusProductId(null)}
          />
        ))}
      </div>

      {isAdding && (
        <ProductFormModal
          title="商品を追加"
          onSubmit={(value) => {
            const newId = addProduct(value);
            setIsAdding(false);
            setAutoFocusProductId(newId);
          }}
          onClose={() => setIsAdding(false)}
        />
      )}
    </section>
  );
}
