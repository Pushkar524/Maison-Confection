import { ArrowRight, BookOpen, Package, Ribbon } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { CLIENT_STORIES } from '../data/atelierData';
import { AtelierProduct, ProductCategory, ScreenView } from '../types/atelier';
import { CurioShelfShowcase } from './CurioShelfShowcase';
import { GiftBox3DCanvas } from './GiftBox3DCanvas';

interface HomeViewProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onNavigate: (screen: ScreenView) => void;
  onSelectProduct: (product: AtelierProduct) => void;
  onQuickPersonalize: (product: AtelierProduct) => void;
  onQuickAdd: (product: AtelierProduct) => void;
}

const HOME_CATEGORIES: ProductCategory[] = [
  'All Collections',
  'Confection Boxes',
  'Event Stationery',
  'Tea & Pantry',
];

export function HomeView({
  favorites,
  onToggleFavorite,
  onNavigate,
  onSelectProduct,
  onQuickPersonalize,
  onQuickAdd,
}: HomeViewProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('All Collections');
  const heroRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });

  // Lock screen briefly across 55vh of scroll travel until box is 100% open (0 -> 0.82), then release smoothly
  const rawOpenProgress = useTransform(scrollYProgress, [0, 0.82], [0, 1]);
  const smoothOpenProgress = useSpring(rawOpenProgress, {
    stiffness: 280,
    damping: 28,
    mass: 0.35,
  });

  const prefersReducedMotion = useReducedMotion();
  const headingOpacity = useTransform(smoothOpenProgress, [0.05, 0.36], [0, 1]);
  const headingY = useTransform(
    smoothOpenProgress,
    [0.05, 0.36],
    [prefersReducedMotion ? 0 : 28, 0]
  );
  const actionsOpacity = useTransform(smoothOpenProgress, [0.1, 0.42], [0, 1]);
  const actionsY = useTransform(
    smoothOpenProgress,
    [0.1, 0.42],
    [prefersReducedMotion ? 0 : 20, 0]
  );
  const actionsPointerEvents = useTransform(smoothOpenProgress, (v) =>
    v > 0.08 ? 'auto' : 'none'
  );
  const scrollPromptOpacity = useTransform(smoothOpenProgress, [0, 0.12], [0.75, 0]);

  // Preserve favorites prop compatibility with parent state
  void favorites;
  void onToggleFavorite;

  return (
    <div className="space-y-20 md:space-y-24">
      {/* Section 1: Scroll-Locked Full-Screen 3D Gift Box Opening Stage (155vh runway, quick 55vh unlock) */}
      <section
        ref={heroRef}
        className="relative w-full h-[155vh] bg-gradient-to-b from-[#2A0918] via-[#200712] to-[#2E0B1A]"
      >
        <div className="sticky top-0 w-full h-screen overflow-hidden border-b border-[#6E2440]">
          {/* Full-Viewport 3D WebGL Gift Box Canvas */}
          <div className="absolute inset-0 pt-16 md:pt-20 w-full h-full">
            <GiftBox3DCanvas openProgress={smoothOpenProgress} mode="hero-open" />
          </div>

          {/* Bottom Centered Hero Lockup: Scroll-Revealed Single Big Minimal Heading + Compact Small Buttons */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#1B0610] via-[#1B0610]/85 to-transparent pt-20 pb-7 md:pb-10">
            <div className="max-w-[1380px] mx-auto px-4 sm:px-8 text-center">
              <div className="pointer-events-auto flex flex-col items-center">
                <motion.h1
                  style={{ opacity: headingOpacity, y: headingY, textWrap: 'balance' }}
                  className="font-display text-[48px] sm:text-[74px] md:text-[94px] lg:text-[112px] xl:text-[124px] font-light leading-[0.95] tracking-[-0.025em] text-[#FFF0F5] max-w-[1320px] will-change-[transform,opacity]"
                >
                  Velvet <span className="text-outline-velvet font-normal">Keepsakes</span>
                </motion.h1>

                <motion.p
                  aria-hidden="true"
                  style={{ opacity: scrollPromptOpacity }}
                  className="text-xs tracking-[0.12em] text-[#E8B4C6] -mt-4 mb-2 pointer-events-none select-none"
                >
                  Scroll to unbox
                </motion.p>

                <motion.div
                  style={{
                    opacity: actionsOpacity,
                    y: actionsY,
                    pointerEvents: actionsPointerEvents,
                  }}
                  className="mt-5 flex flex-wrap items-center justify-center gap-2 will-change-[transform,opacity]"
                >
                  <button
                    type="button"
                    onClick={() => onNavigate('bespoke-box')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[40px] sm:min-h-[34px] rounded-lg bg-gradient-to-r from-[#E84F82] to-[#B81D52] hover:from-[#F26694] hover:to-[#C9235B] text-[#FFF4F8] text-[11px] font-medium tracking-wide whitespace-nowrap shrink-0 cursor-pointer border border-[#FF9BBE]/35 bevel-letterpress transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B0610] focus-visible:ring-[#FF8FB3]"
                  >
                    <span>Compose a Box</span>
                    <ArrowRight className="w-3 h-3 text-[#FFE3ED]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('stationery')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[40px] sm:min-h-[34px] rounded-lg bg-[#2B0917]/80 hover:bg-[#3D1023] text-[#FCE7EF] border border-[#822E4F] hover:border-[#FF8FB3] text-[11px] font-medium tracking-wide whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB3]"
                  >
                    <span>Stationery Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('collections')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[40px] sm:min-h-[34px] rounded-lg bg-[#2B0917]/80 hover:bg-[#3D1023] text-[#E8B4C6] hover:text-[#FFF0F5] border border-[#6E2440] hover:border-[#9E3B5E] text-[11px] font-medium tracking-wide whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB3]"
                  >
                    <span>Explore Catalog</span>
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Featured House Collection */}
      <section
        id="collections-section"
        className="max-w-[1360px] mx-auto px-5 md:px-8 lg:px-12 scroll-mt-24"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#FF8FB3] mb-2">
              Seasonal Editions
            </p>
            <h2 className="font-serif-editorial text-3xl md:text-[38px] font-semibold text-[#FFF0F5] leading-tight">
              Curated Gift Boxes & Paper Packs
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter collection by category"
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gradient-to-r from-[#340D1E] to-[#270916] border border-[#6E2440] rounded-full"
          >
            {HOME_CATEGORIES.map((category) => {
              const selected = activeCategory === category;
              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={selected}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all duration-150 ${
                    selected
                      ? 'bg-gradient-to-r from-[#FCE4EC] to-[#F5B8CD] text-[#240814] shadow-atelier-rest'
                      : 'text-[#E3AFC3] hover:text-[#FFF0F5]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <CurioShelfShowcase
          activeCategory={activeCategory}
          onQuickPersonalize={onQuickPersonalize}
          onQuickAdd={onQuickAdd}
          onSelectProduct={onSelectProduct}
        />

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate('collections')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#FCE7EF] hover:text-[#FF8FB3] border-b border-[#E84F82] pb-1 cursor-pointer transition-colors"
          >
            <span>Browse Full Collection Catalog & Specifications</span>
            <ArrowRight className="w-4 h-4 text-[#FF8FB3]" />
          </button>
        </div>
      </section>

      {/* Section 3: Luminous Crimson-Velvet Showcase — Tactile Craftsmanship & Client Proof */}
      <section className="max-w-[1360px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="bg-gradient-to-br from-[#4D122B] via-[#370C1F] to-[#260815] text-[#FCE7EF] border border-[#822E4F] rounded-3xl p-8 md:p-12 lg:p-14 shadow-atelier-modal">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Craftsmanship Pillars */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#FF8FB3] mb-2">
                  The Unboxing Ritual
                </p>
                <h2
                  className="font-serif-editorial text-3xl md:text-[36px] font-semibold text-[#FFF0F5] leading-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Three tactile signatures in every parcel.
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#611736] to-[#3B0D20] border border-[#9E3B5E] flex items-center justify-center text-[#FF8FB3]">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif-editorial text-xl font-semibold text-[#FFF0F5]">
                    Cushioned Vessels
                  </h3>
                  <p className="text-sm text-[#E8B4C6] leading-relaxed">
                    Deep rose-pink Belgian linen boxes lined in pleated silk, built to outlast the
                    confections inside.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#611736] to-[#3B0D20] border border-[#9E3B5E] flex items-center justify-center text-[#FF8FB3]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif-editorial text-xl font-semibold text-[#FFF0F5]">
                    Letterpress Cotton
                  </h3>
                  <p className="text-sm text-[#E8B4C6] leading-relaxed">
                    600gsm deckle-edge rag cards debossed on heritage presses with crimson or
                    champagne foil monograms.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#611736] to-[#3B0D20] border border-[#9E3B5E] flex items-center justify-center text-[#FF8FB3]">
                    <Ribbon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif-editorial text-xl font-semibold text-[#FFF0F5]">
                    Silk Ribbon & Wax
                  </h3>
                  <p className="text-sm text-[#E8B4C6] leading-relaxed">
                    Hand-tied satin ribbons and botanical brass wax impressions poured individually
                    to order.
                  </p>
                </div>
              </div>
            </div>

            {/* Adjacent Attributable Client Proof */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-5">
              {CLIENT_STORIES.map((story) => (
                <blockquote
                  key={story.author}
                  className="bg-gradient-to-br from-[#390D1F] to-[#260815] border border-[#7D2B4B] rounded-2xl p-6"
                >
                  <p className="text-sm md:text-[15px] text-[#FCE7EF] leading-relaxed">
                    “{story.quote}”
                  </p>
                  <footer className="mt-4 pt-3 border-t border-[#6E2440] flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-[#FFF0F5] block">{story.author}</span>
                      <span className="text-[#D996AE]">{story.role}</span>
                    </div>
                    <span className="font-semibold text-[#FF8FB3] whitespace-nowrap">
                      {story.detail}
                    </span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
