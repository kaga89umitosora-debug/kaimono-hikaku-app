export type Unit = '個' | 'g' | 'kg' | 'ml' | 'L' | '袋' | 'その他';

export const UNIT_OPTIONS: Unit[] = ['個', 'g', 'kg', 'ml', 'L', '袋', 'その他'];

export interface Store {
  id: string;
  name: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  /** 未入力の場合は null。最安判定は価格そのもので比較する。 */
  quantity: number | null;
  unit: Unit;
  /** unit === 'その他' のときの自由入力表記 */
  customUnit?: string;
  /** 価格変更時に自動更新されるISO日時 */
  updatedAt: string;
  /** 店舗ごとではなく商品全体に対するメモ。複数行可、未入力は空文字。 */
  comment: string;
}

export interface Price {
  id: string;
  productId: string;
  storeId: string;
  price: number;
}

/** 画面表示はしない。将来の価格推移グラフ用に裏で保存するだけ。 */
export interface PriceHistoryEntry {
  id: string;
  productId: string;
  storeId: string;
  price: number;
  changedAt: string;
}

/**
 * 買い物リスト限定の旧手入力項目(第6回で新規追加の入口は廃止)。
 * 既存データの表示・削除のためだけに型・保存領域を残している。
 */
export interface ManualListItem {
  id: string;
  storeId: string;
  name: string;
  quantity: string;
  amount: number;
}

/**
 * 買い物リストの1項目。
 * 通常商品: productId に商品比較リストの商品IDを持つ。
 * 今回だけの商品: productId は null、customName に入力した商品名を持つ(商品比較リストとは無関係)。
 * 同じ商品(productId)×店舗の組み合わせは重複登録しない(today-only商品はこの制約の対象外)。
 */
export interface ShoppingListEntry {
  id: string;
  storeId: string;
  productId: string | null;
  customName?: string;
}

/** 「他店購入」操作で、商品比較画面へ渡す遷移リクエスト(永続化しないUI状態)。 */
export interface StoreChangeRequest {
  entryId: string;
  productId: string;
  originStoreId: string;
}
