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
    <footer className="border-t border-[#2E2026] bg-[#161013] text-[#FDF2F5]">
      <div className="max-w-[1360px] mx-auto px-5 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-3">
            <h2 className="font-serif-editorial text-2xl font-semibold text-[#FDF2F5]">
              Maison Confection
            </h2>
            <p className="text-sm text-[#D7BAC4] max-w-md leading-relaxed">
              An artisanal confection, keepsake gift-box, and cotton-rag letterpress atelier.
              Prepared to order in small daily batches and tied by hand in blush silk and noir
              satin.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#F4C2D2]">
              Atelier Screens
            </p>
            <ul className="space-y-2 text-sm text-[#FDF2F5]">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="hover:text-[#F4C2D2] transition-colors cursor-pointer"
                >
                  Atelier Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('collections')}
                  className="hover:text-[#F4C2D2] transition-colors cursor-pointer"
                >
                  Curated Collections
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('bespoke-box')}
                  className="hover:text-[#F4C2D2] transition-colors cursor-pointer"
                >
                  Bespoke Box Builder
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('stationery')}
                  className="hover:text-[#F4C2D2] transition-colors cursor-pointer"
                >
                  Stationery Suite Studio
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#F4C2D2]">
              Salon & Dispatch
            </p>
            <p className="text-sm text-[#D7BAC4] leading-relaxed">
              14 Rue des Feuillants · Tuesday through Saturday, 10:00 – 18:30. Complimentary satin
              ribbon wrapping on orders above $120.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#2E2026] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#C7A6B2]">
          <span>© {new Date().getFullYear()} Maison Confection. All curios crafted to order.</span>
          <span>600gsm Cotton Rag · Small-Batch Cacao · Obsidian Satin</span>
        </div>
      </div>
    </footer>
  );
}
