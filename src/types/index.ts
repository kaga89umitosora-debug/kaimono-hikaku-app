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
  planned: boolean;
  /** 画面③で選んだ購入予定の店舗。未選択は null */
  purchaseStoreId: string | null;
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

/** 画面③限定の手入力項目。商品比較DBとは独立して管理する。 */
export interface ManualListItem {
  id: string;
  storeId: string;
  name: string;
  quantity: string;
  amount: number;
}
