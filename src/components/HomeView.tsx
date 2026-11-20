import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { CLIENT_STORIES } from '../data/atelierData';
import { AtelierProduct, ProductCategory, ScreenView } from '../types/atelier';
import { GiftBox3DCanvas } from './GiftBox3DCanvas';

const CurioShelfShowcase = lazy(() =>
  import('./CurioShelfShowcase').then((m) => ({ default: m.CurioShelfShowcase }))
);

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
  const [mountShelf, setMountShelf] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const shelfGateRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mountShelf) return;
    const target = shelfGateRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') {
      setMountShelf(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setMountShelf(true);
          io.disconnect();
        }
      },
      { rootMargin: '500px 0px' }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [mountShelf]);

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
          <div className="absolute inset-0 w-full h-full">
            <GiftBox3DCanvas openProgress={smoothOpenProgress} mode="hero-open" />
          </div>

          {/* Bottom Centered Hero Lockup: Scroll-Revealed Keepsakes Title (Jost) + Compact Small Buttons */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#1B0610] via-[#1B0610]/80 to-transparent pt-20 pb-7 md:pb-10">
            <div className="max-w-[1380px] mx-auto px-4 sm:px-8 text-center">
              <div className="pointer-events-auto flex flex-col items-center">
                <motion.h1
                  style={{ opacity: headingOpacity, y: headingY, textWrap: 'balance' }}
                  className="font-display text-[56px] sm:text-[78px] md:text-[96px] lg:text-[114px] font-light leading-[0.94] tracking-[-0.02em] text-[#FFF0F5] max-w-[1320px] will-change-[transform,opacity]"
                >
                  Keepsakes
                </motion.h1>

                <motion.div
                  aria-hidden="true"
                  style={{ opacity: scrollPromptOpacity }}
                  className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.26em] text-[#E8B4C6] -mt-4 mb-2 pointer-events-none select-none"
                >
                  <span>Scroll to unbox</span>
                  <span className="inline-block w-8 h-px bg-[#E8B4C6]/70" />
                </motion.div>

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
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#FF8FB3] mb-2">
              Seasonal Editions
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-light tracking-[-0.02em] text-[#FFF0F5] leading-[1.04]">
              Curated Boxes & Paper
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
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-all duration-150 ${
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

        <div ref={shelfGateRef}>
          {mountShelf ? (
            <Suspense
              fallback={
                <div className="w-full h-[610px] sm:h-[670px] lg:h-[740px] rounded-3xl border border-[#6E2440] bg-gradient-to-br from-[#2B0A18] via-[#220813] to-[#360E1F] flex items-center justify-center text-xs uppercase tracking-[0.18em] text-[#C98DA4]">
                  Loading showcase…
                </div>
              }
            >
              <CurioShelfShowcase
                activeCategory={activeCategory}
                onQuickPersonalize={onQuickPersonalize}
                onQuickAdd={onQuickAdd}
                onSelectProduct={onSelectProduct}
              />
            </Suspense>
          ) : (
            <div className="w-full h-[610px] sm:h-[670px] lg:h-[740px] rounded-3xl border border-[#6E2440] bg-gradient-to-br from-[#2B0A18] via-[#220813] to-[#360E1F] flex items-center justify-center text-xs uppercase tracking-[0.18em] text-[#C98DA4]">
              Scroll to explore editions
            </div>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate('collections')}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#FCE7EF] hover:text-[#FF8FB3] border-b border-[#E84F82] pb-1 cursor-pointer transition-colors"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4 text-[#FF8FB3]" />
          </button>
        </div>
      </section>

      {/* Section 3: Unboxed Editorial Craftsmanship & Client Proof directly on the velvet canvas */}
      <section className="max-w-[1360px] mx-auto px-5 md:px-8 lg:px-12 py-4 md:py-8">
        <div className="border-b border-[#6E2440]/55 pb-8 md:pb-12">
          <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.22em] text-[#FF8FB3] mb-3 md:mb-4">
            The Unboxing Ritual
          </p>
          <h2
            className="font-display text-[52px] sm:text-[74px] md:text-[92px] lg:text-[106px] xl:text-[118px] font-light tracking-[-0.03em] text-[#FFF0F5] leading-[0.94]"
            style={{ textWrap: 'balance' }}
          >
            Tactile Signatures
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-10 md:pt-12">
          {/* Craftsmanship Pillars — pure editorial typography with hairline separators */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
            <div className="border-t border-[#6E2440]/45 pt-4 space-y-2.5">
              <span className="block text-[11px] font-medium tracking-[0.2em] text-[#FF8FB3] tabular-nums">
                01
              </span>
              <h3 className="font-display text-2xl font-light text-[#FFF0F5] leading-snug">
                Cushioned Vessels
              </h3>
              <p className="text-[13px] text-[#C98DA4] leading-relaxed">
                Rose Belgian linen wrapped over pleated silk.
              </p>
            </div>

            <div className="border-t border-[#6E2440]/45 pt-4 space-y-2.5">
              <span className="block text-[11px] font-medium tracking-[0.2em] text-[#FF8FB3] tabular-nums">
                02
              </span>
              <h3 className="font-display text-2xl font-light text-[#FFF0F5] leading-snug">
                Letterpress Cotton
              </h3>
              <p className="text-[13px] text-[#C98DA4] leading-relaxed">
                600gsm deckle rag pressed with foil crests.
              </p>
            </div>

            <div className="border-t border-[#6E2440]/45 pt-4 space-y-2.5">
              <span className="block text-[11px] font-medium tracking-[0.2em] text-[#FF8FB3] tabular-nums">
                03
              </span>
              <h3 className="font-display text-2xl font-light text-[#FFF0F5] leading-snug">
                Silk Ribbon & Wax
              </h3>
              <p className="text-[13px] text-[#C98DA4] leading-relaxed">
                Hand-tied satin and poured brass wax seals.
              </p>
            </div>
          </div>

          {/* Adjacent Attributable Client Proof — open editorial pull-quotes */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-8 lg:pl-4">
            {CLIENT_STORIES.map((story) => (
              <blockquote
                key={story.author}
                className="border-t border-[#6E2440]/45 pt-4 space-y-3"
              >
                <p className="font-display text-lg md:text-[19px] font-light text-[#FCE7EF] leading-relaxed">
                  “{story.quote}”
                </p>
                <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
                  <div className="flex flex-wrap items-center gap-x-2 text-[#B67A91]">
                    <span className="font-medium text-[#FFF0F5]">{story.author}</span>
                    <span aria-hidden="true">·</span>
                    <span>{story.role}</span>
                  </div>
                  <span className="font-medium text-[#FF8FB3] whitespace-nowrap tabular-nums">
                    {story.detail}
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
