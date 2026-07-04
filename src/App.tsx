import { useState } from 'react';
import { AppDataProvider } from './context/AppDataContext';
import { BottomNav, type Screen } from './components/layout/BottomNav';
import { StoreManagementScreen } from './components/stores/StoreManagementScreen';
import { ProductComparisonScreen } from './components/products/ProductComparisonScreen';
import { ShoppingListScreen } from './components/shopping-list/ShoppingListScreen';

function App() {
  const [screen, setScreen] = useState<Screen>('products');

  return (
    <AppDataProvider>
      <div className="app-shell">
        <header className="app-header">
          <h1>買い物比較リスト</h1>
        </header>
        <main className="app-content">
          {screen === 'stores' && <StoreManagementScreen />}
          {screen === 'products' && <ProductComparisonScreen />}
          {screen === 'list' && <ShoppingListScreen />}
        </main>
        <BottomNav current={screen} onChange={setScreen} />
      </div>
    </AppDataProvider>
  );
}

export default App;
