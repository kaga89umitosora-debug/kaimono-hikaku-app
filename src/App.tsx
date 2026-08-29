import { useEffect, useState } from 'react';
import { AppDataProvider } from './context/AppDataContext';
import { BottomNav, type Screen } from './components/layout/BottomNav';
import { StoreManagementScreen } from './components/stores/StoreManagementScreen';
import { ProductComparisonScreen } from './components/products/ProductComparisonScreen';
import { ShoppingListScreen } from './components/shopping-list/ShoppingListScreen';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { LanguageSelectionModal } from './components/onboarding/LanguageSelectionModal';
import { hasOnboardingRecord, hasSeenOnboarding } from './utils/onboarding';
import { DEFAULT_LANGUAGE, getLanguage, setLanguage as persistLanguage, useI18n } from './i18n';
import type { StoreChangeRequest } from './types';

function App() {
  const { setLanguage } = useI18n();
  const [screen, setScreen] = useState<Screen>('products');
  const [storeChangeRequest, setStoreChangeRequest] = useState<StoreChangeRequest | null>(null);
  const [prefillAddName, setPrefillAddName] = useState<string | null>(null);
  // 初回起動判定は useEffect ではなく useState の初期化子で行う
  // (StrictMode の二重実行や、一瞬表示されてから消えるチラつきを避けるため)。
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding());
  // 初回言語選択画面が必要か:
  //   khcui:lang 未保存 かつ 既存ユーザー(khcui:onboarding-seen あり)でない = 新規ユーザーのみ true。
  const [needsLanguageChoice, setNeedsLanguageChoice] = useState(
    () => getLanguage() === null && !hasOnboardingRecord()
  );

  // 既存ユーザー(i18n 導入前から利用: onboarding-seen あり / lang 未保存)は
  // 突然英語化しないよう日本語を自動採用し、khcui:lang='ja' を保存しておく。
  // 表示は I18nProvider が既定で 'ja' のため、この保存自体は今の画面に影響しない
  // (次回以降の起動判定を安定させ、設定画面の初期選択を 'ja' にするだけ)。
  useEffect(() => {
    if (getLanguage() === null && !needsLanguageChoice) {
      persistLanguage(DEFAULT_LANGUAGE);
    }
  }, [needsLanguageChoice]);

  return (
    <AppDataProvider>
      <div className="app-shell">
        <main className="app-content">
          {screen === 'stores' && (
            <StoreManagementScreen onReplayOnboarding={() => setShowOnboarding(true)} />
          )}
          {screen === 'products' && (
            <ProductComparisonScreen
              storeChangeRequest={storeChangeRequest}
              onStoreChangeHandled={() => setStoreChangeRequest(null)}
              prefillAddName={prefillAddName}
              onPrefillHandled={() => setPrefillAddName(null)}
              onReturnToShoppingList={() => setScreen('list')}
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
        {needsLanguageChoice ? (
          // 言語未選択のうちはオンボーディングを出さない。必ず 言語選択 → オンボーディング の順。
          <LanguageSelectionModal
            onSelect={(language) => {
              setLanguage(language); // UI を即時切替 + khcui:lang を保存(I18nProvider の setLanguage)
              setNeedsLanguageChoice(false);
            }}
          />
        ) : (
          showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />
        )}
      </div>
    </AppDataProvider>
  );
}

export default App;
