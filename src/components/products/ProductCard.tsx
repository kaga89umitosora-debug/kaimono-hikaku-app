import { useEffect, useState } from 'react';
import { useAppData } from '../../context/useAppData';
import { getUnitPriceLabel } from '../../utils/calculations';
import { formatDate } from '../../utils/date';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';
import { ProductFormModal } from './ProductFormModal';
import type { Product, Store, StoreChangeRequest } from '../../types';

export function ProductCard({
  product,
  storeChangeRequest,
  onReturnToTop,
  onExitStoreChangeMode,
  justAdded,
}: {
  product: Product;
  /** 「他店購入」から遷移してきた場合のみ渡される。この商品カードを強調表示し、タップ挙動を店舗変更モードにする。 */
  storeChangeRequest?: StoreChangeRequest;
  /**
   * 通常の商品比較タブ操作(編集の保存/キャンセル、店舗をタップしての買い物リスト追加)が
   * 完了した際に、商品比較トップ画面へ戻すための呼び出し。
   * 「他店購入」から遷移してきた特殊フロー(storeChangeRequestあり)では呼ばない。
   */
  onReturnToTop?: () => void;
  /**
   * 「他店購入」モードを終了して買い物リストタブのトップへ戻すための呼び出し。
   * 店舗変更の完了時・キャンセル時のどちらからも同じ処理を使う。
   */
  onExitStoreChangeMode?: () => void;
  /** この商品が直前の「商品を追加」で登録されたばかりかどうか。「✅ 登録しました」表示に使う。 */
  justAdded?: boolean;
}) {
  const {
    stores,
    getPrice,
    setPrice,
    getCheapestStoreId,
    removeProduct,
    isInShoppingList,
    addToShoppingList,
    removeShoppingListEntry,
  } = useAppData();
  const [editing, setEditing] = useState(false);
  // 商品編集の保存直後、カード上部に一定時間だけ表示する「保存しました」表示
  const [justSaved, setJustSaved] = useState(false);
  // 価格入力欄で未保存の変更を店舗IDごとに保持する。キーが存在する店舗だけが「変更あり」。
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  // 価格保存時に不正な値(負の値・NaN・Infinityなど)が含まれていた場合のエラー表示
  const [priceError, setPriceError] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pendingAddStore, setPendingAddStore] = useState<Store | null>(null);
  const [duplicateStoreName, setDuplicateStoreName] = useState<string | null>(null);
  const [pendingMoveStore, setPendingMoveStore] = useState<Store | null>(null);
  const [moveDuplicateStoreName, setMoveDuplicateStoreName] = useState<string | null>(null);
  const [movedNotice, setMovedNotice] = useState<{ productName: string; storeName: string } | null>(null);

  const cheapestStoreId = getCheapestStoreId(product.id);
  const unitLabel = product.unit === 'その他' ? product.customUnit || 'その他' : product.unit;
  const originStoreName = storeChangeRequest
    ? stores.find((s) => s.id === storeChangeRequest.originStoreId)?.name ?? ''
    : '';

  const handleTapAdd = (store: Store) => {
    if (storeChangeRequest && store.id !== storeChangeRequest.originStoreId) {
      if (isInShoppingList(product.id, store.id)) {
        setMoveDuplicateStoreName(store.name);
      } else {
        setPendingMoveStore(store);
      }
      return;
    }
    if (isInShoppingList(product.id, store.id)) {
      setDuplicateStoreName(store.name);
    } else {
      setPendingAddStore(store);
    }
  };

  // 他店購入モードを終了して買い物リストトップへ戻す(完了時・キャンセル時で共通)
  const handleCancelStoreChange = () => {
    setPendingMoveStore(null);
    setMoveDuplicateStoreName(null);
    onExitStoreChangeMode?.();
  };

  const handleMovedNoticeClose = () => {
    setMovedNotice(null);
    onExitStoreChangeMode?.();
  };

  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 2500);
    return () => clearTimeout(timer);
  }, [justSaved]);

  const dirtyStoreIds = Object.keys(priceDrafts);
  const hasPriceDraft = dirtyStoreIds.length > 0;
  // 変更対象の中に既存価格の変更が1件でもあれば「変更を保存」、すべて新規入力なら「価格を登録」と表示する
  const hasExistingPriceChange = dirtyStoreIds.some((id) => getPrice(product.id, id) !== undefined);
  const savePriceLabel = hasExistingPriceChange ? '変更を保存' : '価格を登録';

  const handlePriceInputChange = (storeId: string, raw: string) => {
    setPriceError(false);
    const original = getPrice(product.id, storeId);
    const originalStr = original !== undefined ? String(original) : '';
    setPriceDrafts((prev) => {
      if (raw === originalStr) {
        if (!(storeId in prev)) return prev;
        const next = { ...prev };
        delete next[storeId];
        return next;
      }
      return { ...prev, [storeId]: raw };
    });
  };

  const handleSavePrices = () => {
    const parsedEntries = Object.entries(priceDrafts).map(([storeId, raw]) => {
      const trimmed = raw.trim();
      return { storeId, price: trimmed === '' ? null : Number(trimmed) };
    });
    const hasInvalidPrice = parsedEntries.some(
      ({ price }) => price !== null && (!Number.isFinite(price) || price < 0)
    );
    if (hasInvalidPrice) {
      setPriceError(true);
      return;
    }
    setPriceError(false);
    for (const { storeId, price } of parsedEntries) {
      setPrice(product.id, storeId, price);
    }
    setPriceDrafts({});
  };

  const handleCancelPrices = () => {
    setPriceDrafts({});
    setPriceError(false);
  };

  return (
    <article
      className={`product-card ${storeChangeRequest ? 'product-card--highlighted' : ''}`}
      data-product-id={product.id}
    >
      {justSaved && <p className="product-card__saved-badge">✅ 保存しました</p>}
      {justAdded && <p className="product-card__added-badge">✅ 登録しました</p>}
      <header className="product-card__header">
        <div>
          <h3>{product.name}</h3>
          <p className="product-card__meta">
            {product.quantity ? `${product.quantity}${unitLabel}` : unitLabel}
            <span className="product-card__updated"> ・更新日 {formatDate(product.updatedAt)}</span>
          </p>
          {product.comment && <p className="product-card__comment">{product.comment}</p>}
          {storeChangeRequest && (
            <p className="product-card__move-hint">
              {originStoreName}から購入する店舗を変更する場合は、他の店舗をタップしてください。
            </p>
          )}
        </div>
      </header>

      <div className="product-card__prices">
        {stores.length === 0 && <p className="empty-hint">先に店舗を登録してください。</p>}
        {hasPriceDraft && <p className="product-card__unsaved-badge">未保存の価格変更があります</p>}
        {stores.map((store) => {
          const price = getPrice(product.id, store.id);
          const isCheapest = price !== undefined && cheapestStoreId === store.id;
          const unitPriceLabel = price !== undefined ? getUnitPriceLabel(price, product.quantity) : null;
          const draft = priceDrafts[store.id];
          return (
            <div key={store.id} className={`price-cell ${isCheapest ? 'price-cell--cheapest' : ''}`}>
              <button type="button" className="price-cell__store" onClick={() => handleTapAdd(store)}>
                {store.name}
                <span className={`price-cell__amount ${price === undefined ? 'price-cell__amount--unset' : ''}`}>
                  {price !== undefined ? `${price}円` : '価格未設定'}
                </span>
              </button>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={draft ?? (price ?? '')}
                placeholder="未入力"
                onChange={(e) => handlePriceInputChange(store.id, e.target.value)}
              />
              {unitPriceLabel && <span className="price-cell__unit-price">{unitPriceLabel}</span>}
            </div>
          );
        })}
        {priceError && (
          <p className="product-card__price-error">価格は0以上の数字で入力してください</p>
        )}
        {hasPriceDraft && (
          <div className="product-card__price-actions">
            <button type="button" className="btn btn--ghost" onClick={handleCancelPrices}>
              キャンセル
            </button>
            <button type="button" className="btn btn--primary" onClick={handleSavePrices}>
              {savePriceLabel}
            </button>
          </div>
        )}
      </div>

      <div className="product-card__actions">
        <button type="button" className="btn btn--ghost" onClick={() => setEditing(true)}>
          編集
        </button>
        {storeChangeRequest ? (
          <button type="button" className="btn btn--ghost" onClick={handleCancelStoreChange}>
            キャンセル
          </button>
        ) : (
          <button type="button" className="btn btn--danger-outline" onClick={() => setConfirmingDelete(true)}>
            削除
          </button>
        )}
      </div>

      {editing && (
        <ProductFormModal
          title="商品を編集"
          productId={product.id}
          initialValue={product}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            setJustSaved(true);
          }}
        />
      )}

      {confirmingDelete && (
        <ConfirmDialog
          title="商品を削除しますか?"
          message={`「${product.name}」の価格データもすべて削除されます。`}
          onConfirm={() => {
            removeProduct(product.id);
            setConfirmingDelete(false);
          }}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}

      {pendingAddStore && (
        <ConfirmDialog
          title="買い物リストへ追加しますか?"
          message={`「${product.name}」を${pendingAddStore.name}の買い物リストへ追加しますか?`}
          confirmLabel="追加する"
          onConfirm={() => {
            addToShoppingList(product.id, pendingAddStore.id);
            setPendingAddStore(null);
            // 通常フロー(他店購入モード中ではない)での追加完了時のみ、トップ画面へ戻す
            if (!storeChangeRequest) {
              onReturnToTop?.();
            }
          }}
          onCancel={() => setPendingAddStore(null)}
        />
      )}

      {duplicateStoreName && (
        <Modal title="買い物リスト" onClose={() => setDuplicateStoreName(null)}>
          <p className="confirm-dialog__message">すでに登録されています。</p>
          <div className="form__actions">
            <button type="button" className="btn btn--primary" onClick={() => setDuplicateStoreName(null)}>
              閉じる
            </button>
          </div>
        </Modal>
      )}

      {pendingMoveStore && storeChangeRequest && (
        <ConfirmDialog
          title="購入店舗を変更しますか?"
          message={`「${product.name}」の購入店舗を\n${originStoreName}から${pendingMoveStore.name}へ変更しますか?`}
          confirmLabel="変更する"
          onConfirm={() => {
            removeShoppingListEntry(storeChangeRequest.entryId);
            addToShoppingList(product.id, pendingMoveStore.id);
            setMovedNotice({ productName: product.name, storeName: pendingMoveStore.name });
            setPendingMoveStore(null);
          }}
          onCancel={handleCancelStoreChange}
        />
      )}

      {moveDuplicateStoreName && (
        <Modal title="買い物リスト" onClose={() => setMoveDuplicateStoreName(null)}>
          <p className="confirm-dialog__message">
            この商品は、すでに{moveDuplicateStoreName}の買い物リストへ登録されています。
          </p>
          <div className="form__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setMoveDuplicateStoreName(null)}
            >
              閉じる
            </button>
          </div>
        </Modal>
      )}

      {movedNotice && (
        <Modal title="買い物リスト" onClose={handleMovedNoticeClose}>
          <p className="confirm-dialog__message">
            {movedNotice.productName}を{movedNotice.storeName}の買い物リストへ移動しました。
          </p>
          <div className="form__actions">
            <button type="button" className="btn btn--primary" onClick={handleMovedNoticeClose}>
              閉じる
            </button>
          </div>
        </Modal>
      )}
    </article>
  );
}
