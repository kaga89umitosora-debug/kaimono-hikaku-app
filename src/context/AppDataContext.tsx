import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ManualListItem, Price, PriceHistoryEntry, Product, Store, Unit } from '../types';
import { loadState, saveState } from '../utils/storage';
import { createId } from '../utils/id';
import { findCheapestStoreId } from '../utils/calculations';

interface ProductInput {
  name: string;
  quantity: number | null;
  unit: Unit;
  customUnit?: string;
}

interface ManualItemInput {
  storeId: string;
  name: string;
  quantity: string;
  amount: number;
}

interface AppData {
  stores: Store[];
  products: Product[];
  prices: Price[];
  manualItems: ManualListItem[];

  addStore: (name: string) => void;
  renameStore: (id: string, name: string) => void;
  removeStore: (id: string) => void;
  moveStore: (id: string, direction: 'up' | 'down') => void;

  addProduct: (input: ProductInput) => string;
  updateProduct: (id: string, input: ProductInput) => void;
  removeProduct: (id: string) => void;
  setPlanned: (id: string, planned: boolean) => void;
  setPurchaseStore: (id: string, storeId: string | null) => void;
  markProductPurchased: (id: string) => void;

  getPrice: (productId: string, storeId: string) => number | undefined;
  setPrice: (productId: string, storeId: string, price: number | null) => void;
  getCheapestStoreId: (productId: string) => string | null;

  addManualItem: (input: ManualItemInput) => void;
  removeManualItem: (id: string) => void;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Store[]>(() => loadState<Store[]>('stores', []));
  const [products, setProducts] = useState<Product[]>(() => loadState<Product[]>('products', []));
  const [prices, setPrices] = useState<Price[]>(() => loadState<Price[]>('prices', []));
  const [history, setHistory] = useState<PriceHistoryEntry[]>(() =>
    loadState<PriceHistoryEntry[]>('priceHistory', [])
  );
  const [manualItems, setManualItems] = useState<ManualListItem[]>(() =>
    loadState<ManualListItem[]>('manualListItems', [])
  );

  useEffect(() => saveState('stores', stores), [stores]);
  useEffect(() => saveState('products', products), [products]);
  useEffect(() => saveState('prices', prices), [prices]);
  useEffect(() => saveState('priceHistory', history), [history]);
  useEffect(() => saveState('manualListItems', manualItems), [manualItems]);

  const addStore = (name: string) => {
    setStores((prev) => {
      const maxOrder = prev.reduce((max, s) => Math.max(max, s.order), -1);
      return [...prev, { id: createId(), name, order: maxOrder + 1 }];
    });
  };

  const renameStore = (id: string, name: string) => {
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const removeStore = (id: string) => {
    setStores((prev) => prev.filter((s) => s.id !== id));
    setPrices((prev) => prev.filter((p) => p.storeId !== id));
    setHistory((prev) => prev.filter((h) => h.storeId !== id));
    setManualItems((prev) => prev.filter((m) => m.storeId !== id));
    setProducts((prev) => prev.map((p) => (p.purchaseStoreId === id ? { ...p, purchaseStoreId: null } : p)));
  };

  const moveStore = (id: string, direction: 'up' | 'down') => {
    setStores((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((s) => s.id === id);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) return prev;
      const next = [...sorted];
      const tmpOrder = next[index].order;
      next[index] = { ...next[index], order: next[targetIndex].order };
      next[targetIndex] = { ...next[targetIndex], order: tmpOrder };
      return next;
    });
  };

  const addProduct = ({ name, quantity, unit, customUnit }: ProductInput) => {
    const id = createId();
    setProducts((prev) => [
      ...prev,
      {
        id,
        name,
        quantity,
        unit,
        customUnit,
        planned: false,
        purchaseStoreId: null,
        updatedAt: new Date().toISOString(),
      },
    ]);
    return id;
  };

  const updateProduct = (id: string, input: ProductInput) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...input } : p)));
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setPrices((prev) => prev.filter((p) => p.productId !== id));
    setHistory((prev) => prev.filter((h) => h.productId !== id));
  };

  const setPlanned = (id: string, planned: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, planned, purchaseStoreId: planned ? p.purchaseStoreId : null } : p))
    );
  };

  const setPurchaseStore = (id: string, storeId: string | null) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, purchaseStoreId: storeId } : p)));
  };

  const markProductPurchased = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, planned: false, purchaseStoreId: null } : p)));
  };

  const getPrice = (productId: string, storeId: string) =>
    prices.find((p) => p.productId === productId && p.storeId === storeId)?.price;

  const setPrice = (productId: string, storeId: string, price: number | null) => {
    const existing = prices.find((p) => p.productId === productId && p.storeId === storeId);

    if (price === null || Number.isNaN(price)) {
      if (!existing) return;
      setPrices((prev) => prev.filter((p) => p.id !== existing.id));
      return;
    }

    if (existing && existing.price === price) return;

    setPrices((prev) =>
      existing
        ? prev.map((p) => (p.id === existing.id ? { ...p, price } : p))
        : [...prev, { id: createId(), productId, storeId, price }]
    );

    const changedAt = new Date().toISOString();
    setHistory((prev) => [...prev, { id: createId(), productId, storeId, price, changedAt }]);
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, updatedAt: changedAt } : p)));
  };

  const getCheapestStoreId = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return null;
    const productPrices = prices.filter((p) => p.productId === productId);
    return findCheapestStoreId(productPrices, product.quantity);
  };

  const addManualItem = (input: ManualItemInput) => {
    setManualItems((prev) => [...prev, { id: createId(), ...input }]);
  };

  const removeManualItem = (id: string) => {
    setManualItems((prev) => prev.filter((m) => m.id !== id));
  };

  const value = useMemo<AppData>(
    () => ({
      stores: [...stores].sort((a, b) => a.order - b.order),
      products,
      prices,
      manualItems,
      addStore,
      renameStore,
      removeStore,
      moveStore,
      addProduct,
      updateProduct,
      removeProduct,
      setPlanned,
      setPurchaseStore,
      markProductPurchased,
      getPrice,
      setPrice,
      getCheapestStoreId,
      addManualItem,
      removeManualItem,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stores, products, prices, manualItems]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
