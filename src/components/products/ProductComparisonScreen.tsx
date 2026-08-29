import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppData } from '../../context/useAppData';
import { useI18n } from '../../i18n';
import { SearchBox } from './SearchBox';
import { ProductFormModal } from './ProductFormModal';
import { ProductCard } from './ProductCard';
import { scrollAppContentToTop } from '../../utils/scroll';
import { sortMatchesByRelevance } from '../../utils/search';
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
  const { t } = useI18n();
  // 商品比較画面の最上部の基準位置。resetProductComparisonViewでの復帰先に使う。
  const topRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  // 商品追加モーダルをどこから開いたか。戻り先の画面をここで判別する。
  const [addOrigin, setAddOrigin] = useState<'normal' | 'shopping-list'>('normal');
  // 追加直後の商品ID。「✅ 登録しました」を該当カードに一定時間だけ表示するのに使う。
  const [justAddedProductId, setJustAddedProductId] = useState<string | null>(null);

  useEffect(() => {
    if (!justAddedProductId) return;
    const timer = setTimeout(() => setJustAddedProductId(null), 2500);
    return () => clearTimeout(timer);
  }, [justAddedProductId]);

  // 追加した商品カードが検索フィルターや一覧下部で見えない位置にあっても、
  // 一覧の再描画(検索クリア反映)を待ってから確実にスクロールして表示する。
  useEffect(() => {
    if (!justAddedProductId) return;
    const id = justAddedProductId;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const el = document.querySelector(`[data-product-id="${CSS.escape(id)}"]`);
        el?.scrollIntoView({ behavior: 'auto', block: 'center' });
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [justAddedProductId]);

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
    scrollAppContentToTop(topRef.current);
  };

  /**
   * 通常フローでの商品追加モーダルのキャンセル。商品は登録せずモーダルを閉じるだけで、
   * トップへは自動で戻さない(編集のキャンセルと同じ考え方)。
   */
  const handleAddCancel = () => {
    setIsAdding(false);
  };

  /**
   * 通常フローでの商品追加保存。モーダルを閉じ、検索キーワードが追加した商品を隠さないよう
   * クリアしたうえで、追加した商品カードまでスクロールし「✅ 登録しました」を一定時間だけ表示する。
   * トップへは戻さず、追加したカードをそのまま確認できる位置へ移動する。
   */
  const handleAddSaved = (id: string) => {
    setIsAdding(false);
    setKeyword('');
    setJustAddedProductId(id);
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
    return sortMatchesByRelevance(products, kw);
  }, [products, keyword, storeChangeRequest]);

  return (
    <section className="screen">
      <div ref={topRef} />
      <div className="screen__header">
        <h2>{t('screen.products.title')}</h2>
        {!isStoreChangeMode && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setAddOrigin('normal');
              setIsAdding(true);
            }}
          >
            {t('screen.products.addProduct')}
          </button>
        )}
      </div>

      {!isStoreChangeMode && (
        <p className="screen__description">{t('product.tapHint')}</p>
      )}

      {!isStoreChangeMode && <SearchBox value={keyword} onChange={setKeyword} />}

      {filtered.length === 0 && <p className="empty-hint">{t('product.noMatch')}</p>}

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
            justAdded={justAddedProductId === product.id}
          />
        ))}
      </div>

      {!isStoreChangeMode && filtered.length > 0 && (
        <div className="product-list__footer">
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={resetProductComparisonView}
          >
            {t('product.backToTop')}
          </button>
        </div>
      )}

      {isAdding && (
        <ProductFormModal
          title={t('product.addTitle')}
          initialName={prefillAddName ?? undefined}
          purchaseStoreOrigin={addOrigin === 'shopping-list'}
          onClose={addOrigin === 'shopping-list' ? returnToShoppingListTop : handleAddCancel}
          onSaved={addOrigin === 'shopping-list' ? undefined : handleAddSaved}
        />
      )}
    </section>
  );
}
