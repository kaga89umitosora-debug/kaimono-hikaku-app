import { useEffect, useMemo, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { SearchBox } from './SearchBox';
import { ProductFormModal } from './ProductFormModal';
import { ProductCard } from './ProductCard';
import { scrollAppContentToTop } from '../../utils/scroll';
import type { StoreChangeRequest } from '../../types';

export function ProductComparisonScreen({
  storeChangeRequest,
  onStoreChangeHandled,
  prefillAddName,
  onPrefillHandled,
  onReturnToShoppingList,
}: {
  /** 買い物リストの「他店購入」から遷移してきた場合のリクエスト */
  storeChangeRequest?: StoreChangeRequest | null;
  onStoreChangeHandled?: () => void;
  /** 買い物リストの「この中にない→商品比較リストに追加する」から遷移してきた場合の初期商品名 */
  prefillAddName?: string | null;
  onPrefillHandled?: () => void;
  /** 買い物リスト起点の商品追加、および他店購入モードの終了時に、買い物リストタブへ戻すためのApp側コールバック */
  onReturnToShoppingList?: () => void;
}) {
  const { products } = useAppData();
  const [keyword, setKeyword] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  // 商品追加モーダルをどこから開いたか。戻り先の画面をここで判別する。
  const [addOrigin, setAddOrigin] = useState<'normal' | 'shopping-list'>('normal');

  const isStoreChangeMode = !!storeChangeRequest;

  // 他店購入で遷移してきた商品が検索フィルターで隠れないようにする
  useEffect(() => {
    if (storeChangeRequest) {
      setKeyword('');
    }
  }, [storeChangeRequest]);

  useEffect(() => {
    if (prefillAddName) {
      setAddOrigin('shopping-list');
      setIsAdding(true);
    }
  }, [prefillAddName]);

  /**
   * 商品比較トップ画面へ戻す際の共通リセット処理。
   * 「検索候補を閉じる」「選択中の商品を解除する」に対応する専用stateは
   * 現状この画面には存在しない(下部の商品追加モーダル内の入力値は
   * isAddingをfalseにしてモーダルをアンマウントすることでまとめて消える)。
   * 強調表示(storeChangeRequest)・他店購入モード・追加画面への商品名引き継ぎ(prefillAddName)は
   * App側が保持するhandoff stateのため、対応するコールバックを呼んで解除する。
   * 通常の商品比較タブから開いた操作(追加・編集の保存/キャンセル)の戻り先はここ。
   */
  const resetProductComparisonView = () => {
    setKeyword('');
    setIsAdding(false);
    onStoreChangeHandled?.();
    onPrefillHandled?.();
    scrollAppContentToTop();
  };

  /**
   * 買い物リストの「商品比較リストに追加する」から開いた商品追加モーダルの戻り先。
   * 商品比較タブには残さず、買い物リストタブのトップ画面へ戻す。
   */
  const returnToShoppingListTop = () => {
    setIsAdding(false);
    onPrefillHandled?.();
    onStoreChangeHandled?.();
    onReturnToShoppingList?.();
    scrollAppContentToTop();
  };

  /**
   * 他店購入モードの終了(完了時・キャンセル時で共通)。
   * 商品比較タブには残さず、買い物リストタブのトップ画面へ戻す。
   */
  const exitStoreChangeMode = () => {
    onStoreChangeHandled?.();
    onReturnToShoppingList?.();
    scrollAppContentToTop();
  };

  const filtered = useMemo(() => {
    if (storeChangeRequest) {
      return products.filter((p) => p.id === storeChangeRequest.productId);
    }
    const kw = keyword.trim();
    if (!kw) return products;
    return products.filter((p) => p.name.includes(kw));
  }, [products, keyword, storeChangeRequest]);

  return (
    <section className="screen">
      <div className="screen__header">
        <h2>商品比較</h2>
        {!isStoreChangeMode && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setAddOrigin('normal');
              setIsAdding(true);
            }}
          >
            + 商品を追加
          </button>
        )}
      </div>

      {!isStoreChangeMode && <SearchBox value={keyword} onChange={setKeyword} />}

      {filtered.length === 0 && <p className="empty-hint">該当する商品がありません。</p>}

      <div className="product-list">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            storeChangeRequest={
              storeChangeRequest?.productId === product.id ? storeChangeRequest : undefined
            }
            onReturnToTop={resetProductComparisonView}
            onExitStoreChangeMode={exitStoreChangeMode}
          />
        ))}
      </div>

      {isAdding && (
        <ProductFormModal
          title="商品を追加"
          initialName={prefillAddName ?? undefined}
          purchaseStoreOrigin={addOrigin === 'shopping-list'}
          onClose={addOrigin === 'shopping-list' ? returnToShoppingListTop : resetProductComparisonView}
        />
      )}
    </section>
  );
}
