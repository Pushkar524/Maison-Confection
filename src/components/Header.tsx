import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { ScreenView } from '../types/atelier';

interface HeaderProps {
  activeScreen: ScreenView;
  onNavigate: (screen: ScreenView) => void;
  bagCount: number;
  onOpenBag: () => void;
}

const NAV_ITEMS: { id: ScreenView; label: string }[] = [
  { id: 'home', label: 'Studio' },
  { id: 'collections', label: 'Collections' },
  { id: 'bespoke-box', label: 'Custom Box' },
  { id: 'stationery', label: 'Stationery' },
];

export function Header({ activeScreen, onNavigate, bagCount, onOpenBag }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (screen: ScreenView) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-gradient-to-r from-[#230814]/95 via-[#2E0B1A]/95 to-[#230814]/95 border-b border-[#6E2440]">
      <div className="max-w-[1360px] mx-auto px-5 md:px-8 lg:px-12 h-16 md:h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="font-serif-editorial text-2xl md:text-[26px] font-semibold tracking-tight text-[#FFF0F5] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB3] rounded-md px-1"
        >
          Velvet Rose
        </button>

        {/* Zone 2: 4 Single-line Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 lg:gap-9"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`relative py-1.5 text-[15px] font-semibold tracking-[0.01em] whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB3] rounded ${
                  isActive
                    ? 'text-[#FF8FB3]'
                    : 'text-[#E3AFC3] hover:text-[#FFF0F5]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#FF8FB3] to-[#E84F82]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 High-Contrast Dark-Pink Velvet Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenBag}
            aria-label={`Open gift bag with ${bagCount} items`}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E84F82] to-[#B81D52] hover:from-[#F26694] hover:to-[#C9235B] text-[#FFF4F8] text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer border border-[#FF9BBE]/35 bevel-letterpress transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#230814] focus-visible:ring-[#FF8FB3]"
          >
            <ShoppingBag className="w-4 h-4 text-[#FFE3ED]" />
            <span>Gift Bag</span>
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#260915] text-[#FCE7EF] text-xs font-bold tabular-nums">
              {bagCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#3A0F22] to-[#290916] border border-[#6E2440] text-[#FCE7EF] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#6E2440] bg-gradient-to-b from-[#2C0A18] to-[#210712] px-5 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-[#E84F82] to-[#B81D52] text-[#FFF4F8]'
                    : 'text-[#FCE7EF] hover:bg-[#3A0F22]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
