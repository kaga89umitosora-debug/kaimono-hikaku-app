import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Modal } from '../common/Modal';
import { UNIT_OPTIONS } from '../../types';
import type { Unit } from '../../types';
import { useAppData } from '../../context/AppDataContext';

export interface ProductFormValue {
  name: string;
  quantity: number | null;
  unit: Unit;
  customUnit?: string;
  comment: string;
}

export function ProductFormModal({
  title,
  productId,
  initialValue,
  initialName,
  purchaseStoreOrigin = false,
  onClose,
}: {
  title: string;
  /** 既存商品を編集する場合のみ渡す。未指定なら新規追加として扱う。 */
  productId?: string;
  initialValue?: ProductFormValue;
  /** 新規追加時、商品名欄に初期入力しておく値(買い物リストからの遷移用)。initialValueがあれば無視される。 */
  initialName?: string;
  /**
   * 買い物リストの「商品比較リストに追加する」から遷移してきた場合のみtrue。
   * 購入店舗の選択欄を表示し、保存時にその店舗の買い物リストへも追加する。
   */
  purchaseStoreOrigin?: boolean;
  onClose: () => void;
}) {
  const { stores, getPrice, setPrice, addProduct, updateProduct, addToShoppingList } = useAppData();
  const [name, setName] = useState(initialValue?.name ?? initialName ?? '');
  const [quantity, setQuantity] = useState(
    initialValue?.quantity != null ? String(initialValue.quantity) : ''
  );
  const [unit, setUnit] = useState<Unit>(initialValue?.unit ?? '個');
  const [customUnit, setCustomUnit] = useState(initialValue?.customUnit ?? '');
  const [comment, setComment] = useState(initialValue?.comment ?? '');
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    if (!productId) return {};
    const initial: Record<string, string> = {};
    for (const store of stores) {
      const price = getPrice(productId, store.id);
      initial[store.id] = price !== undefined ? String(price) : '';
    }
    return initial;
  });
  const [purchaseStoreId, setPurchaseStoreId] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<{ productName: string; storeName: string } | null>(null);
  const customUnitInputRef = useRef<HTMLInputElement>(null);
  const isFirstUnitRender = useRef(true);

  useEffect(() => {
    if (isFirstUnitRender.current) {
      isFirstUnitRender.current = false;
      return;
    }
    if (unit === 'その他') {
      customUnitInputRef.current?.focus();
    }
  }, [unit]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (unit === 'その他' && !customUnit.trim()) return;

    const input = {
      name: trimmedName,
      quantity: quantity === '' ? null : Number(quantity),
      unit,
      customUnit: unit === 'その他' ? customUnit.trim() : undefined,
      comment: comment.trim(),
    };

    const id = productId ?? addProduct(input);
    if (productId) {
      updateProduct(productId, input);
    }

    for (const store of stores) {
      const raw = prices[store.id] ?? '';
      setPrice(id, store.id, raw === '' ? null : Number(raw));
    }

    if (purchaseStoreOrigin) {
      if (!purchaseStoreId) return;
      addToShoppingList(id, purchaseStoreId);
      const storeName = stores.find((s) => s.id === purchaseStoreId)?.name ?? '';
      setSavedNotice({ productName: trimmedName, storeName });
      return;
    }

    // スクロール処理はonClose側(resetProductComparisonView等)に一本化し、キャンセル時と同じ処理を通す。
    onClose();
  };

  return (
    <>
      <Modal title={title} onClose={onClose}>
        <form onSubmit={handleSubmit} className="form">
          <label className="form__field">
            <span>商品名</span>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="例: いちご" />
          </label>
          <label className="form__field">
            <span>内容量</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="未入力の場合は価格そのもので比較"
            />
          </label>
          <label className="form__field">
            <span>単位</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
              {UNIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          {unit === 'その他' && (
            <label className="form__field">
              <span>単位(自由入力)</span>
              <input
                ref={customUnitInputRef}
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="例: 本・枚・袋・箱など"
              />
            </label>
          )}
          <label className="form__field">
            <span>コメント(任意)</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={'例: 夕方に値引き\n冷凍食品コーナー\nいつも売り切れ'}
              rows={3}
            />
          </label>
          <div className="form__field">
            <span>各店舗の価格</span>
            {stores.length === 0 && <p className="empty-hint">先に店舗を登録してください。</p>}
            <div className="form__price-list">
              {stores.map((store) => (
                <label key={store.id} className="form__price-row">
                  <span className="form__price-row-store">{store.name}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={prices[store.id] ?? ''}
                    placeholder="未入力"
                    onChange={(e) => setPrices((prev) => ({ ...prev, [store.id]: e.target.value }))}
                  />
                </label>
              ))}
            </div>
          </div>
          {purchaseStoreOrigin && (
            <div className="form__field">
              <span>購入店舗</span>
              {stores.length === 0 && <p className="empty-hint">先に店舗を登録してください。</p>}
              <ul className="add-list-store-options">
                {stores.map((store) => {
                  const raw = prices[store.id] ?? '';
                  return (
                    <li key={store.id}>
                      <button
                        type="button"
                        className={`add-list-store-option ${purchaseStoreId === store.id ? 'is-selected' : ''}`}
                        onClick={() => setPurchaseStoreId(store.id)}
                      >
                        <span>{store.name}</span>
                        <span className="add-list-store-option__price">
                          {raw === '' ? '価格未設定' : `${raw}円`}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!name.trim() || (purchaseStoreOrigin && !purchaseStoreId)}
            >
              保存
            </button>
          </div>
        </form>
      </Modal>

      {savedNotice && (
        <Modal title="買い物リスト" onClose={onClose}>
          <p className="confirm-dialog__message">
            {savedNotice.productName}を{savedNotice.storeName}の買い物リストへ追加しました。
          </p>
          <div className="form__actions">
            <button type="button" className="btn btn--primary" onClick={onClose}>
              閉じる
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
