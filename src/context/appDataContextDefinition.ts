import { createContext } from 'react';
import type { ManualListItem, Price, Product, ShoppingListEntry, Store, Unit } from '../types';

export interface ProductInput {
  name: string;
  quantity: number | null;
  unit: Unit;
  customUnit?: string;
  comment: string;
}

export interface AppData {
  stores: Store[];
  products: Product[];
  prices: Price[];
  manualItems: ManualListItem[];
  shoppingListEntries: ShoppingListEntry[];

  addStore: (name: string) => void;
  renameStore: (id: string, name: string) => void;
  removeStore: (id: string) => void;
  moveStore: (id: string, direction: 'up' | 'down') => void;

  addProduct: (input: ProductInput) => string;
  updateProduct: (id: string, input: ProductInput) => void;
  removeProduct: (id: string) => void;

  getPrice: (productId: string, storeId: string) => number | undefined;
  setPrice: (productId: string, storeId: string, price: number | null) => void;
  getCheapestStoreId: (productId: string) => string | null;

  /** 旧・買い物リスト手入力項目の削除のみ残す(新規追加は廃止、既存データの後方互換用)。 */
  removeManualItem: (id: string) => void;

  isInShoppingList: (productId: string, storeId: string) => boolean;
  addToShoppingList: (productId: string, storeId: string) => void;
  /** 商品比較リストに存在しない「今回だけの商品」を、名前だけで買い物リストへ追加する。 */
  addCustomShoppingListEntry: (customName: string, storeId: string) => void;
  removeShoppingListEntry: (id: string) => void;
  /** 指定した店舗の買い物リスト(通常商品・今回だけの商品・旧手入力項目)だけをまとめて削除する。 */
  resetShoppingListForStore: (storeId: string) => void;
  /** 全店舗の買い物リストをまとめて削除する。Product/Store/Price/価格履歴/コメントは対象外。 */
  resetAllShoppingLists: () => void;
}

/** AppDataProvider(context/AppDataContext.tsx)とuseAppData(context/useAppData.ts)で共有するContext本体。 */
export const AppDataContext = createContext<AppData | null>(null);
