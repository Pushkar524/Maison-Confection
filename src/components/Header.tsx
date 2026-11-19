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
  { id: 'home', label: 'Atelier' },
  { id: 'collections', label: 'Collections' },
  { id: 'bespoke-box', label: 'Bespoke Box' },
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
    <header className="fixed top-0 inset-x-0 z-40 bg-[#FDF2F5]/95 border-b border-[#E9C4D1]">
      <div className="max-w-[1360px] mx-auto px-5 md:px-8 lg:px-12 h-16 md:h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="font-serif-editorial text-2xl md:text-[26px] font-semibold tracking-tight text-[#161013] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161013] rounded-md px-1"
        >
          Maison Confection
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
                className={`relative py-1.5 text-[15px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161013] rounded ${
                  isActive
                    ? 'text-[#161013]'
                    : 'text-[#6E4E5A] hover:text-[#161013]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[#161013]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 High-Contrast Dark Opposite Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenBag}
            aria-label={`Open gift bag with ${bagCount} items`}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#161013] hover:bg-[#2B1C22] text-[#FDF2F5] text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer bevel-letterpress transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#161013]"
          >
            <ShoppingBag className="w-4 h-4 text-[#F4C2D2]" />
            <span>Gift Bag</span>
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#F4C2D2] text-[#161013] text-xs font-bold tabular-nums">
              {bagCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F9E4EB] border border-[#E9C4D1] text-[#161013] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E9C4D1] bg-[#FDF2F5] px-5 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#161013] text-[#FDF2F5]'
                    : 'text-[#161013] hover:bg-[#F9E4EB]'
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
