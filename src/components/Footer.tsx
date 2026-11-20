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
          <div className="md:col-span-5 space-y-3">
            <h2 className="font-serif-editorial text-2xl font-semibold text-[#FFF0F5]">
              Velvet Rose Confections
            </h2>
            <p className="text-sm text-[#E8B4C6] max-w-md leading-relaxed">
              A luxury confection, keepsake gift-box, and cotton-rag letterpress studio. Prepared
              to order in small daily batches and tied by hand in crimson silk and dark-rose satin.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#FF8FB3]">
              Studio Pages
            </p>
            <ul className="space-y-2 text-sm text-[#FCE7EF]">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="hover:text-[#FF8FB3] transition-colors cursor-pointer"
                >
                  Studio Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('collections')}
                  className="hover:text-[#FF8FB3] transition-colors cursor-pointer"
                >
                  Curated Collections
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('bespoke-box')}
                  className="hover:text-[#FF8FB3] transition-colors cursor-pointer"
                >
                  Custom Box Builder
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('stationery')}
                  className="hover:text-[#FF8FB3] transition-colors cursor-pointer"
                >
                  Stationery Design Studio
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#FF8FB3]">
              Boutique & Dispatch
            </p>
            <p className="text-sm text-[#E8B4C6] leading-relaxed">
              14 Rosemont Crescent · Tuesday through Saturday, 10:00 AM – 6:30 PM. Complimentary
              satin ribbon wrapping on orders above $120.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#5B1B34] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#D996AE]">
          <span>
            © {new Date().getFullYear()} Velvet Rose Confections. All keepsakes crafted to order.
          </span>
          <span>600gsm Cotton Rag · Single-Origin Cacao · Crimson Satin</span>
        </div>
      </div>
    </footer>
  );
}
