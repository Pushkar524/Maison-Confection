/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AmbientPetalsHeartsBackdrop } from './components/AmbientPetalsHeartsBackdrop';
import { BespokeBuilderView } from './components/BespokeBuilderView';
import { CatalogView } from './components/CatalogView';
import { Footer } from './components/Footer';
import { GiftBagDrawer } from './components/GiftBagDrawer';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { QuickPersonalizeModal } from './components/QuickPersonalizeModal';
import { StationeryStudioView } from './components/StationeryStudioView';
import { ATELIER_PRODUCTS } from './data/atelierData';
import { AtelierProduct, GiftBagItem, ScreenView } from './types/atelier';

const STORAGE_BAG_KEY = 'maison-confection-bag-v1';
const STORAGE_FAV_KEY = 'maison-confection-fav-v1';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenView>('home');
  const [selectedProduct, setSelectedProduct] = useState<AtelierProduct | null>(null);
  const [personalizeTarget, setPersonalizeTarget] = useState<AtelierProduct | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FAV_KEY);
      return saved ? JSON.parse(saved) : ['coffret-grand-bonbon'];
    } catch {
      return ['coffret-grand-bonbon'];
    }
  });

  const [bagItems, setBagItems] = useState<GiftBagItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BAG_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    const starter = ATELIER_PRODUCTS[0];
    return [
      {
        uid: 'starter-coffret',
        productId: starter.id,
        title: starter.title,
        editionLabel: starter.editions[0].label,
        unitPrice: starter.price,
        quantity: 1,
        image: starter.image,
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BAG_KEY, JSON.stringify(bagItems));
    } catch {
      // ignore
    }
  }, [bagItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAV_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleNavigate = (screen: ScreenView) => {
    setActiveScreen(screen);
    if (screen !== 'collections') {
      setSelectedProduct(null);
    }
  };

  const handleSelectProduct = (product: AtelierProduct | null) => {
    setSelectedProduct(product);
    if (product) {
      setActiveScreen('collections');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddConfiguredItem = (newItem: GiftBagItem) => {
    setBagItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.editionLabel === newItem.editionLabel &&
          !item.personalization &&
          !newItem.personalization
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + newItem.quantity,
        };
        return updated;
      }
      return [...prev, newItem];
    });
    showToast(`Added ${newItem.title} to Gift Bag`);
  };

  const handleQuickAdd = (product: AtelierProduct) => {
    const edition = product.editions[0];
    handleAddConfiguredItem({
      uid: `${product.id}-${edition.id}-${Date.now()}`,
      productId: product.id,
      title: product.title,
      editionLabel: edition.label,
      unitPrice: product.price + edition.priceDelta,
      quantity: 1,
      image: product.image,
    });
  };

  const handleUpdateQuantity = (uid: string, delta: number) => {
    setBagItems((prev) =>
      prev
        .map((item) =>
          item.uid === uid ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (uid: string) => {
    setBagItems((prev) => prev.filter((item) => item.uid !== uid));
  };

  const totalBagCount = bagItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FDF2F5] text-[#161013]">
      <AmbientPetalsHeartsBackdrop />

      <Header
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        bagCount={totalBagCount}
        onOpenBag={() => setBagOpen(true)}
      />

      <main className={`relative z-10 flex-1 ${activeScreen !== 'home' ? 'pt-16 md:pt-20' : ''}`}>
        {activeScreen === 'home' && (
          <HomeView
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onQuickPersonalize={setPersonalizeTarget}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {activeScreen === 'collections' && (
          <CatalogView
            selectedProduct={selectedProduct}
            onSelectProduct={handleSelectProduct}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onQuickPersonalize={setPersonalizeTarget}
            onQuickAdd={handleQuickAdd}
            onAddConfiguredItem={handleAddConfiguredItem}
          />
        )}

        {activeScreen === 'bespoke-box' && (
          <BespokeBuilderView
            onAddCustomBox={(item) => {
              handleAddConfiguredItem(item);
              setBagOpen(true);
            }}
          />
        )}

        {activeScreen === 'stationery' && (
          <StationeryStudioView
            onAddSuite={(item) => {
              handleAddConfiguredItem(item);
              setBagOpen(true);
            }}
          />
        )}
      </main>

      <div className="relative z-10 mt-20 md:mt-24">
        <Footer onNavigate={handleNavigate} />
      </div>

      <QuickPersonalizeModal
        product={personalizeTarget}
        onClose={() => setPersonalizeTarget(null)}
        onConfirm={(item) => {
          handleAddConfiguredItem(item);
          setBagOpen(true);
        }}
      />

      <GiftBagDrawer
        isOpen={bagOpen}
        onClose={() => setBagOpen(false)}
        items={bagItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearBag={() => setBagItems([])}
      />

      {/* Celebratory Confirmation Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#161013] text-[#FDF2F5] text-sm font-semibold shadow-atelier-modal border border-[#2E2026]"
        >
          <span className="w-6 h-6 rounded-full bg-[#F4C2D2] text-[#161013] flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </span>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
              setBagOpen(true);
            }}
            className="text-xs font-bold text-[#F4C2D2] hover:text-white underline ml-1 cursor-pointer"
          >
            View Bag
          </button>
        </div>
      )}
    </div>
  );
}
