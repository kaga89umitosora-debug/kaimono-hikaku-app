import { useState } from 'react';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useAppData } from '../../context/useAppData';
import { useI18n, joinQuantityUnit, resolveUnitLabel, formatPriceNumber } from '../../i18n';
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
  const { t, language } = useI18n();

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
      <Modal title={t('shoppingList.addModalTitle')} onClose={onClose}>
        {!activeProduct && !showNotFoundChoices && (
          <div className="form">
            <label className="form__field">
              <span>{t('product.nameLabel')}</span>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('shoppingList.searchPlaceholder')}
              />
            </label>

            {trimmedQuery && (
              <div className="add-list-candidates">
                <p className="add-list-candidates__hint">{t('shoppingList.suggestHint')}</p>
                <ul className="add-list-candidates__list">
                  {candidates.map((product) => {
                    // 単位未設定・未知の単位・その他で独自単位が空欄の場合は null になる。
                    // その場合は数量だけを表示する。既知の単位は現在言語のラベル、
                    // 'その他' の customUnit はユーザー入力のまま。
                    const unitLabel = resolveUnitLabel(product.unit, product.customUnit, t);
                    const hasNoPrice = stores.every((store) => getPrice(product.id, store.id) === undefined);
                    return (
                      <li key={product.id}>
                        <button
                          type="button"
                          className="add-list-candidate"
                          onClick={() => setActiveProduct(product)}
                        >
                          <span className="add-list-candidate__name">
                            {product.name}
                            {product.quantity
                              ? ` ${joinQuantityUnit(product.quantity, unitLabel, language)}`
                              : ''}
                          </span>
                          {hasNoPrice && (
                            <span className="add-list-candidate__price-status">
                              {t('shoppingList.noPriceYet')}
                            </span>
                          )}
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
                      {t('shoppingList.noneOfThese')}
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
              ← {t('common.back')}
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
                      <span className="add-list-store-option__price">
                        {formatPriceNumber(price, language)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {stores.every((store) => getPrice(activeProduct.id, store.id) === undefined) && (
              <p className="empty-hint">{t('shoppingList.noStoreWithPrice')}</p>
            )}
          </div>
        )}

        {showNotFoundChoices && (
          <div className="form">
            <p>{t('shoppingList.notFoundPrompt')}</p>
            <div className="add-list-choice-buttons">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => onNavigateToAddProduct(trimmedQuery)}
              >
                {t('shoppingList.addToComparison')}
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleChooseToday}>
                {t('shoppingList.addTodayOnly')}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setShowNotFoundChoices(false)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {todayStorePicker && (
        <Modal title={t('shoppingList.pickStoreTitle')} onClose={() => setTodayStorePicker(false)}>
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
          title={t('product.addToListConfirmTitle')}
          message={t('product.addToListConfirmMessage', {
            name: confirmAdd.product.name,
            store: confirmAdd.store.name,
          })}
          confirmLabel={t('common.addAction')}
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
          title={t('shoppingList.addTodayConfirmTitle')}
          message={t('shoppingList.addTodayConfirmMessage', {
            name: confirmToday.name,
            store: confirmToday.store.name,
          })}
          confirmLabel={t('common.addAction')}
          onConfirm={() => {
            addCustomShoppingListEntry(confirmToday.name, confirmToday.store.id);
            setAddedStoreName(confirmToday.store.name);
            setConfirmToday(null);
          }}
          onCancel={() => setConfirmToday(null)}
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

      {addedStoreName && (
        <Modal title={t('nav.shoppingList')} onClose={closeEverything}>
          <p className="confirm-dialog__message">
            {t('shoppingList.addedToStoreNotice', { store: addedStoreName })}
          </p>
          <div className="form__actions">
            <button type="button" className="btn btn--primary" onClick={closeEverything}>
              {t('common.close')}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
