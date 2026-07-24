import { useState } from 'react';
import { AppDataProvider } from './context/AppDataContext';
import { BottomNav, type Screen } from './components/layout/BottomNav';
import { StoreManagementScreen } from './components/stores/StoreManagementScreen';
import { ProductComparisonScreen } from './components/products/ProductComparisonScreen';
import { ShoppingListScreen } from './components/shopping-list/ShoppingListScreen';
import type { StoreChangeRequest } from './types';

function App() {
  const [screen, setScreen] = useState<Screen>('products');
  const [storeChangeRequest, setStoreChangeRequest] = useState<StoreChangeRequest | null>(null);
  const [prefillAddName, setPrefillAddName] = useState<string | null>(null);

  return (
    <AppDataProvider>
      <div className="app-shell">
        <header className="app-header">
          <h1>買い物比較リスト</h1>
        </header>
        <main className="app-content">
          {screen === 'stores' && <StoreManagementScreen />}
          {screen === 'products' && (
            <ProductComparisonScreen
              storeChangeRequest={storeChangeRequest}
              onStoreChangeHandled={() => setStoreChangeRequest(null)}
              prefillAddName={prefillAddName}
              onPrefillHandled={() => setPrefillAddName(null)}
            />
          )}
          {screen === 'list' && (
            <ShoppingListScreen
              onRequestStoreChange={(request) => {
                setStoreChangeRequest(request);
                setScreen('products');
              }}
              onNavigateToAddProduct={(name) => {
                setPrefillAddName(name);
                setScreen('products');
              }}
            />
          )}
        </main>
        <BottomNav current={screen} onChange={setScreen} />
      </div>
    </AppDataProvider>
  );
}

export default App;
