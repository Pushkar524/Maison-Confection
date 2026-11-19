import { ArrowRight } from 'lucide-react';
import { useScroll, useSpring, useTransform } from 'motion/react';
import { useRef } from 'react';
import { ScreenView } from '../types/atelier';
import { GiftBox3DCanvas } from './GiftBox3DCanvas';

interface GiftBoxOutroProps {
  onNavigate: (screen: ScreenView) => void;
}

export function GiftBoxOutro({ onNavigate }: GiftBoxOutroProps) {
  const outroRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: outroRef,
    offset: ['start end', 'center center'],
  });

  // Reverse scroll progress: box starts open (1) as user enters outro, and closes shut (0) at center/footer
  const rawClosingProgress = useTransform(scrollYProgress, [0.1, 0.88], [1, 0]);
  const smoothOpenState = useSpring(rawClosingProgress, {
    stiffness: 110,
    damping: 22,
    mass: 0.7,
  });

  return (
    <section
      ref={outroRef}
      className="w-full bg-[#F9E4EB] border-t border-[#E9C4D1] mt-16"
      aria-label="Closing keepsake ritual"
    >
      <div className="max-w-[1360px] mx-auto px-5 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 h-[380px] sm:h-[440px] lg:h-[480px] rounded-3xl overflow-hidden border border-[#E9C4D1]">
            <GiftBox3DCanvas openProgress={smoothOpenState} mode="outro-close" />
          </div>

          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9E3B58]">
              Sealed & Tied by Hand
            </p>
            <h2
              className="font-serif-editorial text-3xl sm:text-4xl md:text-[42px] font-semibold text-[#161013] leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Every heart, petal, and coiled ribbon gathered inside.
            </h2>
            <p className="text-base text-[#6E4E5A] leading-relaxed">
              As your parcel closes for dispatch, each confection, botanical rose petal, and coiled
              satin ribbon settles safely beneath its cushioned linen lid—ready to unfold anew when
              your recipient unties the bow.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => {
                  onNavigate('bespoke-box');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#161013] hover:bg-[#2B1C22] text-[#FDF2F5] text-sm font-bold whitespace-nowrap cursor-pointer bevel-letterpress transition-transform duration-150 hover:scale-[1.02]"
              >
                <span>Compose Your Keepsake Box</span>
                <ArrowRight className="w-4 h-4 text-[#F4C2D2]" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate('collections');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FFF9FB] hover:bg-[#FDF2F5] text-[#161013] border-[1.5px] border-[#161013] text-sm font-bold whitespace-nowrap cursor-pointer transition-colors"
              >
                <span>View Ready-to-Ship Coffrets</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
