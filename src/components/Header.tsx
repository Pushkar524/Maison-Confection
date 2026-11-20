import { Menu, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const updateScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, [activeScreen]);

  const isVisible = activeScreen !== 'home' || hasScrolled || mobileMenuOpen;

  const handleNav = (screen: ScreenView) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      aria-hidden={!isVisible}
      className={`fixed top-3 inset-x-0 z-40 px-4 sm:px-6 lg:px-10 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,opacity] ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div className="relative max-w-[1280px] mx-auto rounded-2xl backdrop-blur-md md:backdrop-blur-2xl bg-gradient-to-b from-[#591634]/82 via-[#360B1E]/78 to-[#240714]/86 md:from-[#591634]/55 md:via-[#360B1E]/50 md:to-[#240714]/60 border border-[#FF9BBE]/25 shadow-[inset_0_1px_0_rgba(255,228,238,0.34),inset_0_-1px_0_rgba(255,143,179,0.1),0_18px_42px_-10px_rgba(14,3,8,0.65)] overflow-hidden">
        {/* Top specular crystal gloss highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#FFEAF2]/55 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FFF0F5]/[0.08] via-transparent to-[#FF8FB3]/[0.04]"
        />

        <div className="relative px-4 sm:px-6 h-14 md:h-[60px] flex items-center justify-between gap-6 md:gap-8">
          {/* Zone 1: Single-line Editorial Brand Wordmark */}
          <button
            type="button"
            tabIndex={isVisible ? 0 : -1}
            onClick={() => handleNav('home')}
            className="font-display text-[22px] md:text-[25px] font-medium tracking-[0.01em] text-[#FFF0F5] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB3] rounded-md px-1"
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
                  tabIndex={isVisible ? 0 : -1}
                  onClick={() => handleNav(item.id)}
                  className={`relative py-1.5 text-[13px] font-medium tracking-[0.02em] whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB3] rounded ${
                    isActive ? 'text-[#FFF0F5]' : 'text-[#EAB8CA] hover:text-[#FFF0F5]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 h-[1.5px] rounded-full bg-gradient-to-r from-[#FF9BBE] to-[#E84F82]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Glossy Gift Bag Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              tabIndex={isVisible ? 0 : -1}
              onClick={onOpenBag}
              aria-label={`Open gift bag with ${bagCount} items`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 min-h-[36px] rounded-xl bg-gradient-to-b from-[#F06292]/90 to-[#B81D52]/95 hover:from-[#F47BA3] hover:to-[#C9235B] text-[#FFF4F8] text-xs font-medium tracking-wide whitespace-nowrap shrink-0 cursor-pointer border border-[#FFC2D7]/40 shadow-[inset_0_1px_0_rgba(255,240,245,0.45),0_8px_20px_-6px_rgba(232,79,130,0.5)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#240714] focus-visible:ring-[#FF8FB3]"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#FFE6EF]" />
              <span>Gift Bag</span>
              <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-md bg-[#260814]/55 border border-[#FF9BBE]/25 text-[#FCE7EF] text-[11px] font-semibold tabular-nums">
                {bagCount}
              </span>
            </button>

            <button
              type="button"
              tabIndex={isVisible ? 0 : -1}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#3A0F22]/75 border border-[#FF9BBE]/25 text-[#FCE7EF] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Glossy Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-[1280px] mx-auto mt-2 rounded-2xl backdrop-blur-md border border-[#FF9BBE]/25 bg-gradient-to-b from-[#3A0E21]/94 to-[#230713]/96 px-4 py-3 space-y-1 shadow-[inset_0_1px_0_rgba(255,224,236,0.22),0_18px_36px_-10px_rgba(14,3,8,0.75)]">
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-[#E84F82]/90 to-[#B81D52]/90 text-[#FFF4F8] border border-[#FFC2D7]/30'
                    : 'text-[#FCE7EF] hover:bg-[#4A142B]/60'
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
