import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Modal } from '../common/Modal';
import { UNIT_OPTIONS } from '../../types';
import type { Unit } from '../../types';
import { useAppData } from '../../context/useAppData';

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
  onSaved,
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
  /**
   * 保存成功時に呼ぶコールバック。保存された商品IDを渡す。未指定ならonCloseを使う。
   * registeredNewPriceは、価格未設定だった店舗に新しく価格を登録した場合のみtrue
   * (既存価格の変更や、価格以外のみの変更ではfalse)。
   */
  onSaved?: (id: string, options?: { registeredNewPrice: boolean }) => void;
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
  // 価格欄に負の値・NaN・Infinityなど不正な値が残っている場合のエラー表示。
  // setPrice側の内部防御とは別に、ここで保存前に食い止めて利用者へ理由を伝える。
  const [priceError, setPriceError] = useState(false);
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

  const handlePriceChange = (storeId: string, raw: string) => {
    setPriceError(false);
    setPrices((prev) => ({ ...prev, [storeId]: raw }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (unit === 'その他' && !customUnit.trim()) return;

    // 空欄は価格未登録として許可し、0以上の有限な数値だけを有効とする。
    // 1件でも不正な値があれば、保存処理(商品・価格・買い物リストへの追加)を一切行わず、
    // モーダルも閉じずにエラーだけを表示する。
    const hasInvalidPrice = stores.some((store) => {
      const raw = (prices[store.id] ?? '').trim();
      if (raw === '') return false;
      const value = Number(raw);
      return !Number.isFinite(value) || value < 0;
    });
    if (hasInvalidPrice) {
      setPriceError(true);
      return;
    }

    // 画面側のdisabled属性だけに頼らず、ここでも購入店舗の選択を確認する。
    // 未選択のままEnter送信やsubmitイベントが直接発生しても、商品・価格・買い物リストへの
    // 追加を一切行わずに処理を終了する。
    if (purchaseStoreOrigin && !purchaseStoreId) return;

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

    // 価格未設定だった店舗に新しく価格を登録したかどうかを、上書き前の状態と比較して判定する。
    let registeredNewPrice = false;
    for (const store of stores) {
      const raw = prices[store.id] ?? '';
      if (raw !== '' && getPrice(id, store.id) === undefined) {
        registeredNewPrice = true;
      }
      setPrice(id, store.id, raw === '' ? null : Number(raw));
    }

    if (purchaseStoreOrigin && purchaseStoreId) {
      addToShoppingList(id, purchaseStoreId);
      const storeName = stores.find((s) => s.id === purchaseStoreId)?.name ?? '';
      setSavedNotice({ productName: trimmedName, storeName });
      return;
    }

    if (onSaved) {
      onSaved(id, { registeredNewPrice });
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal title={title} onClose={onClose}>
        <form onSubmit={handleSubmit} className="form">
          <label className="form__field">
            <span>商品名</span>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="例: いちご" />
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
                    value={prices[store.id] ?? ''}
                    placeholder="未入力"
                    onChange={(e) => handlePriceChange(store.id, e.target.value)}
                  />
                </label>
              ))}
            </div>
            {priceError && <p className="form__price-error">価格は0以上の数字で入力してください</p>}
          </div>
          <div className="form__row">
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
          </div>
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
