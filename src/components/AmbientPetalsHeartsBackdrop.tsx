import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

interface FloatingPiece {
  id: string;
  kind: 'heart' | 'petal' | 'ribbon';
  left: string;
  top: string;
  size: number;
  color: string;
  highlightColor: string;
  rotateBase: number;
  parallaxSpeed: number;
  opacity: number;
}

const AMBIENT_PIECES: FloatingPiece[] = [
  { id: 'h1', kind: 'heart', left: '4%', top: '16%', size: 32, color: '#161013', highlightColor: '#5B3946', rotateBase: -18, parallaxSpeed: -140, opacity: 0.24 },
  { id: 'p1', kind: 'petal', left: '11%', top: '30%', size: 28, color: '#F2B8CB', highlightColor: '#FFF9FB', rotateBase: 24, parallaxSpeed: -210, opacity: 0.6 },
  { id: 'r1', kind: 'ribbon', left: '3%', top: '48%', size: 50, color: '#161013', highlightColor: '#6E4E5A', rotateBase: -12, parallaxSpeed: -170, opacity: 0.28 },
  { id: 'h2', kind: 'heart', left: '8%', top: '66%', size: 26, color: '#F2B8CB', highlightColor: '#FFF9FB', rotateBase: 14, parallaxSpeed: -240, opacity: 0.55 },
  { id: 'p2', kind: 'petal', left: '5%', top: '82%', size: 32, color: '#9E3B58', highlightColor: '#F4C2D2', rotateBase: -32, parallaxSpeed: -130, opacity: 0.32 },
  { id: 'r2', kind: 'ribbon', left: '91%', top: '18%', size: 52, color: '#9E3B58', highlightColor: '#F4C2D2', rotateBase: 22, parallaxSpeed: -190, opacity: 0.36 },
  { id: 'h3', kind: 'heart', left: '88%', top: '35%', size: 34, color: '#F4C2D2', highlightColor: '#FFF9FB', rotateBase: -14, parallaxSpeed: -260, opacity: 0.58 },
  { id: 'p3', kind: 'petal', left: '93%', top: '53%', size: 30, color: '#E39BB2', highlightColor: '#FFF0F5', rotateBase: 36, parallaxSpeed: -160, opacity: 0.52 },
  { id: 'r3', kind: 'ribbon', left: '86%', top: '70%', size: 46, color: '#161013', highlightColor: '#4A2B36', rotateBase: -26, parallaxSpeed: -220, opacity: 0.26 },
  { id: 'h4', kind: 'heart', left: '92%', top: '85%', size: 28, color: '#9E3B58', highlightColor: '#F4C2D2', rotateBase: 18, parallaxSpeed: -150, opacity: 0.32 },
  { id: 'p4', kind: 'petal', left: '24%', top: '20%', size: 24, color: '#F4C2D2', highlightColor: '#FFFFFF', rotateBase: -22, parallaxSpeed: -280, opacity: 0.55 },
  { id: 'r4', kind: 'ribbon', left: '75%', top: '25%', size: 40, color: '#C9A25E', highlightColor: '#F6E6C4', rotateBase: 15, parallaxSpeed: -200, opacity: 0.38 },
  { id: 'h5', kind: 'heart', left: '34%', top: '76%', size: 24, color: '#161013', highlightColor: '#4A2B36', rotateBase: -10, parallaxSpeed: -250, opacity: 0.22 },
  { id: 'p5', kind: 'petal', left: '64%', top: '74%', size: 28, color: '#F2B8CB', highlightColor: '#FFF9FB', rotateBase: 40, parallaxSpeed: -180, opacity: 0.55 },
  { id: 'p6', kind: 'petal', left: '48%', top: '14%', size: 22, color: '#E39BB2', highlightColor: '#FFF9FB', rotateBase: 12, parallaxSpeed: -230, opacity: 0.45 },
  { id: 'h6', kind: 'heart', left: '54%', top: '86%', size: 24, color: '#F2B8CB', highlightColor: '#FFF9FB', rotateBase: -16, parallaxSpeed: -175, opacity: 0.48 },
];

export function AmbientPetalsHeartsBackdrop() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const fieldOpacity = useTransform(
    scrollYProgress,
    [0, 0.06, 0.16, 0.84, 0.93, 0.99],
    [0, 0.28, 1, 1, 0.22, 0]
  );

  const fieldScale = useTransform(
    scrollYProgress,
    [0, 0.16, 0.84, 0.96],
    [0.88, 1, 1, 0.84]
  );

  return (
    <motion.div
      aria-hidden="true"
      style={{
        opacity: prefersReducedMotion ? 0.35 : fieldOpacity,
        scale: prefersReducedMotion ? 1 : fieldScale,
      }}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {AMBIENT_PIECES.map((piece) => (
        <FloatingPieceItem
          key={piece.id}
          piece={piece}
          scrollYProgress={scrollYProgress}
          reducedMotion={Boolean(prefersReducedMotion)}
        />
      ))}
    </motion.div>
  );
}

function FloatingPieceItem({
  piece,
  scrollYProgress,
  reducedMotion,
}: {
  piece: FloatingPiece;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  reducedMotion: boolean;
}) {
  const y = useTransform(scrollYProgress, [0, 1], [30, piece.parallaxSpeed]);
  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    [piece.rotateBase, piece.rotateBase + (piece.parallaxSpeed < -200 ? 45 : -35)]
  );
  const gradId = `grad-${piece.id}`;

  return (
    <motion.div
      style={{
        left: piece.left,
        top: piece.top,
        opacity: piece.opacity,
        y: reducedMotion ? 0 : y,
        rotate: reducedMotion ? piece.rotateBase : rotate,
        filter: 'drop-shadow(0 6px 10px rgba(22, 16, 19, 0.12))',
      }}
      className="absolute"
    >
      {piece.kind === 'heart' && (
        <svg width={piece.size} height={piece.size} viewBox="0 0 32 32">
          <defs>
            <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor={piece.highlightColor} />
              <stop offset="55%" stopColor={piece.color} />
              <stop offset="100%" stopColor={piece.color} />
            </radialGradient>
          </defs>
          <path
            d="M16 27 C16 27 4 18 4 10 C4 6 7.5 3 11.5 3 C13.8 3 15.2 4.3 16 5.6 C16.8 4.3 18.2 3 20.5 3 C24.5 3 28 6 28 10 C28 18 16 27 16 27 Z"
            fill={`url(#${gradId})`}
          />
        </svg>
      )}

      {piece.kind === 'petal' && (
        <svg width={piece.size} height={piece.size} viewBox="0 0 32 32">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={piece.highlightColor} />
              <stop offset="100%" stopColor={piece.color} />
            </linearGradient>
          </defs>
          <path
            d="M8 24 C3 14, 13 3, 23 8 C30 12, 24 27, 8 24 Z"
            fill={`url(#${gradId})`}
          />
        </svg>
      )}

      {piece.kind === 'ribbon' && (
        <svg width={piece.size} height={piece.size} viewBox="0 0 48 48">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={piece.highlightColor} />
              <stop offset="50%" stopColor={piece.color} />
              <stop offset="100%" stopColor={piece.highlightColor} />
            </linearGradient>
          </defs>
          <path
            d="M6 34 C14 14, 28 14, 22 28 C16 38, 34 38, 42 16"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </motion.div>
  );
}
