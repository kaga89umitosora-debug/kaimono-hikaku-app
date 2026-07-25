import { useState } from 'react';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useAppData } from '../../context/useAppData';
import { searchProductCandidates } from '../../utils/search';
import type { Product, Store } from '../../types';

export function AddToShoppingListModal({
  selectedStoreId,
  onClose,
  onNavigateToAddProduct,
}: {
  /** 買い物リスト画面で現在選択中の店舗フィルター(「すべて」ならnull) */
  selectedStoreId: string | null;
  onClose: () => void;
  onNavigateToAddProduct: (name: string) => void;
}) {
  const { products, stores, getPrice, isInShoppingList, addToShoppingList, addCustomShoppingListEntry } =
    useAppData();

  const [query, setQuery] = useState('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [showNotFoundChoices, setShowNotFoundChoices] = useState(false);
  const [todayStorePicker, setTodayStorePicker] = useState(false);

  const [confirmAdd, setConfirmAdd] = useState<{ product: Product; store: Store } | null>(null);
  const [confirmToday, setConfirmToday] = useState<{ name: string; store: Store } | null>(null);
  const [duplicateStoreName, setDuplicateStoreName] = useState<string | null>(null);
  const [addedStoreName, setAddedStoreName] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  const candidates = activeProduct ? [] : searchProductCandidates(products, query);

  const handleTapStoreForProduct = (product: Product, store: Store) => {
    if (isInShoppingList(product.id, store.id)) {
      setDuplicateStoreName(store.name);
    } else {
      setConfirmAdd({ product, store });
    }
  };

  const handleChooseToday = () => {
    const currentStore = selectedStoreId ? stores.find((s) => s.id === selectedStoreId) : null;
    if (currentStore) {
      setConfirmToday({ name: trimmedQuery, store: currentStore });
    } else {
      setTodayStorePicker(true);
    }
  };

  const closeEverything = () => {
    setAddedStoreName(null);
    onClose();
  };

  return (
    <>
      <Modal title="買い物リストへ商品を追加" onClose={onClose}>
        {!activeProduct && !showNotFoundChoices && (
          <div className="form">
            <label className="form__field">
              <span>商品名</span>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="例: 牛乳"
              />
            </label>

            {trimmedQuery && (
              <div className="add-list-candidates">
                <p className="add-list-candidates__hint">もしかしてこちらですか?</p>
                <ul className="add-list-candidates__list">
                  {candidates.map((product) => {
                    const unitLabel =
                      product.unit === 'その他' ? product.customUnit || 'その他' : product.unit;
                    return (
                      <li key={product.id}>
                        <button
                          type="button"
                          className="add-list-candidate"
                          onClick={() => setActiveProduct(product)}
                        >
                          {product.name}
                          {product.quantity ? ` ${product.quantity}${unitLabel}` : ''}
                        </button>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      type="button"
                      className="add-list-candidate add-list-candidate--notfound"
                      onClick={() => setShowNotFoundChoices(true)}
                    >
                      この中にない
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {activeProduct && (
          <div className="form">
            <button type="button" className="btn btn--ghost" onClick={() => setActiveProduct(null)}>
              ← 戻る
            </button>
            <h3 className="add-list-product-title">{activeProduct.name}</h3>
            <ul className="add-list-store-options">
              {stores.map((store) => {
                const price = getPrice(activeProduct.id, store.id);
                if (price === undefined) return null;
                return (
                  <li key={store.id}>
                    <button
                      type="button"
                      className="add-list-store-option"
                      onClick={() => handleTapStoreForProduct(activeProduct, store)}
                    >
                      <span>{store.name}</span>
                      <span className="add-list-store-option__price">{price}円</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {stores.every((store) => getPrice(activeProduct.id, store.id) === undefined) && (
              <p className="empty-hint">価格が登録されている店舗がありません。</p>
            )}
          </div>
        )}

        {showNotFoundChoices && (
          <div className="form">
            <p>この商品をどのように登録しますか?</p>
            <div className="add-list-choice-buttons">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => onNavigateToAddProduct(trimmedQuery)}
              >
                商品比較リストに追加する
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleChooseToday}>
                今回だけ買い物リストに追加する
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setShowNotFoundChoices(false)}>
                キャンセル
              </button>
            </div>
          </div>
        )}
      </Modal>

      {todayStorePicker && (
        <Modal title="追加先の店舗を選択" onClose={() => setTodayStorePicker(false)}>
          <ul className="add-list-store-options">
            {stores.map((store) => (
              <li key={store.id}>
                <button
                  type="button"
                  className="add-list-store-option"
                  onClick={() => {
                    setTodayStorePicker(false);
                    setConfirmToday({ name: trimmedQuery, store });
                  }}
                >
                  <span>{store.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}

      {confirmAdd && (
        <ConfirmDialog
          title="買い物リストへ追加しますか?"
          message={`「${confirmAdd.product.name}」を${confirmAdd.store.name}の買い物リストへ追加しますか?`}
          confirmLabel="追加する"
          onConfirm={() => {
            addToShoppingList(confirmAdd.product.id, confirmAdd.store.id);
            setAddedStoreName(confirmAdd.store.name);
            setConfirmAdd(null);
          }}
          onCancel={() => setConfirmAdd(null)}
        />
      )}

      {confirmToday && (
        <ConfirmDialog
          title="今回だけ追加しますか?"
          message={`「${confirmToday.name}」を今回だけ、\n${confirmToday.store.name}の買い物リストへ追加しますか?`}
          confirmLabel="追加する"
          onConfirm={() => {
            addCustomShoppingListEntry(confirmToday.name, confirmToday.store.id);
            setAddedStoreName(confirmToday.store.name);
            setConfirmToday(null);
          }}
          onCancel={() => setConfirmToday(null)}
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

      {addedStoreName && (
        <Modal title="買い物リスト" onClose={closeEverything}>
          <p className="confirm-dialog__message">{addedStoreName}の買い物リストへ追加しました。</p>
          <div className="form__actions">
            <button type="button" className="btn btn--primary" onClick={closeEverything}>
              閉じる
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
