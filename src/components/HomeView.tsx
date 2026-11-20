import { ArrowRight, BookOpen, Package, Ribbon } from 'lucide-react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
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

  const anatomyOpacity = useTransform(smoothOpenProgress, [0.16, 0.42, 0.96], [0, 1, 0.95]);
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

          {/* Left/Right Anatomy Callouts (Edge-anchored, reveal as lid opens) */}
          <motion.div
            style={{ opacity: anatomyOpacity }}
            className="hidden md:block pointer-events-none absolute inset-x-0 top-24 lg:top-28 z-10 max-w-[1360px] mx-auto px-8 lg:px-12"
          >
            <div className="flex items-start justify-between gap-8">
              <div className="bg-gradient-to-br from-[#3D1023]/95 to-[#290916]/95 border border-[#7D2B4B] rounded-2xl px-4 py-3 shadow-atelier-rest max-w-[235px]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF8FB3]">
                  01. Mulberry Satin & Rose Linen
                </p>
                <p className="text-xs text-[#E8B4C6] mt-0.5">
                  Double-faced dark plum satin bow over deep reddish-pink woven cloth.
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#3D1023]/95 to-[#290916]/95 border border-[#7D2B4B] rounded-2xl px-4 py-3 shadow-atelier-rest max-w-[240px] text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF8FB3]">
                  02. Hearts, Coils & Petals
                </p>
                <p className="text-xs text-[#E8B4C6] mt-0.5">
                  Velvet ruby & rose-foil hearts, silk curls, and crimson rose petals.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bottom Semantic Editorial Overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#1E0711] via-[#1E0711]/90 to-transparent pt-16 pb-7 md:pb-10">
            <div className="max-w-[1360px] mx-auto px-5 md:px-8 lg:px-12">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                <div className="pointer-events-auto max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#FF8FB3] mb-1.5">
                    Confectionery, Keepsakes & Paper Studio
                  </p>
                  <h1
                    className="font-serif-editorial text-[30px] sm:text-[42px] lg:text-[50px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#FFF0F5]"
                    style={{ textWrap: 'balance' }}
                  >
                    Curated keepsakes,{' '}
                    <em className="italic font-medium text-[#FF8FB3]">personalized</em> with tactile
                    grace.
                  </h1>
                </div>

                <div className="pointer-events-auto flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate('bespoke-box')}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-[#E84F82] to-[#B81D52] hover:from-[#F26694] hover:to-[#C9235B] text-[#FFF4F8] text-sm font-bold whitespace-nowrap cursor-pointer border border-[#FF9BBE]/35 bevel-letterpress transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E0711] focus-visible:ring-[#FF8FB3]"
                  >
                    <span>Compose a Gift Box</span>
                    <ArrowRight className="w-4 h-4 text-[#FFE3ED]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('stationery')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-br from-[#3D1023] to-[#290916] hover:from-[#4C142B] hover:to-[#350D1E] text-[#FCE7EF] border-[1.5px] border-[#9E3B5E] text-sm font-bold whitespace-nowrap cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB3]"
                  >
                    <span>Stationery Studio</span>
                  </button>
                </div>
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
