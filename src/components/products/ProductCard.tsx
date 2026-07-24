import { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
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

  return (
    <article className={`product-card ${storeChangeRequest ? 'product-card--highlighted' : ''}`}>
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
        {stores.map((store) => {
          const price = getPrice(product.id, store.id);
          const isCheapest = price !== undefined && cheapestStoreId === store.id;
          const unitPriceLabel = price !== undefined ? getUnitPriceLabel(price, product.quantity) : null;
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
                value={price ?? ''}
                placeholder="未入力"
                onChange={(e) => {
                  const raw = e.target.value;
                  setPrice(product.id, store.id, raw === '' ? null : Number(raw));
                }}
              />
              {unitPriceLabel && <span className="price-cell__unit-price">{unitPriceLabel}</span>}
            </div>
          );
        })}
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
          onClose={() => {
            setEditing(false);
            onReturnToTop?.();
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
