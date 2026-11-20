import { ScreenView } from '../types/atelier';

interface FooterProps {
  onNavigate: (screen: ScreenView) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const handleNav = (screen: ScreenView) => {
    onNavigate(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#6E2440] bg-gradient-to-b from-[#2A0918] via-[#210712] to-[#1A050E] text-[#FCE7EF]">
      <div className="max-w-[1360px] mx-auto px-5 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-2.5">
            <h2 className="font-display text-3xl font-light tracking-[-0.01em] text-[#FFF0F5]">
              Velvet Rose Confections
            </h2>
            <p className="text-[13px] text-[#C98DA4] max-w-sm leading-relaxed">
              Small-batch confections, keepsake boxes, and 600gsm cotton letterpress tied in crimson satin.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#FF8FB3]">
              Studio
            </p>
            <ul className="space-y-2 text-[13px] text-[#FCE7EF]">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="hover:text-[#FF8FB3] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('collections')}
                  className="hover:text-[#FF8FB3] transition-colors cursor-pointer"
                >
                  Collections
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('bespoke-box')}
                  className="hover:text-[#FF8FB3] transition-colors cursor-pointer"
                >
                  Custom Box
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('stationery')}
                  className="hover:text-[#FF8FB3] transition-colors cursor-pointer"
                >
                  Stationery
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#FF8FB3]">
              Boutique
            </p>
            <p className="text-[13px] text-[#C98DA4] leading-relaxed">
              14 Rosemont Crescent · Tue–Sat, 10 AM – 6:30 PM. Complimentary silk wrap on all orders.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#5B1B34] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#B67A91]">
          <span>© {new Date().getFullYear()} Velvet Rose Confections</span>
          <span>600gsm Cotton · Single-Origin Cacao · Silk Satin</span>
        </div>
      </div>
    </footer>
  );
}
