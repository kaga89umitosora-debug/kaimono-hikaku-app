import { useEffect, useRef, useState } from 'react';
import { useAppData } from '../../context/useAppData';
import { useI18n, joinQuantityUnit, resolveUnitLabel, formatPriceNumber } from '../../i18n';
import { getUnitPriceLabel } from '../../utils/calculations';
import { formatDate } from '../../utils/date';
import { scrollElementToViewportTop } from '../../utils/scroll';
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
    getCheapestStoreId,
    removeProduct,
    isInShoppingList,
    addToShoppingList,
    removeShoppingListEntry,
  } = useAppData();
  const { t, language } = useI18n();
  const [editing, setEditing] = useState(false);
  // 商品編集の保存直後、カード上部に一定時間だけ表示する「保存しました」表示
  const [justSaved, setJustSaved] = useState(false);
  // 価格未設定の店舗に新しく価格を登録した直後、「保存しました」の代わりに一定時間だけ表示する
  // 「登録しました」表示。商品追加時(justAdded)と同じデザイン・挙動を流用する。
  const [justRegisteredPrice, setJustRegisteredPrice] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pendingAddStore, setPendingAddStore] = useState<Store | null>(null);
  const [duplicateStoreName, setDuplicateStoreName] = useState<string | null>(null);
  const [pendingMoveStore, setPendingMoveStore] = useState<Store | null>(null);
  const [moveDuplicateStoreName, setMoveDuplicateStoreName] = useState<string | null>(null);
  const [movedNotice, setMovedNotice] = useState<{ productName: string; storeName: string } | null>(null);
  // 編集保存後、商品名をビューポート最上部へ合わせるためのref。
  const nameRef = useRef<HTMLHeadingElement>(null);

  const cheapestStoreId = getCheapestStoreId(product.id);
  // 単位未設定・未知の単位・その他で独自単位が空欄の場合は null になる。
  // その場合、数量があれば数量だけを表示し、数量もなければ何も表示しない。
  // 既知の単位は現在言語のラベルへ、'その他' の customUnit はユーザー入力のまま。
  const unitLabel = resolveUnitLabel(product.unit, product.customUnit, t);
  const quantityLabel = joinQuantityUnit(product.quantity, unitLabel, language);
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

  useEffect(() => {
    if (!justRegisteredPrice) return;
    const timer = setTimeout(() => setJustRegisteredPrice(false), 2500);
    return () => clearTimeout(timer);
  }, [justRegisteredPrice]);

  return (
    <article
      className={`product-card ${storeChangeRequest ? 'product-card--highlighted' : ''}`}
      data-product-id={product.id}
    >
      {justSaved && <p className="product-card__saved-badge">{t('product.savedBadge')}</p>}
      {(justAdded || justRegisteredPrice) && (
        <p className="product-card__added-badge">{t('product.addedBadge')}</p>
      )}
      <header className="product-card__header">
        <div className="product-card__header-main">
          <h3 ref={nameRef}>{product.name}</h3>
          <p className="product-card__meta">
            {quantityLabel}
            <span className="product-card__updated">
              {' '}
              {t('product.updatedOn')} {formatDate(product.updatedAt)}
            </span>
          </p>
          {product.comment && <p className="product-card__comment">{product.comment}</p>}
          {storeChangeRequest && (
            <p className="product-card__move-hint">
              {t('product.moveHint', { store: originStoreName })}
            </p>
          )}
        </div>
        <div className="product-card__header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setEditing(true)}
            aria-label={t('product.editAria', { name: product.name })}
          >
            ✎
          </button>
          {!storeChangeRequest && (
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={() => setConfirmingDelete(true)}
              aria-label={t('product.deleteAria', { name: product.name })}
            >
              🗑
            </button>
          )}
        </div>
      </header>

      <div className="product-card__prices">
        {stores.length === 0 && <p className="empty-hint">{t('product.registerStoreFirst')}</p>}
        {stores.map((store) => {
          const price = getPrice(product.id, store.id);
          const isCheapest = price !== undefined && cheapestStoreId === store.id;
          const unitPriceLabel =
            price !== undefined ? getUnitPriceLabel(price, product.quantity, unitLabel) : null;
          return (
            <div key={store.id} className={`price-cell ${isCheapest ? 'price-cell--cheapest' : ''}`}>
              <button type="button" className="price-cell__store" onClick={() => handleTapAdd(store)}>
                {store.name}
                <span className={`price-cell__amount ${price === undefined ? 'price-cell__amount--unset' : ''}`}>
                  {price !== undefined ? formatPriceNumber(price, language) : t('product.priceUnset')}
                </span>
              </button>
              {unitPriceLabel && (
                <span className="price-cell__unit-price">
                  {t('common.unitPrice')} {unitPriceLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {storeChangeRequest && (
        <div className="product-card__actions">
          <button type="button" className="btn btn--ghost" onClick={handleCancelStoreChange}>
            {t('common.cancel')}
          </button>
        </div>
      )}

      {editing && (
        <ProductFormModal
          title={t('product.editTitle')}
          productId={product.id}
          initialValue={product}
          onClose={() => setEditing(false)}
          onSaved={(_id, options) => {
            setEditing(false);
            if (options?.registeredNewPrice) {
              setJustSaved(false);
              setJustRegisteredPrice(true);
            } else {
              setJustRegisteredPrice(false);
              setJustSaved(true);
            }
            // 固定ヘッダーが存在しないレイアウトのためtopOffsetは0。
            // 検索条件から外れてこのカードがアンマウントされた場合は
            // rAF発火時にnameRef.currentがnullとなり、何も行わない。
            scrollElementToViewportTop(nameRef);
          }}
        />
      )}

      {confirmingDelete && (
        <ConfirmDialog
          title={t('product.deleteConfirmTitle')}
          message={t('dialog.deleteProduct', { name: product.name })}
          confirmLabel={t('common.confirmDelete')}
          onConfirm={() => {
            removeProduct(product.id);
            setConfirmingDelete(false);
          }}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}

      {pendingAddStore && (
        <ConfirmDialog
          title={t('product.addToListConfirmTitle')}
          message={t('product.addToListConfirmMessage', {
            name: product.name,
            store: pendingAddStore.name,
          })}
          confirmLabel={t('common.addAction')}
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
        <Modal title={t('nav.shoppingList')} onClose={() => setDuplicateStoreName(null)}>
          <p className="confirm-dialog__message">{t('product.alreadyInList')}</p>
          <div className="form__actions">
            <button type="button" className="btn btn--primary" onClick={() => setDuplicateStoreName(null)}>
              {t('common.close')}
            </button>
          </div>
        </Modal>
      )}

      {pendingMoveStore && storeChangeRequest && (
        <ConfirmDialog
          title={t('product.changeStoreConfirmTitle')}
          message={t('product.changeStoreConfirmMessage', {
            name: product.name,
            from: originStoreName,
            to: pendingMoveStore.name,
          })}
          confirmLabel={t('common.changeAction')}
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
        <Modal title={t('nav.shoppingList')} onClose={() => setMoveDuplicateStoreName(null)}>
          <p className="confirm-dialog__message">
            {t('product.alreadyInListNamed', { store: moveDuplicateStoreName })}
          </p>
          <div className="form__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setMoveDuplicateStoreName(null)}
            >
              {t('common.close')}
            </button>
          </div>
        </Modal>
      )}

      {movedNotice && (
        <Modal title={t('nav.shoppingList')} onClose={handleMovedNoticeClose}>
          <p className="confirm-dialog__message">
            {t('product.movedNotice', {
              name: movedNotice.productName,
              store: movedNotice.storeName,
            })}
          </p>
          <div className="form__actions">
            <button type="button" className="btn btn--primary" onClick={handleMovedNoticeClose}>
              {t('common.close')}
            </button>
          </div>
        </Modal>
      )}
    </article>
  );
}
