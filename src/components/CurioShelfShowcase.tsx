import { ChevronLeft, ChevronRight, RotateCw, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ATELIER_PRODUCTS, HERO_IMAGE } from '../data/atelierData';
import { AtelierProduct, ProductCategory } from '../types/atelier';

interface CurioShelfShowcaseProps {
  activeCategory: ProductCategory;
  onQuickPersonalize: (product: AtelierProduct) => void;
  onQuickAdd: (product: AtelierProduct) => void;
  onSelectProduct: (product: AtelierProduct) => void;
}

type PackKind = 'coffret' | 'parcel' | 'stationery-pack' | 'pantry-box';

interface ShelfItem {
  id: string;
  productId: string;
  kind: PackKind;
  category: Exclude<ProductCategory, 'All Curios'>;
  title: string;
  t1: string;
  t2: string;
  sub: string;
  specTag: string;
  code: string;
  price: number;
  shelf: 0 | 1;
  slot: number;
  ribbonHex: string;
  wrapColor: string;
  trimHex: string;
  image: string;
  blurb: string;
}

const SHELF_ITEMS: ShelfItem[] = [
  {
    id: 'grand-bonbon',
    productId: 'coffret-grand-bonbon',
    kind: 'coffret',
    category: 'Confection Boxes',
    title: 'Grand Jardin Bonbon Box',
    t1: 'GRAND JARDIN',
    t2: 'BONBON COFFRET',
    sub: '16 PRALINES & AMALFI CITRON',
    specTag: '16 PCS',
    code: '01',
    price: 78,
    shelf: 0,
    slot: 0,
    ribbonHex: '#F4C2D2',
    wrapColor: '#1E1216',
    trimHex: '#2D1A21',
    image: '/src/assets/images/product_bonbon_coffret_1795102538021.jpg',
    blurb:
      'Sixteen hand-painted single-origin cacao bonbons paired with candied Amalfi citron in a keepsake silk-rose coffret.',
  },
  {
    id: 'macaron-parcel',
    productId: 'atelier-macaron-ribbon',
    kind: 'parcel',
    category: 'Confection Boxes',
    title: 'Fête du Jour Macaron Parcel',
    t1: 'FÊTE DU JOUR',
    t2: 'MACARON PARCEL',
    sub: '12 ROSEWATER & PISTACHIO',
    specTag: '12 PCS',
    code: '02',
    price: 64,
    shelf: 0,
    slot: 1,
    ribbonHex: '#161013',
    wrapColor: '#F5CEDB',
    trimHex: '#E5AFC2',
    image: '/src/assets/images/product_macaron_ribbon_box_1795102538417.jpg',
    blurb:
      'A pillowy blush linen keepsake cube bound in deep noir satin ribbon, cushioned with twelve crisp almond macarons.',
  },
  {
    id: 'eliza-oliver',
    productId: 'cotton-rag-invitation-suite',
    kind: 'stationery-pack',
    category: 'Event Stationery',
    title: 'Eliza & Oliver Rag Pack',
    t1: 'ELIZA & OLIVER',
    t2: 'STATIONERY PACK',
    sub: '25 SUITES · 600GSM COTTON',
    specTag: '600 GSM',
    code: '03',
    price: 185,
    shelf: 0,
    slot: 2,
    ribbonHex: '#E8B4C6',
    wrapColor: '#6D263E',
    trimHex: '#4E1A2B',
    image: '/src/assets/images/product_stationery_suite_1795102538035.jpg',
    blurb:
      'Pressed on antique Heidelberg platens using 600gsm deckle cotton rag, bundled with silk ribbon and wax seals.',
  },
  {
    id: 'aurora-tea',
    productId: 'wildflower-tea-honey-curio',
    kind: 'pantry-box',
    category: 'Tea & Pantry',
    title: 'Aurora Tea & Honey Tin Box',
    t1: 'AURORA DUO',
    t2: 'TEA & HONEY BOX',
    sub: '120G OOLONG & RAW HONEY',
    specTag: '120G + JAR',
    code: '04',
    price: 56,
    shelf: 0,
    slot: 3,
    ribbonHex: '#E8B4C6',
    wrapColor: '#1B1115',
    trimHex: '#2C1B22',
    image: '/src/assets/images/product_curio_tea_tin_1795102538911.jpg',
    blurb:
      'Embossed apothecary tea caddy filled with chamomile and elderflower oolong alongside single-apiary Provence honey.',
  },
  {
    id: 'pour-toi',
    productId: 'atelier-pour-toi-hamper',
    kind: 'coffret',
    category: 'Confection Boxes',
    title: 'Pour Toi Keepsake Trunk',
    t1: 'POUR TOI',
    t2: 'KEEPSAKE TRUNK',
    sub: '18 CONFECTIONS & WAX NOTE',
    specTag: '18 PCS',
    code: '05',
    price: 128,
    shelf: 0,
    slot: 4,
    ribbonHex: '#161013',
    wrapColor: '#9E3B58',
    trimHex: '#7A2A42',
    image: HERO_IMAGE,
    blurb:
      'Our signature multi-sensory unboxing ritual: petal-rose silk trunk holding macarons, truffles, and wax-sealed notes.',
  },
  {
    id: 'soiree-menu',
    productId: 'scalloped-menu-placecards',
    kind: 'stationery-pack',
    category: 'Event Stationery',
    title: 'Scalloped Soirée Card Pack',
    t1: 'SCALLOPED',
    t2: 'SOIRÉE CARD PACK',
    sub: '12 MENUS & PLACE CARDS',
    specTag: '450 GSM',
    code: '06',
    price: 92,
    shelf: 1,
    slot: 0,
    ribbonHex: '#161013',
    wrapColor: '#EEBACB',
    trimHex: '#DA9BB0',
    image: '/src/assets/images/product_stationery_suite_1795102538035.jpg',
    blurb:
      'Tailored table stationery crafted on rose-tinted cotton stock with scalloped borders and satin ribbon knots.',
  },
  {
    id: 'criollo-reserve',
    productId: 'coffret-grand-bonbon',
    kind: 'coffret',
    category: 'Confection Boxes',
    title: 'Criollo 24-Piece Gift Box',
    t1: 'CRIOLLO',
    t2: 'GRAND GIFT BOX',
    sub: '24 SINGLE-ORIGIN PRALINES',
    specTag: '24 PCS',
    code: '07',
    price: 112,
    shelf: 1,
    slot: 1,
    ribbonHex: '#F4C2D2',
    wrapColor: '#23151B',
    trimHex: '#37212A',
    image: '/src/assets/images/product_bonbon_coffret_1795102538021.jpg',
    blurb:
      'Double-height noir clothbound coffret housing twenty-four hand-tempered ganache pralines and Amalfi citron.',
  },
  {
    id: 'rosewater-double',
    productId: 'atelier-macaron-ribbon',
    kind: 'parcel',
    category: 'Confection Boxes',
    title: 'Rosewater Two-Tier Box',
    t1: 'ROSEWATER',
    t2: 'TWO-TIER PARCEL',
    sub: '24 PISTACHIO MACARONS',
    specTag: '24 PCS',
    code: '08',
    price: 106,
    shelf: 1,
    slot: 2,
    ribbonHex: '#F7D7E2',
    wrapColor: '#732941',
    trimHex: '#571D30',
    image: '/src/assets/images/product_macaron_ribbon_box_1795102538417.jpg',
    blurb:
      'Two stacked tiers of rosewater, pistachio, and blood-orange macarons bound in hand-ironed obsidian satin.',
  },
  {
    id: 'provence-pantry',
    productId: 'wildflower-tea-honey-curio',
    kind: 'pantry-box',
    category: 'Tea & Pantry',
    title: 'Provence Violet Gift Pack',
    t1: 'PROVENCE',
    t2: 'PANTRY PACK',
    sub: 'SUGARED VIOLETS & 2 HONEY JARS',
    specTag: 'TRIO PACK',
    code: '09',
    price: 84,
    shelf: 1,
    slot: 3,
    ribbonHex: '#161013',
    wrapColor: '#F2C6D5',
    trimHex: '#DEA5B8',
    image: '/src/assets/images/product_curio_tea_tin_1795102538911.jpg',
    blurb:
      'Crystalized Toulouse violet petals nestled beside two raw wildflower honey jars and botanical loose-leaf oolong.',
  },
  {
    id: 'atelier-reserve-trunk',
    productId: 'atelier-pour-toi-hamper',
    kind: 'coffret',
    category: 'Confection Boxes',
    title: 'Atelier Reserve Box',
    t1: 'ATELIER',
    t2: 'RESERVE COFFRET',
    sub: 'FULL TRUNK + TEA & HONEY',
    specTag: 'RESERVE',
    code: '10',
    price: 176,
    shelf: 1,
    slot: 4,
    ribbonHex: '#F4C2D2',
    wrapColor: '#1D1216',
    trimHex: '#2F1D24',
    image: HERO_IMAGE,
    blurb:
      'Our grandest linen archive box combining confections, botanical tea caddy, raw honey, and brass-sealed stationery.',
  },
];

const TAU = Math.PI * 2;
const SANS = '"Plus Jakarta Sans",-apple-system,BlinkMacSystemFont,sans-serif';
const SERIF = '"Playfair Display",Georgia,"Times New Roman",serif';
const MONO = 'ui-monospace,"SF Mono",Menlo,Monaco,Consolas,monospace';

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

function mulberry(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h?: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h === undefined ? w : h;
  return c;
}

function linearGrad(
  g: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: [number, string][]
) {
  const t = g.createLinearGradient(x0, y0, x1, y1);
  for (const s of stops) t.addColorStop(s[0], s[1]);
  return t;
}

function trackedText(
  g: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  track: number,
  align: CanvasTextAlign
) {
  let w = 0;
  for (const ch of text) w += g.measureText(ch).width + track;
  w -= track;
  let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const prev = g.textAlign;
  g.textAlign = 'left';
  for (const ch of text) {
    g.fillText(ch, cx, y);
    cx += g.measureText(ch).width + track;
  }
  g.textAlign = prev;
  return w;
}

function fitTrackedText(
  g: CanvasRenderingContext2D,
  text: string,
  w: number,
  weight: string,
  family: string,
  track: number
) {
  let lo = 4;
  let hi = 2400;
  const meas = (px: number) => {
    g.font = `${weight} ${px}px ${family}`;
    let t = 0;
    for (const ch of text) t += g.measureText(ch).width + track * px;
    return t - track * px;
  };
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2;
    if (meas(m) > w) hi = m;
    else lo = m;
  }
  g.font = `${weight} ${lo}px ${family}`;
  return lo;
}

function addGrain(g: CanvasRenderingContext2D, W: number, H: number, amount: number, seed: number) {
  const r = mulberry(seed || 7);
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
}

function drawClothWeave(
  g: CanvasRenderingContext2D,
  W: number,
  H: number,
  seed: number,
  amt = 0.05
) {
  const r = mulberry(seed || 3);
  g.save();
  g.globalAlpha = amt;
  for (let y = 0; y < H; y += 3) {
    g.fillStyle = r() > 0.5 ? '#fff' : '#000';
    g.fillRect(0, y, W, 1);
  }
  for (let x = 0; x < W; x += 3) {
    g.fillStyle = r() > 0.5 ? '#fff' : '#000';
    g.fillRect(x, 0, 1, H);
  }
  g.restore();
}

function isLightColor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255 > 0.54;
}

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/* ---- Procedural Torn-Paper Mask Helpers ---- */
function hash1(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function vnoise1(t: number, seed: number) {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash1(i + seed * 97.3), hash1(i + 1 + seed * 97.3), u);
}
function hash2(x: number, y: number) {
  const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function buildTearBand(TW: number, h: number) {
  const oct: [number, number][] = [
    [1 / 430, 42],
    [1 / 170, 20],
    [1 / 74, 10],
    [1 / 31, 4.8],
    [1 / 13, 2.3],
    [1 / 6, 1.1],
  ];
  const edge = new Float32Array(h);
  for (let y = 0; y < h; y++) {
    let e = TW * 0.42;
    for (let k = 0; k < oct.length; k++) e += (vnoise1(y * oct[k][0], k + 1) - 0.5) * 2 * oct[k][1];
    edge[y] = e;
  }
  const a = new Float32Array(TW * h);
  for (let y = 0; y < h; y++) {
    const e = edge[y];
    const fib = 5 + 16 * vnoise1(y / 8.5, 11);
    for (let x = 0; x < TW; x++) {
      const t = (x - e) / fib;
      let v = 0;
      if (t <= 0) v = 1;
      else if (t >= 1.35) v = 0;
      else {
        const n =
          hash2(Math.floor(x * 0.9), Math.floor(y * 0.75)) * 0.62 +
          hash2(Math.floor(x * 2.4) + 37, Math.floor(y * 2.1) + 11) * 0.38;
        v = clamp(1.18 - t - (n - 0.5) * 0.95, 0, 1);
        v = v * v * (3 - 2 * v);
      }
      a[y * TW + x] = v;
    }
  }
  return a;
}

function tintBand(
  a: Float32Array,
  TW: number,
  h: number,
  r: number,
  g0: number,
  b0: number,
  edgeDark: boolean
) {
  const c = makeCanvas(TW, h);
  const g = c.getContext('2d')!;
  const img = g.createImageData(TW, h);
  const d = img.data;
  for (let i = 0; i < TW * h; i++) {
    const v = a[i];
    let k = 1;
    if (edgeDark && v > 0.02 && v < 0.97) k = 0.88 + 0.12 * v;
    d[i * 4] = r * k;
    d[i * 4 + 1] = g0 * k;
    d[i * 4 + 2] = b0 * k;
    d[i * 4 + 3] = v * 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

/* ---- Tween & Spring Animation Primitives ---- */
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeSettle = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const activeEase = (t: number) =>
  t < 0.3 ? 0.3 * Math.pow(t / 0.3, 3) : 0.3 + 0.7 * (1 - Math.pow(1 - (t - 0.3) / 0.7, 3));

class Tw {
  v: number[];
  from: number[];
  to: number[];
  t0 = 0;
  d = 0;
  e: (t: number) => number = easeOutQuart;

  constructor(v: number[]) {
    this.v = v.slice();
    this.from = v.slice();
    this.to = v.slice();
  }
  start(to: number[], d: number, now: number, e?: (t: number) => number, delay?: number) {
    this.from = this.v.slice();
    this.to = to.slice();
    this.t0 = now + (delay || 0);
    this.d = Math.max(d, 1);
    this.e = e || easeOutQuart;
  }
  set(to: number[]) {
    this.v = to.slice();
    this.from = to.slice();
    this.to = to.slice();
    this.d = 0;
  }
  update(now: number) {
    if (this.d <= 0) return;
    let t = (now - this.t0) / this.d;
    if (t < 0) return;
    if (t >= 1) {
      t = 1;
      this.d = 0;
    }
    const k = this.e(t);
    for (let i = 0; i < this.v.length; i++) {
      this.v[i] = this.from[i] + (this.to[i] - this.from[i]) * k;
    }
  }
}

class Spring {
  v: number[];
  tgt: number[];
  vel: number[];
  k: number;
  c: number;
  m: number;

  constructor(v: number[], tension: number, friction: number, mass = 1) {
    this.v = v.slice();
    this.tgt = v.slice();
    this.vel = v.map(() => 0);
    this.k = tension;
    this.c = friction;
    this.m = mass;
  }
  start(t: number[]) {
    this.tgt = t.slice();
  }
  update(dt: number) {
    const step = Math.min(dt, 1 / 30);
    for (let i = 0; i < this.v.length; i++) {
      const a = (this.k * (this.tgt[i] - this.v[i]) - this.c * this.vel[i]) / this.m;
      this.vel[i] += a * step;
      this.v[i] += this.vel[i] * step;
    }
  }
}

export function CurioShelfShowcase({
  activeCategory,
  onQuickPersonalize,
  onQuickAdd,
  onSelectProduct,
}: CurioShelfShowcaseProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const washRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedItem, setSelectedItem] = useState<ShelfItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<ShelfItem | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  );
  const [mobileIndex, setMobileIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [stageReady, setStageReady] = useState(false);

  const activeCategoryRef = useRef<ProductCategory>(activeCategory);
  activeCategoryRef.current = activeCategory;

  const actionsRef = useRef<{
    selectById: (id: string) => void;
    clearActive: () => void;
    flipActive: () => void;
    hoverById: (id: string | null) => void;
    stepMobile: (delta: number) => void;
  } | null>(null);

  const productMap = useMemo(() => {
    const map = new Map<string, AtelierProduct>();
    ATELIER_PRODUCTS.forEach((p) => map.set(p.id, p));
    return map;
  }, []);

  const activeProduct = selectedItem ? productMap.get(selectedItem.productId) ?? null : null;

  useEffect(() => {
    const stageEl = stageRef.current;
    const canvas = canvasRef.current;
    const washEl = washRef.current;
    if (!stageEl || !canvas || !washEl) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const disposables: { dispose: () => void }[] = [];

    // Box & Pack Boutique Dimensions (wider, chunkier coffret & parcel proportions — NOT books)
    const K = {
      boxW: 0.96,
      boxH: 1.14,
      boxD: 0.28,
      lean: -0.17,
      yaw: 0.145,
      bow: 0.007,
      chamf: 0.015,
      chamfR: 0.028,
      shelfTop: [0.251, -1.241] as [number, number],
      plankHalf: 3.38,
      plankThick: 0.105,
      plankDepth: 0.86,
      wallZ: -1.43,
      itemZ: -1.14,
      slot: 1.24,
      activeDuration: 680,
      hoverDrop: 380,
      hoverLift: 750,
      introStagger: 65,
      introWallFade: 750,
      introFade: 420,
      fov: 20,
      boundX: 5.95,
      boundY: 3.25,
      boundCY: 0.02,
      offset: 1.22,
      maxWidthPx: 1420,
      orbitAz: 0.075,
      orbitEl: 0.045,
      activeX: 0.72,
      activeRot: [0.065, 0.27, 0.0] as [number, number, number],
      mTilt: -Math.PI / 7,
      mFlat: -0.06,
      mStepZ: 0.16,
      mStepY: 0.16,
      mY: 0.28,
      mZ0: 0.75,
      mFill: 0.62,
      mDrop: 0.22,
    };

    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (REDUCED) {
      K.introStagger = 0;
      K.introWallFade = 240;
      K.introFade = 180;
      K.hoverLift = 240;
      K.hoverDrop = 180;
      K.activeDuration = 280;
      K.orbitAz = 0;
      K.orbitEl = 0;
    }

    const MOBILE_Q = window.matchMedia('(max-width: 767px)');
    let MOBILE = MOBILE_Q.matches;

    let stageVisible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        stageVisible = entry?.isIntersecting ?? true;
      },
      { rootMargin: '180px' }
    );
    io.observe(stageEl);

    /* ---- Preload Local Atelier Photography Plates ---- */
    const PLATE: Record<string, HTMLImageElement> = {};
    const uniqueImages = Array.from(new Set(SHELF_ITEMS.map((b) => b.image)));
    const imagePromiseMap = new Map<string, Promise<HTMLImageElement | null>>();
    uniqueImages.forEach((src) => {
      imagePromiseMap.set(
        src,
        new Promise((resolve) => {
          const im = new Image();
          im.onload = () => resolve(im);
          im.onerror = () => resolve(null);
          im.src = src;
        })
      );
    });

    /* ---- Box Lid / Stationery Pack Label Painters (NOT books) ---- */
    function paintBoxLid(b: ShelfItem, W: number, H: number) {
      const c = makeCanvas(W, H);
      const g = c.getContext('2d')!;
      const light = isLightColor(b.wrapColor);
      const ink = light ? '#1B1115' : '#FDF2F5';
      const accentInk = light ? '#9E3B58' : '#F4C2D2';

      g.fillStyle = b.wrapColor;
      g.fillRect(0, 0, W, H);
      drawClothWeave(g, W, H, b.title.length * 17 + 9, light ? 0.04 : 0.055);

      g.fillStyle = linearGrad(g, 0, 0, W, H, [
        [0, light ? 'rgba(255,255,255,0.22)' : 'rgba(244,194,210,0.09)'],
        [1, 'rgba(0,0,0,0.16)'],
      ]);
      g.fillRect(0, 0, W, H);

      // Telescoping Coffret Lid Border / Stationery Envelope Flap Line
      g.strokeStyle = light ? 'rgba(27,17,21,0.18)' : 'rgba(244,194,210,0.25)';
      g.lineWidth = Math.max(2, W * 0.003);
      g.strokeRect(W * 0.045, H * 0.04, W * 0.91, H * 0.92);

      if (b.kind === 'stationery-pack') {
        // V-envelope flap crease across top of stationery sleeve
        g.beginPath();
        g.moveTo(W * 0.045, H * 0.04);
        g.lineTo(W * 0.5, H * 0.24);
        g.lineTo(W * 0.955, H * 0.04);
        g.stroke();
      }

      // Top Spec Header: Piece Count & Price Badge
      g.fillStyle = accentInk;
      g.font = `700 ${W * 0.026}px ${SANS}`;
      g.textAlign = 'left';
      trackedText(g, b.specTag, W * 0.085, H * 0.092, W * 0.004, 'left');

      g.textAlign = 'right';
      g.fillStyle = ink;
      g.globalAlpha = 0.8;
      trackedText(g, `$${b.price}`, W * 0.915, H * 0.092, W * 0.003, 'right');
      g.globalAlpha = 1;

      // Framed Presentation Label Window on Box Lid (art-directed around ribbon paths)
      const centerX =
        b.kind === 'coffret' || b.kind === 'parcel'
          ? W * 0.425
          : b.kind === 'stationery-pack'
          ? W * 0.575
          : W * 0.5;
      const frameW = b.kind === 'pantry-box' ? W * 0.8 : W * 0.69;
      const px = centerX - frameW * 0.5;
      const py = b.kind === 'stationery-pack' ? H * 0.17 : H * 0.135;
      const pw = frameW;
      const ph = b.kind === 'stationery-pack' ? H * 0.42 : H * 0.415;
      g.save();
      g.fillStyle = light ? '#EED7E0' : '#2E1C24';
      g.fillRect(px, py, pw, ph);
      const img = PLATE[b.id];
      if (img && img.naturalWidth > 0) {
        const aspectBox = pw / ph;
        const aspectImg = img.naturalWidth / img.naturalHeight;
        let sx = 0;
        let sy = 0;
        let sw = img.naturalWidth;
        let sh = img.naturalHeight;
        if (aspectImg > aspectBox) {
          sw = img.naturalHeight * aspectBox;
          sx = (img.naturalWidth - sw) * 0.5;
        } else {
          sh = img.naturalWidth / aspectBox;
          sy = (img.naturalHeight - sh) * 0.5;
        }
        g.drawImage(img, sx, sy, sw, sh, px, py, pw, ph);
      }
      g.strokeStyle = light ? 'rgba(27,17,21,0.26)' : 'rgba(244,194,210,0.34)';
      g.lineWidth = W * 0.004;
      g.strokeRect(px, py, pw, ph);
      g.restore();

      // Debossed Typography Plate tucked cleanly below the waist ribbon
      g.fillStyle = ink;
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      const maxTextW = b.kind === 'pantry-box' ? W * 0.78 : W * 0.68;
      const s1 = fitTrackedText(g, b.t1, maxTextW, '600', SERIF, 0.05);
      const y1 = H * 0.742;
      trackedText(g, b.t1, centerX, y1, s1 * 0.05, 'center');

      if (b.t2) {
        g.fillStyle = accentInk;
        const s2 = fitTrackedText(g, b.t2, maxTextW * 0.96, '500', SERIF, 0.06);
        trackedText(g, b.t2, centerX, y1 + s1 * 1.14, Math.min(s2, s1 * 0.86) * 0.06, 'center');
      }

      g.fillStyle = ink;
      g.globalAlpha = 0.72;
      g.font = `600 ${W * 0.022}px ${SANS}`;
      trackedText(g, b.sub, centerX, H * 0.882, W * 0.0035, 'center');

      g.globalAlpha = 0.55;
      g.font = `500 ${W * 0.019}px ${SANS}`;
      trackedText(g, 'MAISON CONFECTION · ATELIER', centerX, H * 0.932, W * 0.0045, 'center');
      g.globalAlpha = 1;

      addGrain(g, W, H, 7, 13 + b.slot * 7);
      return c;
    }

    function paintBoxUnderside(b: ShelfItem, W: number, H: number) {
      const c = makeCanvas(W, H);
      const g = c.getContext('2d')!;
      const r = mulberry(109 + b.slot * 31);
      const light = isLightColor(b.wrapColor);
      const ink = light ? '#1B1115' : '#FDF2F5';

      g.fillStyle = b.wrapColor;
      g.fillRect(0, 0, W, H);
      drawClothWeave(g, W, H, 19, 0.05);
      g.fillStyle = linearGrad(g, 0, 0, W, H, [
        [0, 'rgba(244,194,210,0.06)'],
        [1, 'rgba(0,0,0,0.14)'],
      ]);
      g.fillRect(0, 0, W, H);

      // Three Detail Tasting / Craft Crop Plates
      const img = PLATE[b.id];
      const crops: [number, number, number][] = [
        [0.06, 0.05, 0.44],
        [0.3, 0.36, 0.42],
        [0.54, 0.62, 0.4],
      ];
      for (let i = 0; i < 3; i++) {
        const x = W * (0.1 + i * 0.28);
        const y = H * 0.11;
        const w = W * 0.24;
        const h = w * 1.1;
        g.save();
        g.fillStyle = light ? '#EED7E0' : '#2D1B23';
        g.fillRect(x, y, w, h);
        if (img && img.naturalWidth > 0) {
          const cw = img.naturalWidth * crops[i][2];
          const ch = cw * (h / w);
          const sx = Math.min(img.naturalWidth - cw, img.naturalWidth * crops[i][0]);
          const sy = Math.min(img.naturalHeight - ch, img.naturalHeight * crops[i][1]);
          g.drawImage(img, sx, sy, cw, ch, x, y, w, h);
        } else {
          g.fillStyle = linearGrad(g, x, y, x + w, y + h, [
            [0, b.trimHex],
            [1, '#1B1115'],
          ]);
          g.fillRect(x, y, w, h);
        }
        g.strokeStyle = light ? 'rgba(27,17,21,0.28)' : 'rgba(244,194,210,0.32)';
        g.lineWidth = W * 0.0025;
        g.strokeRect(x, y, w, h);
        g.restore();
      }

      g.fillStyle = ink;
      g.globalAlpha = 0.64;
      g.font = `500 ${W * 0.018}px ${MONO}`;
      g.textAlign = 'left';
      g.fillText(`CURIO SPEC · ${b.specTag} · ${b.category.toUpperCase()}`, W * 0.1, H * 0.415);
      g.globalAlpha = 1;

      // Craft & Tasting Card Copy
      g.font = `400 ${W * 0.03}px ${SERIF}`;
      g.fillStyle = ink;
      const words = b.blurb.split(' ');
      let line = '';
      let y = H * 0.505;
      for (const w0 of words) {
        const t = line ? `${line} ${w0}` : w0;
        if (g.measureText(t).width > W * 0.8) {
          g.fillText(line, W * 0.1, y);
          line = w0;
          y += W * 0.044;
        } else {
          line = t;
        }
      }
      g.fillText(line, W * 0.1, y);

      g.globalAlpha = 0.72;
      g.font = `600 ${W * 0.02}px ${SANS}`;
      trackedText(g, `HANDCRAFTED IN SMALL BATCHES · REF ${b.code}`, W * 0.1, y + W * 0.075, W * 0.003, 'left');
      g.globalAlpha = 1;

      // Monogram Atelier Seal
      g.save();
      g.translate(W * 0.13, H * 0.855);
      g.strokeStyle = ink;
      g.globalAlpha = 0.55;
      g.lineWidth = W * 0.0035;
      g.beginPath();
      g.arc(0, 0, W * 0.056, 0, TAU);
      g.stroke();
      g.globalAlpha = 1;
      g.fillStyle = ink;
      g.font = `600 ${W * 0.028}px ${SERIF}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('MC', 0, W * 0.002);
      g.restore();

      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      g.fillStyle = ink;
      g.font = `600 ${W * 0.022}px ${SANS}`;
      trackedText(g, 'MAISON CONFECTION', W * 0.21, H * 0.845, W * 0.004, 'left');
      g.globalAlpha = 0.65;
      g.font = `400 ${W * 0.019}px ${SANS}`;
      g.fillText(`Packaged to Order · Keepsake Vessel`, W * 0.21, H * 0.875);
      g.globalAlpha = 1;

      // Atelier Batch Label & Price
      const bx = W * 0.61;
      const by = H * 0.818;
      const bw = W * 0.29;
      const bh = H * 0.082;
      g.fillStyle = '#FFF9FB';
      g.fillRect(bx, by, bw, bh);
      g.fillStyle = '#161013';
      let px = bx + bw * 0.04;
      while (px < bx + bw * 0.96) {
        const w = W * (0.002 + (r() < 0.3 ? 0.0055 : 0.002) * r() * 3);
        g.fillRect(px, by + bh * 0.1, w, bh * 0.64);
        px += w + W * (0.002 + r() * 0.004);
      }
      g.font = `400 ${W * 0.017}px ${MONO}`;
      g.textAlign = 'center';
      g.fillText(`MC-COFFRET-${b.code}`, bx + bw / 2, by + bh * 0.92);

      g.textAlign = 'right';
      g.fillStyle = ink;
      g.globalAlpha = 0.85;
      g.font = `700 ${W * 0.024}px ${SANS}`;
      g.fillText(`$${b.price}.00`, W * 0.9, H * 0.78);
      g.globalAlpha = 1;

      addGrain(g, W, H, 7, 5);
      return c;
    }

    /* ---- Ebonized Espresso Rosewood Shelf Texture ---- */
    function woodTexture(px: number) {
      const W = px;
      const Hh = Math.round(px * 0.5);
      const c = makeCanvas(W, Hh);
      const g = c.getContext('2d')!;
      const r = mulberry(909);
      g.fillStyle = '#331E26';
      g.fillRect(0, 0, W, Hh);

      for (let i = 0; i < 14; i++) {
        g.fillStyle = `rgba(${68 + ((r() * 24) | 0)},${40 + ((r() * 14) | 0)},${52 + ((r() * 18) | 0)},${0.08 + r() * 0.1})`;
        g.beginPath();
        g.ellipse(r() * W, r() * Hh, W * (0.1 + r() * 0.28), Hh * (0.06 + r() * 0.2), 0, 0, TAU);
        g.fill();
      }
      for (let i = 0; i < 400; i++) {
        const y0 = r() * Hh;
        const amp = Hh * (0.004 + r() * 0.018);
        const f = 0.6 + r() * 2.2;
        const ph = r() * TAU;
        const dark = r() < 0.4;
        g.strokeStyle = dark
          ? `rgba(${16 + ((r() * 12) | 0)},${9 + ((r() * 7) | 0)},${12 + ((r() * 8) | 0)},${0.35 + r() * 0.5})`
          : `rgba(${104 + ((r() * 32) | 0)},${64 + ((r() * 22) | 0)},${78 + ((r() * 24) | 0)},${0.16 + r() * 0.28})`;
        g.lineWidth = dark ? 0.8 + r() * 1.6 : 0.8 + r() * 2.2;
        g.beginPath();
        for (let x = 0; x <= W; x += 8) {
          const y =
            y0 + Math.sin((x / W) * TAU * f + ph) * amp + Math.sin((x / W) * TAU * f * 2.7 + ph * 2) * amp * 0.4;
          if (x === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
      }
      for (let i = 0; i < 7000; i++) {
        g.fillStyle = `rgba(18,10,14,${0.14 + r() * 0.3})`;
        g.fillRect(r() * W, r() * Hh, 1 + r() * 4, 1);
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8;
      disposables.push(t);
      return t;
    }

    /* ---- Baked Blush-Cotton Wall Texture ---- */
    const WALL = { x0: -9.15, x1: 9.15, y0: -9.67, y1: 8.63 };
    const WT = {
      peak: 244,
      bell: 11,
      bellR: 4.8,
      rightLift: 4,
      vFall: 14,
      vStart: 0.7,
      vRange: 3.2,
      bounce: 24,
      bounceR: 2.7,
      bouncePow: 2.5,
      plankHalf: 3.38,
      plankFeather: 1.7,
      tint: [0.992, 0.906, 0.935] as [number, number, number],
    };

    function paperTexture(px: number) {
      const c = makeCanvas(px, px);
      const g = c.getContext('2d')!;
      const r = mulberry(2027);
      g.fillStyle = '#808080';
      g.fillRect(0, 0, px, px);
      for (let i = 0; i < 65; i++) {
        g.fillStyle = `rgba(${r() < 0.5 ? 255 : 0},${r() < 0.5 ? 255 : 0},${r() < 0.5 ? 255 : 0},${0.01 + r() * 0.025})`;
        g.beginPath();
        g.ellipse(r() * px, r() * px, px * (0.05 + r() * 0.25), px * (0.04 + r() * 0.2), r() * TAU, 0, TAU);
        g.fill();
      }
      for (let i = 0; i < 4200; i++) {
        const x = r() * px;
        const y = r() * px;
        const l = 1 + r() * px * 0.032;
        const a = r() * TAU;
        g.strokeStyle =
          r() < 0.5 ? `rgba(255,255,255,${0.02 + r() * 0.08})` : `rgba(0,0,0,${0.02 + r() * 0.09})`;
        g.lineWidth = r() < 0.85 ? 1 : 2;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        g.stroke();
      }
      const img = g.getImageData(0, 0, px, px);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (r() - 0.5) * 28;
        d[i] += n;
        d[i + 1] += n;
        d[i + 2] += n;
      }
      g.putImageData(img, 0, 0);
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8;
      disposables.push(t);
      return t;
    }

    function wallTexture(px: number) {
      const c = makeCanvas(px, px);
      const g = c.getContext('2d')!;
      const Ww = WALL.x1 - WALL.x0;
      const Hh = WALL.y1 - WALL.y0;
      const img = g.createImageData(px, px);
      const d = img.data;
      const PT = K.shelfTop;
      const PB: [number, number] = [K.shelfTop[0] - K.plankThick, K.shelfTop[1] - K.plankThick];
      const sm = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
      const r = mulberry(5);

      for (let j = 0; j < px; j++) {
        const y = WALL.y1 - ((j + 0.5) / px) * Hh;
        for (let i = 0; i < px; i++) {
          const x = WALL.x0 + ((i + 0.5) / px) * Ww;
          const ax = Math.abs(x) / WT.bellR;
          let L = WT.peak - WT.bell * ax * ax + WT.rightLift * clamp(x / 4, 0, 1);
          L -= WT.vFall * sm((WT.vStart - y) / WT.vRange) * sm((-x + 2.8) / 8.6);
          const inPlank = 1 - sm((Math.abs(x) - WT.plankHalf) / WT.plankFeather);
          for (const pt of PT) {
            const dy = y - pt;
            if (dy >= 0 && dy <= WT.bounceR) {
              L += WT.bounce * Math.pow(1 - dy / WT.bounceR, WT.bouncePow) * inPlank;
            }
          }
          for (const pb of PB) {
            const dy = pb - y;
            if (dy >= 0 && dy <= 1.2) {
              L -= 24 * Math.pow(1 - dy / 1.2, 1.8) * inPlank;
            }
          }
          const n = (r() - 0.5) * 4;
          const o = (j * px + i) * 4;
          d[o] = clamp((L + n) * WT.tint[0], 0, 255);
          d[o + 1] = clamp((L + n) * WT.tint[1], 0, 255);
          d[o + 2] = clamp((L + n) * WT.tint[2], 0, 255);
          d[o + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      disposables.push(t);
      return t;
    }

    function shadowTex() {
      const P = 256;
      const c = makeCanvas(P);
      const g = c.getContext('2d')!;
      g.fillStyle = '#160B10';
      g.filter = `blur(${P * 0.135}px)`;
      const pad = P * 0.225;
      g.fillRect(pad, pad, P - pad * 2, P - pad * 2);
      g.filter = 'none';
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      disposables.push(t);
      return t;
    }

    function contactTex() {
      const W = 256;
      const H = 96;
      const c = makeCanvas(W, H);
      const g = c.getContext('2d')!;
      g.fillStyle = linearGrad(g, 0, 0, 0, H, [
        [0, 'rgba(20,10,14,1)'],
        [0.06, 'rgba(20,10,14,0.98)'],
        [0.16, 'rgba(20,10,14,0.80)'],
        [0.38, 'rgba(20,10,14,0.42)'],
        [0.7, 'rgba(20,10,14,0.13)'],
        [1, 'rgba(20,10,14,0)'],
      ]);
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'destination-out';
      g.fillStyle = linearGrad(g, 0, 0, W, 0, [
        [0, 'rgba(0,0,0,1)'],
        [0.05, 'rgba(0,0,0,0.70)'],
        [0.11, 'rgba(0,0,0,0.24)'],
        [0.18, 'rgba(0,0,0,0)'],
        [0.82, 'rgba(0,0,0,0)'],
        [0.89, 'rgba(0,0,0,0.24)'],
        [0.95, 'rgba(0,0,0,0.70)'],
        [1, 'rgba(0,0,0,1)'],
      ]);
      g.fillRect(0, 0, W, H);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      disposables.push(t);
      return t;
    }

    function creaseTex() {
      const W = 256;
      const H = 64;
      const c = makeCanvas(W, H);
      const g = c.getContext('2d')!;
      g.fillStyle = linearGrad(g, 0, H, 0, 0, [
        [0, 'rgba(20,10,14,1)'],
        [0.22, 'rgba(20,10,14,0.66)'],
        [0.55, 'rgba(20,10,14,0.22)'],
        [1, 'rgba(20,10,14,0)'],
      ]);
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'destination-out';
      g.fillStyle = linearGrad(g, 0, 0, W, 0, [
        [0, 'rgba(0,0,0,1)'],
        [0.14, 'rgba(0,0,0,0.35)'],
        [0.3, 'rgba(0,0,0,0)'],
        [0.7, 'rgba(0,0,0,0)'],
        [0.86, 'rgba(0,0,0,0.35)'],
        [1, 'rgba(0,0,0,1)'],
      ]);
      g.fillRect(0, 0, W, H);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      disposables.push(t);
      return t;
    }

    /* ---- Renderer & Scene ---- */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isSoftwareGl,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf6dde6, 1);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.autoClear = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(K.fov, 1, 0.2, 100);
    const LAY_BG = 0;
    const LAY_FG = 1;

    /* ---- Wall & Reflective Ebonized Oak Furniture ---- */
    const wallBakedTex = wallTexture(512);
    const wallPaperTex = paperTexture(256);
    const wallMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uBake: { value: wallBakedTex },
        uPaper: { value: wallPaperTex },
        uOpacity: { value: 0 },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        uniform sampler2D uBake; uniform sampler2D uPaper; uniform float uOpacity;
        varying vec2 vUv;
        void main(){
          vec3 bake = texture2D(uBake, vUv).rgb;
          float fine = texture2D(uPaper, vUv * 13.0).r;
          float mid = texture2D(uPaper, vUv * 3.1 + vec2(0.37, 0.19)).r;
          vec3 col = bake * (0.90 + 0.20 * fine) * (0.95 + 0.10 * mid);
          gl_FragColor = vec4(col, uOpacity);
          #include <colorspace_fragment>
        }
      `,
    });
    const wallGeo = new THREE.PlaneGeometry(WALL.x1 - WALL.x0, WALL.y1 - WALL.y0);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, (WALL.y0 + WALL.y1) / 2, K.wallZ);
    scene.add(wall);
    disposables.push(wallMat, wallGeo);

    const WOOD_TEX = woodTexture(512);
    function oakMaterial(axis: number) {
      return new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uWood: { value: WOOD_TEX },
          uOpacity: { value: 0 },
          uAxis: { value: axis },
        },
        vertexShader: `
          varying vec3 vP; varying vec3 vN;
          void main(){
            vP = position;
            vN = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uWood; uniform float uOpacity; uniform float uAxis;
          varying vec3 vP; varying vec3 vN;
          void main(){
            vec3 n = normalize(vN), an = abs(n);
            vec2 uvH, uvV, uvE;
            if(uAxis < 0.5){
              uvH = vec2(vP.x * 0.140, vP.z * 0.30);
              uvV = vec2(vP.x * 0.140, vP.y * 0.44);
              uvE = vec2(vP.z * 0.30, vP.y * 0.44);
            } else {
              uvH = vec2(vP.y * 0.100, vP.z * 0.30);
              uvV = vec2(vP.y * 0.100, vP.x * 0.55);
              uvE = vec2(vP.z * 0.30, vP.x * 0.55);
            }
            vec2 uv = mix(mix(uvV, uvH, an.y), uvE, an.x);
            vec3 wood = texture2D(uWood, uv).rgb;
            float up = max(n.y, 0.0), dn = max(-n.y, 0.0), fwd = max(n.z, 0.0), side = abs(n.x);
            float t = 1.25 * up + 0.16 * dn + 0.88 * fwd + 0.50 * side;
            float ao = mix(0.66, 1.0, clamp((vP.z + 0.42) / 0.66, 0.0, 1.0));
            t *= mix(1.0, ao, up);
            t *= mix(0.88, 1.0, 1.0 - pow(clamp(abs(vP.x) / 3.38, 0.0, 1.0), 8.0));
            vec3 col = wood * t;
            float arris = smoothstep(0.30, 0.50, vP.z * 2.0 + 0.5) * pow(clamp(n.z, 0.0, 1.0), 1.5);
            col += vec3(0.14, 0.095, 0.115) * arris;
            col += vec3(0.06, 0.040, 0.050) * pow(clamp(n.z, 0.0, 1.0), 5.0);
            gl_FragColor = vec4(col, uOpacity);
            #include <colorspace_fragment>
          }
        `,
      });
    }

    const oakH = oakMaterial(0);
    const oakV = oakMaterial(1);
    const plankGeo = new THREE.BoxGeometry(K.plankHalf * 2, K.plankThick, K.plankDepth);
    const uprightGeo = new THREE.BoxGeometry(0.095, 3.72, K.plankDepth);
    const furniture = new THREE.Group();
    const makePlank = (yTop: number) => {
      const m = new THREE.Mesh(plankGeo, oakH);
      m.position.set(0, yTop - K.plankThick / 2, K.wallZ + K.plankDepth / 2);
      return m;
    };
    const makeUpright = (x: number) => {
      const m = new THREE.Mesh(uprightGeo, oakV);
      m.position.set(x, -0.1, K.wallZ + K.plankDepth / 2);
      return m;
    };
    furniture.add(
      makePlank(K.shelfTop[0]),
      makePlank(K.shelfTop[1]),
      makeUpright(-3.42),
      makeUpright(3.42)
    );
    scene.add(furniture);
    disposables.push(oakH, oakV, plankGeo, uprightGeo);

    const SHADOW_TEX = shadowTex();
    const CONTACT_TEX = contactTex();
    const CREASE_TEX = creaseTex();

    /* ---- Custom GLSL Coffret Lid & Wrapped Linen Box-Wall Shaders (zero book pages!) ---- */
    const BOARD_FN = `
      float board(vec2 t){
        vec2 c = t * 2.0 - 1.0;
        float bulge = (1.0 - c.x * c.x) * (1.0 - 0.55 * c.y * c.y);
        float e = clamp(min(min(t.x, 1.0 - t.x), min(t.y, 1.0 - t.y)) / uER, 0.0, 1.0);
        float roll = sqrt(max(1.0 - (1.0 - e) * (1.0 - e), 0.0));
        return uBow * bulge * roll - uChamf * (1.0 - roll);
      }
    `;

    const COVER_VS = `
      uniform float uBow, uChamf, uER, uW, uH;
      varying vec2 vUv; varying vec3 vT, vB2, vNf; varying vec3 vWV;
      ${BOARD_FN}
      void main(){
        vUv = uv;
        vec3 pos = position; pos.z += board(uv);
        mat3 M = mat3(modelMatrix);
        vT = normalize(M * vec3(1.0, 0.0, 0.0));
        vB2 = normalize(M * vec3(0.0, 1.0, 0.0));
        vNf = normalize(M * vec3(0.0, 0.0, 1.0));
        vec4 wp = modelMatrix * vec4(pos, 1.0);
        vWV = cameraPosition - wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `;

    const COVER_FS = `
      uniform sampler2D uTex; uniform float uSatin; uniform float uOpacity; uniform float uSeed;
      uniform float uBow, uChamf, uER, uW, uH;
      varying vec2 vUv; varying vec3 vT, vB2, vNf; varying vec3 vWV;
      ${BOARD_FN}
      float hash(vec2 p){ vec3 p3=fract(vec3(p.xyx)*vec3(0.1031,0.1030,0.0973));
        p3+=dot(p3,p3.yxz+33.33); return fract((p3.x+p3.y)*p3.z); }
      float vnoise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
      void main(){
        vec2 uv = clamp(vUv, 0.0008, 0.9992);
        vec4 tex = texture2D(uTex, uv);
        float d = 0.0016;
        float hx = (board(uv + vec2(d, 0.0)) - board(uv - vec2(d, 0.0))) / (2.0 * d * uW);
        float hy = (board(uv + vec2(0.0, d)) - board(uv - vec2(0.0, d))) / (2.0 * d * uH);
        vec2 q = uv * vec2(58.0, 78.0) + uSeed;
        float tooth = vnoise(q) * 0.6 + vnoise(q * 2.7) * 0.4;
        vec2 g2 = uv * 9.0 + uSeed;
        float n1 = vnoise(g2), e = 0.02;
        vec2 grain = vec2(vnoise(g2 + vec2(e, 0.0)) - n1, vnoise(g2 + vec2(0.0, e)) - n1) / e;
        vec3 N = normalize(vNf
          - vT * (hx + (grain.x * 0.0022 + (tooth - 0.5) * 0.009) * uSatin)
          - vB2 * (hy + (grain.y * 0.0022 + (tooth - 0.5) * 0.009) * uSatin));
        vec3 V = normalize(vWV);
        vec3 L = normalize(vec3(0.52, 0.70, 0.55));
        vec3 F = normalize(vec3(-0.35, -0.18, 0.92));
        float key = max(dot(N, L), 0.0);
        float fill = max(dot(N, F), 0.0);
        float shade = 0.72 + 0.32 * key + 0.14 * fill;
        vec3 col = tex.rgb * shade;
        vec3 Hv = normalize(L + V);
        float nh = max(dot(N, Hv), 0.0);
        col += vec3(pow(nh, 110.0) * 0.85 * uSatin);
        col += vec3(pow(nh, 14.0) * 0.045 * uSatin);
        float fres = pow(1.0 - max(dot(N, V), 0.0), 3.4);
        col += vec3(fres * 0.055 * uSatin);
        col += vec3((tooth - 0.5) * 0.010 * uSatin);
        gl_FragColor = vec4(min(col, vec3(1.0)), uOpacity);
        #include <colorspace_fragment>
      }
    `;

    /** Rigid Telescoping Box Wall Shader with Lid-Collar Seam Groove & Linen Texture */
    function makeBoxWallMat(wrapHex: string, trimHex: string, isPackStack: boolean) {
      return new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uColLid: { value: new THREE.Color(wrapHex) },
          uColBase: { value: new THREE.Color(trimHex) },
          uOpacity: { value: 0 },
          uHalfD: { value: K.boxD * 0.5 },
          uIsPack: { value: isPackStack ? 1.0 : 0.0 },
        },
        vertexShader: `
          varying vec3 vP; varying vec3 vNw; varying vec3 vWV;
          void main(){
            vP = position;
            vNw = normalize(mat3(modelMatrix) * normal);
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWV = cameraPosition - wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          uniform vec3 uColLid; uniform vec3 uColBase; uniform float uOpacity; uniform float uHalfD; uniform float uIsPack;
          varying vec3 vP; varying vec3 vNw; varying vec3 vWV;
          void main(){
            float zNorm = (vP.z / uHalfD) * 0.5 + 0.5; // 1.0 = front lid face, 0.0 = back base
            // Telescoping coffret lid seam at zNorm ~ 0.62, or bundled stationery cards for packs
            vec3 baseCol = mix(uColBase, uColLid, smoothstep(0.58, 0.63, zNorm));
            float seam = exp(-pow((zNorm - 0.60) / 0.035, 2.0));
            baseCol *= (1.0 - 0.42 * seam);
            if(uIsPack > 0.5){
              // Subtle stacked 600gsm cotton rag card edges on the bundle sides
              float stackLine = 0.5 + 0.5 * cos(vP.z * 95.0);
              baseCol *= mix(0.88, 1.04, stackLine);
            }
            vec3 N = normalize(vNw), V = normalize(vWV);
            vec3 L = normalize(vec3(0.52, 0.70, 0.55));
            vec3 F = normalize(vec3(-0.35, -0.18, 0.92));
            float shade = 0.68 + 0.34 * max(dot(N, L), 0.0) + 0.14 * max(dot(N, F), 0.0);
            shade *= 1.0 - 0.25 * max(-N.y, 0.0);
            vec3 col = baseCol * shade;
            col += baseCol * pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.10;
            gl_FragColor = vec4(min(col, vec3(1.0)), uOpacity);
            #include <colorspace_fragment>
          }
        `,
      });
    }

    /* ---- Custom GLSL Double-Faced Woven Silk Satin Ribbon Shader ---- */
    function makeSatinRibbonMat(ribbonHex: string, edgeShadow = 0.0) {
      const baseCol = new THREE.Color(ribbonHex);
      const isPale = isLightColor(ribbonHex);
      const sheenCol = isPale ? new THREE.Color('#FFFFFF') : new THREE.Color('#F3BFD1');
      return new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
          uCol: { value: baseCol },
          uSheenCol: { value: sheenCol },
          uOpacity: { value: 0 },
          uIsPale: { value: isPale ? 1.0 : 0.0 },
          uPinchAO: { value: edgeShadow },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNw;
          varying vec3 vT;
          varying vec3 vWV;
          void main(){
            vUv = uv;
            mat3 M = mat3(modelMatrix);
            vNw = normalize(M * normal);
            vec3 refUp = abs(vNw.y) > 0.92 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
            vT = normalize(cross(refUp, vNw));
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWV = cameraPosition - wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          uniform vec3 uCol;
          uniform vec3 uSheenCol;
          uniform float uOpacity;
          uniform float uIsPale;
          uniform float uPinchAO;
          varying vec2 vUv;
          varying vec3 vNw;
          varying vec3 vT;
          varying vec3 vWV;

          void main(){
            vec3 N = normalize(gl_FrontFacing ? vNw : -vNw);
            vec3 V = normalize(vWV);
            vec3 L = normalize(vec3(0.52, 0.70, 0.55));
            vec3 F = normalize(vec3(-0.35, -0.18, 0.92));

            // Fine woven silk weft threads + stitched selvedge edges
            float weft = sin(vUv.y * 260.0) * 0.5 + 0.5;
            float warp = sin(vUv.x * 180.0) * 0.5 + 0.5;
            float edgeDist = abs(vUv.x - 0.5) * 2.0; // 0 center, 1 edge
            float selvedge = smoothstep(0.84, 0.97, edgeDist);
            float selvedgeGroove = exp(-pow((edgeDist - 0.85) / 0.035, 2.0));

            // Subtle normal perturbation for silk weave & tucked selvedge border
            vec3 T = normalize(vT);
            vec3 B = normalize(cross(N, T));
            float nxPerturb = (warp - 0.5) * 0.05 + selvedgeGroove * sign(vUv.x - 0.5) * 0.24;
            float nyPerturb = (weft - 0.5) * 0.07;
            N = normalize(N + T * nxPerturb + B * nyPerturb);

            float ndl = max(dot(N, L), 0.0);
            float ndf = max(dot(N, F), 0.0);
            float ndv = max(dot(N, V), 0.0);

            // Soft fabric fold / pinch ambient occlusion near ends of loops (uPinchAO > 0)
            float endPinch = mix(1.0, 0.54 + 0.46 * smoothstep(0.0, 0.28, min(vUv.y, 1.0 - vUv.y)), uPinchAO);
            float edgeAO = 1.0 - selvedgeGroove * 0.20;

            float shade = (0.58 + 0.36 * ndl + 0.14 * ndf) * endPinch * edgeAO;
            vec3 col = uCol * shade;

            // Anisotropic silk satin sheen band (wider warm silk glow + crisp glaze highlight)
            vec3 H = normalize(L + V);
            float nh = max(dot(N, H), 0.0);
            float silkBroad = pow(nh, 10.0) * (uIsPale > 0.5 ? 0.18 : 0.26);
            float silkCore = pow(nh, 46.0) * (uIsPale > 0.5 ? 0.22 : 0.30);
            float silkGlaze = pow(nh, 120.0) * (uIsPale > 0.5 ? 0.16 : 0.12);

            // Velvet-like grazing fresnel sheen typical of woven silk satin
            float fres = pow(1.0 - ndv, 2.8) * (uIsPale > 0.5 ? 0.24 : 0.34);

            col += uSheenCol * (silkBroad + silkCore + fres);
            col += vec3(silkGlaze);
            col += uCol * selvedge * 0.09;
            col *= 0.97 + 0.03 * weft;

            gl_FragColor = vec4(min(col, vec3(1.0)), uOpacity);
            #include <colorspace_fragment>
          }
        `,
      });
    }

    function makeWaxSealMat(sealHex: string, isMetallic: boolean) {
      return new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uCol: { value: new THREE.Color(sealHex) },
          uOpacity: { value: 0 },
          uMetal: { value: isMetallic ? 1.0 : 0.0 },
        },
        vertexShader: `
          varying vec3 vP; varying vec3 vNw; varying vec3 vWV;
          void main(){
            vP = position;
            vNw = normalize(mat3(modelMatrix) * normal);
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWV = cameraPosition - wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          uniform vec3 uCol; uniform float uOpacity; uniform float uMetal;
          varying vec3 vP; varying vec3 vNw; varying vec3 vWV;
          void main(){
            vec3 N = normalize(vNw);
            vec3 V = normalize(vWV);
            vec3 L = normalize(vec3(0.52, 0.70, 0.55));
            vec3 F = normalize(vec3(-0.35, -0.18, 0.92));
            float r = length(vP.xz) / 0.095;
            float well = smoothstep(0.52, 0.72, r);
            float ndl = max(dot(N, L), 0.0);
            float ndf = max(dot(N, F), 0.0);
            float shade = (0.58 + 0.42 * ndl + 0.15 * ndf) * mix(0.84, 1.06, well);
            vec3 col = uCol * shade;
            vec3 H = normalize(L + V);
            float nh = max(dot(N, H), 0.0);
            float spec = pow(nh, mix(36.0, 22.0, uMetal)) * mix(0.28, 0.42, uMetal);
            float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.14;
            col += mix(vec3(0.95, 0.85, 0.88), uCol * 1.4, uMetal) * (spec + fres);
            gl_FragColor = vec4(min(col, vec3(1.0)), uOpacity);
            #include <colorspace_fragment>
          }
        `,
      });
    }

    function bowShadowTexture() {
      const S = 128;
      const c = makeCanvas(S, S);
      const g = c.getContext('2d')!;
      const gr = g.createRadialGradient(S * 0.52, S * 0.52, S * 0.06, S * 0.5, S * 0.5, S * 0.48);
      gr.addColorStop(0, 'rgba(18, 8, 12, 0.48)');
      gr.addColorStop(0.45, 'rgba(18, 8, 12, 0.22)');
      gr.addColorStop(1, 'rgba(18, 8, 12, 0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, S, S);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      disposables.push(t);
      return t;
    }

    /* ---- Sculpted Satin Ribbon Geometry Builders ---- */
    /** Smooth parallel-transport ribbon strip with camber, center fold crease, and optional bias-cut tip */
    function createSatinRibbonStrip(
      curve: THREE.Curve<THREE.Vector3>,
      segments: number,
      widthFn: (t: number) => number,
      thickness = 0.0055,
      creaseDepth = 0.0025,
      twistRad = 0,
      slantCut = 0,
      initNormal = new THREE.Vector3(0, 0, 1)
    ): THREE.BufferGeometry {
      const cols = 9;
      const ringSize = cols * 2;
      const positions: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];

      const tangent = new THREE.Vector3();
      const prevT = new THREE.Vector3();
      const normal = initNormal.clone().normalize();
      const side = new THREE.Vector3();
      const q = new THREE.Quaternion();

      curve.getTangentAt(0, prevT).normalize();
      normal.addScaledVector(prevT, -normal.dot(prevT)).normalize();
      if (normal.lengthSq() < 1e-5) normal.set(0, 1, 0);

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const p = curve.getPointAt(t);
        curve.getTangentAt(t, tangent).normalize();

        if (i > 0) {
          q.setFromUnitVectors(prevT, tangent);
          normal.applyQuaternion(q).normalize();
        }
        prevT.copy(tangent);

        if (twistRad !== 0) {
          q.setFromAxisAngle(tangent, (twistRad * (i === 0 ? 0 : 1)) / segments);
          normal.applyQuaternion(q).normalize();
        }

        side.crossVectors(tangent, normal).normalize();
        const halfW = widthFn(t) * 0.5;
        const pinch = 1.0 - Math.sin(t * Math.PI) * 0.55;

        for (let c = 0; c < cols; c++) {
          const u = c / (cols - 1);
          const wf = u * 2 - 1;
          const arch = (1 - wf * wf) * thickness * 0.45;
          const crease = -creaseDepth * Math.exp(-wf * wf * 7.0) * pinch;
          const endShift = slantCut !== 0 && t > 0.8 ? ((t - 0.8) / 0.2) * slantCut * wf * halfW : 0;
          positions.push(
            p.x + side.x * wf * halfW + normal.x * (thickness * 0.5 + arch + crease) + tangent.x * endShift,
            p.y + side.y * wf * halfW + normal.y * (thickness * 0.5 + arch + crease) + tangent.y * endShift,
            p.z + side.z * wf * halfW + normal.z * (thickness * 0.5 + arch + crease) + tangent.z * endShift
          );
          uvs.push(u, t);
        }
        for (let c = 0; c < cols; c++) {
          const u = 1 - c / (cols - 1);
          const wf = u * 2 - 1;
          const endShift = slantCut !== 0 && t > 0.8 ? ((t - 0.8) / 0.2) * slantCut * wf * halfW : 0;
          positions.push(
            p.x + side.x * wf * halfW - normal.x * (thickness * 0.5) + tangent.x * endShift,
            p.y + side.y * wf * halfW - normal.y * (thickness * 0.5) + tangent.y * endShift,
            p.z + side.z * wf * halfW - normal.z * (thickness * 0.5) + tangent.z * endShift
          );
          uvs.push(u, t);
        }
      }

      for (let i = 0; i < segments; i++) {
        const r0 = i * ringSize;
        const r1 = (i + 1) * ringSize;
        for (let j = 0; j < ringSize; j++) {
          const jn = (j + 1) % ringSize;
          indices.push(r0 + j, r0 + jn, r1 + jn, r0 + j, r1 + jn, r1 + j);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      return geo;
    }

    /** Exact flush-contoured ribbon loop hugging box lid, collar step, and base walls */
    function createContouredBoxStrapGeometry(
      axis: 'v' | 'h',
      width: number,
      hasCollar: boolean
    ): THREE.BufferGeometry {
      const span = (axis === 'v' ? K.boxH : K.boxW) * 0.5;
      const collarOut = hasCollar ? 0.019 : 0.002;
      const outerSpan = span + collarOut;
      const frontZ = (hasCollar ? K.boxD * 0.514 : K.boxD * 0.504) + 0.004;
      const colStepZ = K.boxD * 0.17;
      const backZ = -K.boxD * 0.506;
      const r = 0.012;

      // Build ordered 2D perimeter points (a = axis span coordinate, b = z depth)
      const pts2: [number, number][] = [];
      // Front face from -outerSpan to +outerSpan with gentle lid crown arch
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        const a = lerp(-outerSpan + r, outerSpan - r, u);
        const crown = K.bow * (1 - Math.pow(u * 2 - 1, 2)) * 0.85;
        pts2.push([a, frontZ + crown]);
      }
      // Top-right / top rounded corner
      for (let i = 1; i <= 4; i++) {
        const ang = (i / 4) * (Math.PI * 0.5);
        pts2.push([outerSpan - r + Math.sin(ang) * r, frontZ - r + Math.cos(ang) * r]);
      }
      if (hasCollar) {
        pts2.push([outerSpan, colStepZ + 0.005]);
        pts2.push([span + 0.002, colStepZ - 0.005]);
      }
      pts2.push([span + 0.002, backZ + r]);
      // Back corner
      for (let i = 1; i <= 4; i++) {
        const ang = Math.PI * 0.5 + (i / 4) * (Math.PI * 0.5);
        pts2.push([span + 0.002 - r + Math.sin(ang) * r, backZ + r + Math.cos(ang) * r]);
      }
      // Back face
      for (let i = 1; i < 6; i++) {
        pts2.push([lerp(span - r, -span + r, i / 6), backZ]);
      }
      // Bottom-back corner
      for (let i = 0; i <= 4; i++) {
        const ang = Math.PI + (i / 4) * (Math.PI * 0.5);
        pts2.push([-span - 0.002 + r + Math.sin(ang) * r, backZ + r + Math.cos(ang) * r]);
      }
      if (hasCollar) {
        pts2.push([-span - 0.002, colStepZ - 0.005]);
        pts2.push([-outerSpan, colStepZ + 0.005]);
      } else {
        pts2.push([-span - 0.002, frontZ - r]);
      }
      // Front-bottom rounded corner back to start
      for (let i = 1; i < 4; i++) {
        const ang = Math.PI * 1.5 + (i / 4) * (Math.PI * 0.5);
        pts2.push([-outerSpan + r + Math.sin(ang) * r, frontZ - r + Math.cos(ang) * r]);
      }

      const n = pts2.length;
      const cols = 7;
      const ringSize = cols * 2;
      const thickness = 0.0048;
      const positions: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];
      const halfW = width * 0.5;

      const pushCoord = (coordAlongWidth: number, aPos: number, zPos: number) => {
        if (axis === 'v') positions.push(coordAlongWidth, aPos, zPos);
        else positions.push(aPos, coordAlongWidth, zPos);
      };

      for (let i = 0; i <= n; i++) {
        const idx = i % n;
        const prev = pts2[(idx - 1 + n) % n];
        const curr = pts2[idx];
        const next = pts2[(idx + 1) % n];
        const da = next[0] - prev[0];
        const dz = next[1] - prev[1];
        const len = Math.hypot(da, dz) || 1;
        // Outward normal in (a, z) plane: front tangent (+da, 0) -> outward (+z) => na = -dz/len, nz = da/len
        const na = -dz / len;
        const nz = da / len;
        const vCoord = (i / n) * 4.0;

        for (let c = 0; c < cols; c++) {
          const u = c / (cols - 1);
          const wf = u * 2 - 1;
          const arch = (1 - wf * wf) * 0.0022;
          pushCoord(wf * halfW, curr[0] + na * (thickness + arch), curr[1] + nz * (thickness + arch));
          uvs.push(u, vCoord);
        }
        for (let c = 0; c < cols; c++) {
          const u = 1 - c / (cols - 1);
          const wf = u * 2 - 1;
          pushCoord(wf * halfW, curr[0] - na * 0.001, curr[1] - nz * 0.001);
          uvs.push(u, vCoord);
        }
      }

      for (let i = 0; i < n; i++) {
        const r0 = i * ringSize;
        const r1 = (i + 1) * ringSize;
        for (let j = 0; j < ringSize; j++) {
          const jn = (j + 1) % ringSize;
          if (axis === 'v') {
            indices.push(r0 + j, r0 + jn, r1 + jn, r0 + j, r1 + jn, r1 + j);
          } else {
            indices.push(r0 + j, r1 + jn, r0 + jn, r0 + j, r1 + j, r1 + jn);
          }
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      return geo;
    }

    /** Organic hand-stamped wax seal disk with undulating melted rim and raised signet lip */
    function createWaxSealGeometry(): THREE.BufferGeometry {
      const radialSegs = 36;
      const ringSegs = 6;
      const positions: number[] = [];
      const indices: number[] = [];

      // Center vertex
      positions.push(0, 0.009, 0);
      for (let r = 1; r <= ringSegs; r++) {
        const rn = r / ringSegs;
        for (let s = 0; s < radialSegs; s++) {
          const ang = (s / radialSegs) * TAU;
          const wobble =
            1 +
            0.065 * Math.sin(ang * 3 + 0.4) +
            0.045 * Math.cos(ang * 5 - 1.1) +
            0.025 * Math.sin(ang * 7);
          const rad = rn * 0.088 * (rn > 0.65 ? wobble : lerp(1, wobble, rn));
          // Sunken inner stamp well -> raised organic rim -> bevel down to surface
          let h = 0.009;
          if (rn > 0.56 && rn <= 0.84) {
            h = 0.009 + Math.sin(((rn - 0.56) / 0.28) * Math.PI) * 0.014;
          } else if (rn > 0.84) {
            h = lerp(0.011, 0.001, (rn - 0.84) / 0.16);
          }
          positions.push(Math.cos(ang) * rad, h, Math.sin(ang) * rad);
        }
      }

      // Inner fan
      for (let s = 0; s < radialSegs; s++) {
        const sNext = (s + 1) % radialSegs;
        indices.push(0, 1 + sNext, 1 + s);
      }
      // Concentric rings
      for (let r = 0; r < ringSegs - 1; r++) {
        const base0 = 1 + r * radialSegs;
        const base1 = 1 + (r + 1) * radialSegs;
        for (let s = 0; s < radialSegs; s++) {
          const sn = (s + 1) % radialSegs;
          indices.push(base0 + s, base0 + sn, base1 + sn, base0 + s, base1 + sn, base1 + s);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      return geo;
    }

    function makeCoverMat(tex: THREE.Texture, seed: number) {
      return new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTex: { value: tex },
          uOpacity: { value: 0 },
          uSatin: { value: 1.0 },
          uSeed: { value: seed },
          uBow: { value: K.bow },
          uChamf: { value: K.chamf },
          uER: { value: K.chamfR },
          uW: { value: K.boxW },
          uH: { value: K.boxH },
        },
        vertexShader: COVER_VS,
        fragmentShader: COVER_FS,
      });
    }

    /* ---- Shared Tactile Box & Sculpted Satin Ribbon Geometries ---- */
    const SZW = K.boxW;
    const SZH = K.boxH;
    const SZD = K.boxD;
    const bodyGeo = new THREE.BoxGeometry(SZW, SZH, SZD);
    const lidCollarGeo = new THREE.BoxGeometry(SZW + 0.036, SZH + 0.036, SZD * 0.34);
    const faceGeo = new THREE.PlaneGeometry(SZW + 0.028, SZH + 0.028, 36, 36);
    const backFaceGeo = new THREE.PlaneGeometry(SZW, SZH, 32, 32);
    const hitGeo = new THREE.PlaneGeometry(SZW * 1.1, SZH * 1.02);
    const wallShGeo = new THREE.PlaneGeometry(SZW * 1.38, SZH * 1.24);
    const csGeo = new THREE.PlaneGeometry(SZW * 1.34, 0.22);
    const creaseGeo = new THREE.PlaneGeometry(SZW, 0.05);
    const reflGeo = new THREE.PlaneGeometry(SZW, 0.62);

    // Flush-contoured ribbon wraps (box-with-collar vs pack-without-collar)
    const vStrapBoxGeo = createContouredBoxStrapGeometry('v', 0.056, true);
    const hStrapBoxGeo = createContouredBoxStrapGeometry('h', 0.056, true);
    const vStrapPackGeo = createContouredBoxStrapGeometry('v', 0.062, false);

    // Sculpted 4-ear satin bow loops + pinched center knot + draped bias-cut tails
    const bowOuterCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.0, 0.006),
      new THREE.Vector3(0.048, 0.034, 0.028),
      new THREE.Vector3(0.118, 0.056, 0.034),
      new THREE.Vector3(0.148, 0.022, 0.016),
      new THREE.Vector3(0.112, -0.028, 0.008),
      new THREE.Vector3(0.042, -0.016, 0.004),
      new THREE.Vector3(0.0, 0.0, 0.004),
    ]);
    const bowOuterGeo = createSatinRibbonStrip(
      bowOuterCurve,
      36,
      (t) => 0.018 + 0.048 * Math.sin(t * Math.PI),
      0.0045,
      0.0028,
      0.14,
      0,
      new THREE.Vector3(0, 0, 1)
    );

    const bowOuterLCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.0, 0.006),
      new THREE.Vector3(-0.048, 0.036, 0.028),
      new THREE.Vector3(-0.118, 0.058, 0.034),
      new THREE.Vector3(-0.148, 0.024, 0.016),
      new THREE.Vector3(-0.112, -0.026, 0.008),
      new THREE.Vector3(-0.042, -0.016, 0.004),
      new THREE.Vector3(0.0, 0.0, 0.004),
    ]);
    const bowOuterLGeo = createSatinRibbonStrip(
      bowOuterLCurve,
      36,
      (t) => 0.018 + 0.048 * Math.sin(t * Math.PI),
      0.0045,
      0.0028,
      -0.14,
      0,
      new THREE.Vector3(0, 0, 1)
    );

    const bowInnerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.002, 0.01),
      new THREE.Vector3(0.036, 0.024, 0.036),
      new THREE.Vector3(0.092, 0.036, 0.042),
      new THREE.Vector3(0.112, 0.006, 0.024),
      new THREE.Vector3(0.076, -0.024, 0.012),
      new THREE.Vector3(0.032, -0.012, 0.008),
      new THREE.Vector3(0.0, 0.0, 0.006),
    ]);
    const bowInnerGeo = createSatinRibbonStrip(
      bowInnerCurve,
      32,
      (t) => 0.016 + 0.038 * Math.sin(t * Math.PI),
      0.004,
      0.0024,
      -0.12,
      0,
      new THREE.Vector3(0, 0, 1)
    );

    const bowInnerLCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.002, 0.01),
      new THREE.Vector3(-0.036, 0.024, 0.036),
      new THREE.Vector3(-0.092, 0.036, 0.042),
      new THREE.Vector3(-0.112, 0.006, 0.024),
      new THREE.Vector3(-0.076, -0.024, 0.012),
      new THREE.Vector3(-0.032, -0.012, 0.008),
      new THREE.Vector3(0.0, 0.0, 0.006),
    ]);
    const bowInnerLGeo = createSatinRibbonStrip(
      bowInnerLCurve,
      32,
      (t) => 0.016 + 0.038 * Math.sin(t * Math.PI),
      0.004,
      0.0024,
      0.12,
      0,
      new THREE.Vector3(0, 0, 1)
    );

    const tailCurveLeft = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.004, -0.006, 0.01),
      new THREE.Vector3(-0.026, -0.068, 0.018),
      new THREE.Vector3(-0.062, -0.148, 0.01),
      new THREE.Vector3(-0.088, -0.228, 0.004),
    ]);
    const bowTailLGeo = createSatinRibbonStrip(
      tailCurveLeft,
      26,
      (t) => lerp(0.028, 0.056, Math.pow(t, 0.65)),
      0.004,
      0.0014,
      0.16,
      0.42,
      new THREE.Vector3(0, 0, 1)
    );

    const tailCurveRight = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.006, -0.006, 0.01),
      new THREE.Vector3(0.032, -0.062, 0.016),
      new THREE.Vector3(0.056, -0.132, 0.008),
      new THREE.Vector3(0.074, -0.195, 0.004),
    ]);
    const bowTailRGeo = createSatinRibbonStrip(
      tailCurveRight,
      24,
      (t) => lerp(0.028, 0.054, Math.pow(t, 0.65)),
      0.004,
      0.0014,
      -0.14,
      -0.42,
      new THREE.Vector3(0, 0, 1)
    );

    const knotWrapCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.018, -0.016, 0.002),
      new THREE.Vector3(-0.022, 0.0, 0.018),
      new THREE.Vector3(-0.014, 0.018, 0.026),
      new THREE.Vector3(0.014, 0.018, 0.026),
      new THREE.Vector3(0.022, 0.0, 0.018),
      new THREE.Vector3(0.018, -0.016, 0.002),
    ]);
    const bowKnotGeo = createSatinRibbonStrip(
      knotWrapCurve,
      18,
      (t) => 0.032 - 0.006 * Math.sin(t * Math.PI),
      0.005,
      0.002,
      0,
      0,
      new THREE.Vector3(0, 0, 1)
    );

    const bowShadowGeo = new THREE.PlaneGeometry(0.32, 0.34);
    const BOW_SHADOW_TEX = bowShadowTexture();
    const waxSealGeo = createWaxSealGeometry();

    disposables.push(
      bodyGeo,
      lidCollarGeo,
      faceGeo,
      backFaceGeo,
      hitGeo,
      wallShGeo,
      csGeo,
      creaseGeo,
      reflGeo,
      vStrapBoxGeo,
      hStrapBoxGeo,
      vStrapPackGeo,
      bowOuterGeo,
      bowOuterLGeo,
      bowInnerGeo,
      bowInnerLGeo,
      bowTailLGeo,
      bowTailRGeo,
      bowKnotGeo,
      bowShadowGeo,
      waxSealGeo
    );

    const mPos = (i: number, scroll: number): [number, number, number] => {
      const k = i - (scroll || 0);
      if (k >= 0) return [0, K.mY + k * K.mStepY, K.mZ0 - k * K.mStepZ];
      return [0, K.mY + k * 0.86, K.mZ0 - k * 0.14];
    };
    const slotX = (i: number) => (i - 2) * K.slot;

    interface BoxObj {
      data: ShelfItem;
      index: number;
      flipped: boolean;
      _lean: number;
      _yaw: number;
      _roll: number;
      rest: [number, number, number];
      restTilt: number;
      base: [number, number, number];
      basePos: [number, number, number];
      mFade: number;
      gRoot: THREE.Group;
      gHover: THREE.Group;
      gWob: THREE.Group;
      gTilt: THREE.Group;
      gScl: THREE.Group;
      body: THREE.Mesh;
      cover: THREE.Mesh;
      back: THREE.Mesh;
      coverTex: THREE.CanvasTexture;
      backTex: THREE.CanvasTexture;
      coverMat: THREE.ShaderMaterial;
      backMat: THREE.ShaderMaterial;
      wallMat: THREE.ShaderMaterial;
      faceBaseMat: THREE.MeshBasicMaterial;
      embellishShaders: THREE.ShaderMaterial[];
      bowShadowMat?: THREE.MeshBasicMaterial;
      hit: THREE.Mesh;
      wallSh: THREE.Mesh;
      cs: THREE.Mesh;
      crease: THREE.Mesh;
      refl: THREE.Mesh;
      reflMat: THREE.ShaderMaterial;
      tHover: Tw;
      tTilt: Tw;
      sWob: Spring;
      tActiveP: Tw;
      tActiveR: Tw;
      tScale: Tw;
      tRefl: Tw;
      tFade: Tw;
      tSeat: Tw;
      tFilter: Tw;
      refreshCover: () => void;
      loadBack: () => void;
    }

    function itemBasePos(b: { data: ShelfItem; index: number; _lean: number }): [number, number, number] {
      if (MOBILE) return mPos(b.index, 0);
      return [slotX(b.data.slot), K.shelfTop[b.data.shelf] + (SZH / 2) * Math.cos(b._lean), K.itemZ];
    }

    const items: BoxObj[] = [];

    SHELF_ITEMS.forEach((data, index) => {
      const rnd = mulberry(index * 7919 + 13);
      const _lean = K.lean + (rnd() - 0.5) * 0.065;
      const _yaw = K.yaw + (rnd() - 0.5) * 0.04;
      const _roll = (rnd() - 0.5) * 0.016;
      const rest: [number, number, number] = [_lean, _yaw, _roll];
      const restTilt = MOBILE ? K.mTilt : _lean;
      const base: [number, number, number] = [0, 0, 0.01];
      const basePos = itemBasePos({ data, index, _lean });

      const gRoot = new THREE.Group();
      gRoot.position.set(...basePos);
      const gHover = new THREE.Group();
      gHover.position.set(...base);
      const gWob = new THREE.Group();
      const gTilt = new THREE.Group();
      if (MOBILE) gTilt.rotation.set(K.mTilt, 0, 0);
      else gTilt.rotation.set(...rest);
      const gScl = new THREE.Group();
      gScl.scale.setScalar(0);
      gRoot.add(gHover);
      gHover.add(gWob);
      gWob.add(gTilt);
      gTilt.add(gScl);
      scene.add(gRoot);

      const coverCanvas = paintBoxLid(data, 512, 608);
      const coverTex = new THREE.CanvasTexture(coverCanvas);
      coverTex.colorSpace = THREE.SRGBColorSpace;
      coverTex.anisotropy = 8;

      const backCanvas = makeCanvas(512, 608);
      const backTex = new THREE.CanvasTexture(backCanvas);
      backTex.colorSpace = THREE.SRGBColorSpace;
      backTex.anisotropy = 8;

      let backReady = false;
      const loadBack = () => {
        if (backReady) return;
        backReady = true;
        const c = paintBoxUnderside(data, 512, 608);
        backTex.image = c;
        backTex.needsUpdate = true;
      };

      const refreshCover = () => {
        const c = paintBoxLid(data, 512, 608);
        coverTex.image = c;
        coverTex.needsUpdate = true;
        if (backReady) {
          backReady = false;
          loadBack();
        }
      };

      const seed = (index * 17.3) % 100;
      const coverMat = makeCoverMat(coverTex, seed);
      const backMat = makeCoverMat(backTex, seed + 41.7);
      const wallMat = makeBoxWallMat(
        data.wrapColor,
        data.trimHex,
        data.kind === 'stationery-pack'
      );
      const faceBaseMat = new THREE.MeshBasicMaterial({
        color: data.wrapColor,
        transparent: true,
        opacity: 0,
      });

      // Lower box tray
      const body = new THREE.Mesh(bodyGeo, [
        wallMat,
        wallMat,
        wallMat,
        wallMat,
        faceBaseMat,
        faceBaseMat,
      ]);
      gScl.add(body);

      // Overhanging telescoping coffret lid collar (on non-stationery boxes)
      if (data.kind !== 'stationery-pack') {
        const collar = new THREE.Mesh(lidCollarGeo, wallMat);
        collar.position.z = SZD * 0.34;
        gScl.add(collar);
      }

      // Front Lid Label Face (slightly forward when lid collar is present)
      const frontZ = data.kind !== 'stationery-pack' ? SZD * 0.514 : SZD * 0.504;
      const cover = new THREE.Mesh(
        data.kind !== 'stationery-pack' ? faceGeo : backFaceGeo,
        coverMat
      );
      cover.position.z = frontZ;
      gScl.add(cover);

      // Back Underside Detail Face
      const back = new THREE.Mesh(backFaceGeo, backMat);
      back.rotation.y = Math.PI;
      back.position.z = -SZD * 0.504;
      gScl.add(back);

      // Custom-Shaded Woven Silk Satin Straps, Sculpted 4-Loop Bows, Tails, & Stamped Wax Seals
      const strapMat = makeSatinRibbonMat(data.ribbonHex, 0.0);
      const bowLoopMat = makeSatinRibbonMat(data.ribbonHex, 1.0);
      const sealMat = makeWaxSealMat(
        data.kind === 'stationery-pack' ? '#161013' : '#C99B9E',
        data.kind !== 'stationery-pack'
      );
      const embellishShaders: THREE.ShaderMaterial[] = [strapMat, bowLoopMat, sealMat];
      let bowShadowMat: THREE.MeshBasicMaterial | undefined;
      disposables.push(strapMat, bowLoopMat, sealMat);

      const ribX = SZW * 0.37;
      const ribY = -SZH * 0.135;

      if (data.kind === 'parcel' || data.kind === 'coffret') {
        // Flush-contoured vertical & horizontal woven satin ribbon bands hugging lid + collar + sides
        const ribV = new THREE.Mesh(vStrapBoxGeo, strapMat);
        ribV.position.x = ribX;
        const ribH = new THREE.Mesh(hStrapBoxGeo, strapMat);
        ribH.position.y = ribY;
        gScl.add(ribV, ribH);

        // Soft ambient contact shadow right underneath the bow & tails
        bowShadowMat = new THREE.MeshBasicMaterial({
          map: BOW_SHADOW_TEX,
          transparent: true,
          depthWrite: false,
          opacity: 0,
        });
        disposables.push(bowShadowMat);
        const bowSh = new THREE.Mesh(bowShadowGeo, bowShadowMat);
        bowSh.position.set(ribX - 0.01, ribY - 0.04, frontZ + 0.005);
        gScl.add(bowSh);

        // Sculpted 4-loop pleated silk bow + pinched knot wrap + draped angled-cut tails
        const bowGroup = new THREE.Group();
        bowGroup.position.set(ribX, ribY, frontZ + 0.01);
        bowGroup.rotation.z = 0.08;

        const earOuterR = new THREE.Mesh(bowOuterGeo, bowLoopMat);
        const earOuterL = new THREE.Mesh(bowOuterLGeo, bowLoopMat);

        const earInnerR = new THREE.Mesh(bowInnerGeo, bowLoopMat);
        earInnerR.rotation.z = -0.34;
        const earInnerL = new THREE.Mesh(bowInnerLGeo, bowLoopMat);
        earInnerL.rotation.z = 0.32;

        const tailL = new THREE.Mesh(bowTailLGeo, bowLoopMat);
        const tailR = new THREE.Mesh(bowTailRGeo, bowLoopMat);
        const knot = new THREE.Mesh(bowKnotGeo, bowLoopMat);
        knot.rotation.z = Math.PI * 0.5;

        bowGroup.add(earOuterR, earOuterL, earInnerR, earInnerL, tailL, tailR, knot);
        gScl.add(bowGroup);
      } else if (data.kind === 'stationery-pack') {
        // Clean left vertical silk belly band + hand-stamped sealing-wax emblem on the V-flap
        const bellyV = new THREE.Mesh(vStrapPackGeo, strapMat);
        bellyV.position.x = -SZW * 0.37;
        gScl.add(bellyV);

        const sealDisc = new THREE.Mesh(waxSealGeo, sealMat);
        sealDisc.rotation.x = Math.PI / 2;
        sealDisc.position.set(0, SZH * 0.255, frontZ + 0.006);
        gScl.add(sealDisc);
      } else {
        // Pantry Box: Clean horizontal satin belly band across waist + stamped rose-wax emblem
        const bandH = new THREE.Mesh(hStrapBoxGeo, strapMat);
        bandH.position.y = ribY;
        gScl.add(bandH);

        const sealDisc = new THREE.Mesh(waxSealGeo, sealMat);
        sealDisc.rotation.x = Math.PI / 2;
        sealDisc.position.set(SZW * 0.32, ribY, frontZ + 0.01);
        gScl.add(sealDisc);
      }

      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hit = new THREE.Mesh(hitGeo, hitMat);
      hit.position.set(basePos[0], basePos[1], basePos[2] - 0.04);
      hit.rotation.x = MOBILE ? K.mTilt : _lean;
      hit.rotation.y = MOBILE ? 0 : _yaw;
      scene.add(hit);

      const wallShMat = new THREE.MeshBasicMaterial({
        map: SHADOW_TEX,
        transparent: true,
        depthWrite: false,
        opacity: 0,
      });
      const wallSh = new THREE.Mesh(wallShGeo, wallShMat);
      wallSh.position.set(basePos[0] - 0.09, basePos[1] - 0.04, K.wallZ + 0.008);
      wallSh.rotation.z = _roll;
      scene.add(wallSh);

      const footZ = K.itemZ + (SZH / 2) * Math.sin(-_lean);
      const csMat = new THREE.MeshBasicMaterial({
        map: CONTACT_TEX,
        transparent: true,
        depthWrite: false,
        opacity: 0,
      });
      const cs = new THREE.Mesh(csGeo, csMat);
      cs.rotation.x = -Math.PI / 2;
      cs.position.set(basePos[0], K.shelfTop[data.shelf] + 0.001, footZ + 0.025);
      scene.add(cs);

      const creaseMat = new THREE.MeshBasicMaterial({
        map: CREASE_TEX,
        transparent: true,
        depthWrite: false,
        opacity: 0,
      });
      const crease = new THREE.Mesh(creaseGeo, creaseMat);
      crease.rotation.x = -Math.PI / 2;
      crease.position.set(basePos[0], K.shelfTop[data.shelf] + 0.0011, footZ - 0.012);
      scene.add(crease);

      const reflMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uTex: { value: coverTex }, uOpacity: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          uniform sampler2D uTex; uniform float uOpacity; varying vec2 vUv;
          float hash(vec2 p){ vec3 p3=fract(vec3(p.xyx)*vec3(0.1031,0.1030,0.0973));
            p3+=dot(p3,p3.yxz+33.33); return fract((p3.x+p3.y)*p3.z); }
          void main(){
            float mappedY = mix(0.0, 0.22, 1.0 - vUv.y);
            float edge = min(min(smoothstep(0.0, 0.06, vUv.y), smoothstep(0.0, 0.12, 1.0 - vUv.y)),
                             min(smoothstep(0.0, 0.06, vUv.x), smoothstep(0.0, 0.06, 1.0 - vUv.x)));
            float b = 0.004 + 0.02 * (1.0 - edge);
            vec4 col = (texture2D(uTex, vec2(vUv.x + b, mappedY)) + texture2D(uTex, vec2(vUv.x - b, mappedY))
                      + texture2D(uTex, vec2(vUv.x, mappedY + b * 0.5)) + texture2D(uTex, vec2(vUv.x, mappedY - b * 0.5))) * 0.25;
            float fade = vUv.y * vUv.y * 1.7;
            float sp = hash(vUv * 220.0);
            gl_FragColor = vec4(col.rgb, uOpacity * fade * (1.0 - sp * 0.34) * edge);
            #include <colorspace_fragment>
          }
        `,
      });
      const refl = new THREE.Mesh(reflGeo, reflMat);
      refl.rotation.x = -Math.PI / 2;
      refl.position.set(basePos[0], K.shelfTop[data.shelf] + 0.0012, footZ + 0.24);
      scene.add(refl);

      disposables.push(
        coverTex,
        backTex,
        coverMat,
        backMat,
        wallMat,
        faceBaseMat,
        hitMat,
        wallShMat,
        csMat,
        creaseMat,
        reflMat
      );

      const boxObj: BoxObj = {
        data,
        index,
        flipped: false,
        _lean,
        _yaw,
        _roll,
        rest,
        restTilt,
        base,
        basePos,
        mFade: 1,
        gRoot,
        gHover,
        gWob,
        gTilt,
        gScl,
        body,
        cover,
        back,
        coverTex,
        backTex,
        coverMat,
        backMat,
        wallMat,
        faceBaseMat,
        embellishShaders,
        bowShadowMat,
        hit,
        wallSh,
        cs,
        crease,
        refl,
        reflMat,
        tHover: new Tw([...base]),
        tTilt: new Tw(MOBILE ? [K.mTilt, 0, 0] : [...rest]),
        sWob: new Spring([0, 0, 0], 80, 6, 1),
        tActiveP: new Tw([...basePos]),
        tActiveR: new Tw([0, 0, 0]),
        tScale: new Tw([0]),
        tRefl: new Tw([0.34]),
        tFade: new Tw([0]),
        tSeat: new Tw([1]),
        tFilter: new Tw([1]),
        refreshCover,
        loadBack,
      };
      hit.userData.item = boxObj;

      if (MOBILE) {
        wallSh.visible = false;
        cs.visible = false;
        crease.visible = false;
        refl.visible = false;
        gRoot.renderOrder = 100 - index;
      }

      items.push(boxObj);

      imagePromiseMap.get(data.image)?.then((im) => {
        if (im) {
          PLATE[data.id] = im;
          boxObj.refreshCover();
        }
      });
    });

    /* ---- Camera + Golden-Angle Bokeh Blur Pass ---- */
    let VW = stageEl.clientWidth || 1000;
    let VH = stageEl.clientHeight || 720;
    let DIST = 12;
    const ORB = { tx: 0, ty: 0, x: 0, y: 0 };
    const TGT = new THREE.Vector3();

    function mobileTargetY() {
      const tan = Math.tan((K.fov * Math.PI) / 360);
      const D = DIST - K.mZ0;
      const stackTop = K.mY + (items.length - 1) * K.mStepY + SZH * 0.5 * Math.cos(K.mTilt);
      return Math.max(K.mY + K.mDrop * D * tan, stackTop - 0.8 * D * tan);
    }

    const S: {
      anim: 'intro' | 'inactive' | 'animatingForward' | 'active' | 'animatingBackward';
      active: BoxObj | null;
      lifted: BoxObj | null;
    } = {
      anim: 'intro',
      active: null,
      lifted: null,
    };

    function applyCamera() {
      const damp = MOBILE ? 0 : S.active ? 0.42 : 1;
      const az = ORB.x * K.orbitAz * damp;
      const el = 0.0025 - ORB.y * K.orbitEl * damp;
      TGT.set(0, MOBILE ? mobileTargetY() : K.boundCY, 0);
      camera.position.set(
        TGT.x + Math.sin(az) * Math.cos(el) * DIST,
        TGT.y + Math.sin(el) * DIST,
        TGT.z + Math.cos(az) * Math.cos(el) * DIST
      );
      camera.lookAt(TGT);
    }

    function frameCamera() {
      const aspect = VW / Math.max(1, VH);
      const tan = Math.tan((K.fov * Math.PI) / 360);
      camera.aspect = aspect;
      if (MOBILE) {
        const a = clamp(aspect, 0.4, 0.95);
        DIST = (SZW * 0.5) / (K.mFill * tan * a) + K.mZ0;
        camera.near = Math.max(DIST - 9, 0.1);
        camera.far = DIST + 26;
      } else {
        const distV = K.boundY / (2 * tan);
        const distH = K.boundX / (2 * tan * aspect);
        let d = K.offset * Math.max(distV, distH);
        const projW = (VW * K.boundX) / (2 * d * tan * aspect);
        if (projW > K.maxWidthPx) d = (VW * K.boundX) / (2 * K.maxWidthPx * tan * aspect);
        DIST = d;
        const maxDim = Math.max(K.boundX, K.boundY);
        camera.near = Math.max(DIST - maxDim * 2 - 2, 0.1);
        camera.far = DIST + maxDim * 2 + 16;
      }
      applyCamera();
      camera.updateProjectionMatrix();
    }

    const rt = new THREE.WebGLRenderTarget(2, 2, {
      type: renderer.capabilities.isWebGL2 ? THREE.HalfFloatType : THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true,
      stencilBuffer: false,
      samples: isSoftwareGl || !renderer.capabilities.isWebGL2 ? 0 : 4,
    });
    disposables.push(rt);

    const NOISE_N = 128;
    const noiseData = new Uint8Array(NOISE_N * NOISE_N * 4);
    const nr = mulberry(4242);
    for (let i = 0; i < NOISE_N * NOISE_N; i++) {
      noiseData[i * 4] = (nr() * 255) | 0;
      noiseData[i * 4 + 1] = (nr() * 255) | 0;
      noiseData[i * 4 + 2] = (nr() * 255) | 0;
      noiseData[i * 4 + 3] = 255;
    }
    const noiseTex = new THREE.DataTexture(noiseData, NOISE_N, NOISE_N);
    noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;
    noiseTex.minFilter = noiseTex.magFilter = THREE.LinearFilter;
    noiseTex.needsUpdate = true;
    disposables.push(noiseTex);

    const passMat = new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        backgroundTexture: { value: rt.texture },
        noiseTexture: { value: noiseTex },
        noiseScale: { value: 6 },
        intensity: { value: 0 },
        ignoreBlur: { value: true },
        samples: { value: isSoftwareGl ? 12 : 28 },
        resolution: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
      fragmentShader: `
        uniform sampler2D backgroundTexture; uniform sampler2D noiseTexture;
        uniform float noiseScale; uniform float intensity; uniform bool ignoreBlur;
        uniform float samples; uniform vec2 resolution;
        varying vec2 vUv;
        const float pi = 3.14159265359;
        const float goldenAngle = pi * (3.0 - sqrt(5.0));
        vec4 goldenBlur(vec2 uv, sampler2D tex){
          float noise = texture2D(noiseTexture, uv * noiseScale).r;
          float angle = pi + (noise - 0.5) * 2.0 * pi * 2.0;
          vec2 polar = vec2(cos(angle), sin(angle));
          vec4 sum = vec4(0.0);
          vec2 a = vec2(1024.0) * vec2(1.0, resolution.x / resolution.y);
          for(int i = 1; i <= 32; i++){
            if(float(i) > samples) break;
            float r = intensity * sqrt(float(i) / samples);
            polar = vec2(polar.x * cos(goldenAngle) - polar.y * sin(goldenAngle),
                         polar.x * sin(goldenAngle) + polar.y * cos(goldenAngle));
            vec2 off = polar * r / a;
            sum += texture2D(tex, clamp(uv + off, vec2(0.002), vec2(0.998)));
          }
          return sum / samples;
        }
        void main(){
          if(ignoreBlur || intensity < 0.05){
            gl_FragColor = texture2D(backgroundTexture, vUv);
          } else {
            gl_FragColor = goldenBlur(vUv, backgroundTexture);
          }
        }
      `,
    });
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const quadScene = new THREE.Scene();
    quadScene.add(new THREE.Mesh(quadGeo, passMat));
    disposables.push(passMat, quadGeo);

    const blurTw = {
      i: new Tw([0]),
      n: new Tw([1]),
      _w: false,
    };

    /* ---- Torn-Paper Left Wash Overlay ---- */
    const wctx = washEl.getContext('2d')!;
    const WASH: {
      t: number;
      target: number;
      w: number;
      h: number;
      sheet: HTMLCanvasElement | null;
      travel: number;
      dirty: boolean;
    } = {
      t: 0,
      target: 0,
      w: 1,
      h: 1,
      sheet: null,
      travel: 1,
      dirty: true,
    };

    function buildSheet() {
      const w = WASH.w;
      const h = WASH.h;
      if (w < 8 || h < 8) return;
      const TW = Math.min(180, Math.round(w * 0.34));
      const X0 = Math.max(0, w - TW - 40);
      const a = buildTearBand(TW, h);
      const paper = tintBand(a, TW, h, 251, 236, 242, true);
      const dark = tintBand(a, TW, h, 42, 22, 30, false);

      const cv = makeCanvas(w, h);
      const g = cv.getContext('2d')!;
      const BL = 40;
      g.save();
      g.globalAlpha = 0.24;
      g.filter = `blur(${Math.round(h * 0.018)}px)`;
      g.fillStyle = '#2A161E';
      g.fillRect(-BL, 0, X0 + 14 + BL, h);
      g.drawImage(dark, X0 + 14, 0);
      g.restore();

      const pg = g.createLinearGradient(0, 0, w, 0);
      pg.addColorStop(0, 'rgb(253, 242, 246)');
      pg.addColorStop(0.74, 'rgb(251, 236, 242)');
      pg.addColorStop(1, 'rgb(247, 226, 234)');
      g.fillStyle = pg;
      g.fillRect(-BL, 0, X0 + 1 + BL, h);
      g.drawImage(paper, X0, 0);

      g.globalCompositeOperation = 'source-atop';
      const r = mulberry(913);
      for (let i = 0; i < 2000; i++) {
        const x = r() * w;
        const y = r() * h;
        const l = 2 + r() * 22;
        const ang = (r() - 0.5) * 0.5;
        g.strokeStyle =
          r() < 0.5
            ? `rgba(255,250,252,${0.03 + r() * 0.06})`
            : `rgba(158,59,88,${0.015 + r() * 0.035})`;
        g.lineWidth = r() < 0.85 ? 1 : 2;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(ang) * l, y + Math.sin(ang) * l);
        g.stroke();
      }
      g.globalCompositeOperation = 'source-over';
      WASH.sheet = cv;
      WASH.travel = X0 + TW + 54;
    }

    function washResize() {
      if (!washEl) return;
      const w = Math.max(1, washEl.clientWidth);
      const h = Math.max(1, washEl.clientHeight);
      washEl.width = w;
      washEl.height = h;
      WASH.w = w;
      WASH.h = h;
      buildSheet();
      WASH.dirty = true;
    }

    function drawWash() {
      const w = WASH.w;
      const h = WASH.h;
      const t = WASH.t;
      wctx.clearRect(0, 0, w, h);
      if (t <= 0.002 || !WASH.sheet) return;
      wctx.drawImage(WASH.sheet, -(1 - t) * WASH.travel, 0);
    }

    /* ---- Box / Pack State Transitions ---- */
    let NOW = performance.now();
    const ROT_AMP_X = 0.72;
    const ROT_AMP_Y = 0.42;
    const DRAG = { on: false, moved: 0, lx: 0, ly: 0 };
    const M = { scroll: 0, target: 0, index: 0 };

    function activeZ() {
      const camZ = camera.position.z;
      const fill = MOBILE ? 0.78 : 0.62;
      const halfH = (SZH * 0.5) / fill;
      const dv = halfH / Math.tan((K.fov * Math.PI) / 360);
      const halfW = (SZW * 0.5) / fill;
      const dh = halfW / (Math.tan((K.fov * Math.PI) / 360) * camera.aspect);
      return camZ - Math.max(dv, dh);
    }

    function setLayer(B: BoxObj, l: number) {
      B.gRoot.traverse((o) => o.layers.set(l));
    }

    function hoverIn(B: BoxObj, dur?: number) {
      const d = dur === undefined ? K.hoverLift : dur;
      B.tHover.start([B.base[0], B.base[1] + 0.085, B.base[2] + 0.085], d, NOW, easeOutQuart);
      B.tTilt.start([0, 0, 0], d, NOW, easeOutQuart);
      B.sWob.start([0, 0, 0]);
      B.tRefl.start([0], d * 0.45, NOW, easeOutQuart);
      B.loadBack();
    }

    function hoverOut(B: BoxObj) {
      const d = K.hoverDrop;
      B.tHover.start([...B.base], d, NOW, easeSettle);
      B.tTilt.start(MOBILE ? [B.restTilt, 0, 0] : [...B.rest], d, NOW, easeSettle, d * 0.22);
      B.tRefl.start([0.34], d, NOW, easeSettle);
      B.sWob.start([0, 0, 0]);
    }

    function dragReset() {
      const B = S.active;
      if (!B) return;
      B.tActiveR.start(
        [K.activeRot[0], K.activeRot[1] + (B.flipped ? Math.PI : 0), K.activeRot[2]],
        280,
        NOW,
        easeOutQuart
      );
    }

    function toActive(B: BoxObj) {
      S.anim = 'animatingForward';
      hoverIn(B);
      B.tSeat.start([0], K.activeDuration * 0.55, NOW, easeSettle, K.activeDuration * 0.12);
      const ay = MOBILE ? mobileTargetY() : K.boundCY - 0.02;
      B.tActiveP.start(
        [MOBILE ? 0 : K.activeX, ay, activeZ()],
        K.activeDuration,
        NOW,
        activeEase
      );
      B.tActiveR.start([...K.activeRot], K.activeDuration, NOW, activeEase);
      B.gRoot.renderOrder = 10;
      setLayer(B, LAY_FG);
      window.setTimeout(() => {
        if (S.active === B) {
          S.anim = 'active';
          setShowHint(!MOBILE);
        }
      }, K.activeDuration);
    }

    function toInactive(B: BoxObj) {
      S.anim = 'animatingBackward';
      B.flipped = false;
      setIsFlipped(false);
      setShowHint(false);
      B.tSeat.start([1], K.activeDuration * 0.62, NOW, easeSettle, K.activeDuration * 0.38);
      B.tHover.start([B.base[0], B.base[1] + 0.06, B.base[2]], K.activeDuration, NOW, easeOutQuart);
      B.tActiveP.start([...B.basePos], K.activeDuration, NOW, activeEase);
      B.tActiveR.start([0, 0, 0], K.activeDuration, NOW, activeEase);
      window.setTimeout(() => hoverOut(B), K.activeDuration);
      window.setTimeout(() => {
        S.anim = 'inactive';
        setLayer(B, LAY_BG);
        B.gRoot.renderOrder = MOBILE ? 100 - B.index : 0;
        if (S.lifted === B) S.lifted = null;
      }, K.activeDuration + 20);
    }

    function setActive(B: BoxObj) {
      if (S.anim === 'intro' || S.anim === 'animatingForward' || S.anim === 'animatingBackward') {
        return;
      }
      if (S.active === B) return;
      if (S.active) {
        toInactive(S.active);
        S.active = null;
        setSelectedItem(null);
        WASH.target = 0;
        return;
      }
      S.active = B;
      S.lifted = B;
      toActive(B);
      setSelectedItem(B.data);
      setIsFlipped(false);
      WASH.target = 1;
    }

    function clearActive() {
      if (!S.active) return;
      const B = S.active;
      S.active = null;
      setSelectedItem(null);
      setIsFlipped(false);
      WASH.target = 0;
      dragReset();
      toInactive(B);
    }

    function flipActive() {
      const B = S.active;
      if (!B || S.anim !== 'active') return;
      B.flipped = !B.flipped;
      setIsFlipped(B.flipped);
      B.loadBack();
      B.tActiveR.start(
        [K.activeRot[0], K.activeRot[1] + (B.flipped ? Math.PI : 0), K.activeRot[2]],
        K.activeDuration,
        NOW,
        activeEase
      );
    }

    function setLifted(B: BoxObj | null) {
      if (S.lifted === B) return;
      if (S.lifted && S.lifted !== S.active) hoverOut(S.lifted);
      S.lifted = B;
      if (B) hoverIn(B);
      setHoveredItem(B ? B.data : null);
    }

    actionsRef.current = {
      selectById: (id: string) => {
        const b = items.find((item) => item.data.id === id);
        if (!b) return;
        if (MOBILE) {
          M.target = b.index;
          setMobileIndex(b.index);
        }
        if (S.active === b) clearActive();
        else setActive(b);
      },
      clearActive,
      flipActive,
      hoverById: (id: string | null) => {
        if (MOBILE || S.anim !== 'inactive' || S.active) return;
        const b = id ? items.find((item) => item.data.id === id) ?? null : null;
        setLifted(b);
      },
      stepMobile: (delta: number) => {
        if (S.active) return;
        const next = clamp(Math.round(M.target + delta), 0, items.length - 1);
        M.target = next;
        setMobileIndex(next);
      },
    };

    /* ---- Pointer & Keyboard Interactions ---- */
    const ray = new THREE.Raycaster();
    ray.layers.enable(LAY_BG);
    ray.layers.enable(LAY_FG);
    const ptr = new THREE.Vector2();

    const getNormalizedCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        nx: ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
        ny: -((clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      const { nx, ny } = getNormalizedCoords(e.clientX, e.clientY);
      ORB.tx = clamp(nx, -1, 1);
      ORB.ty = clamp(ny, -1, 1);

      if (DRAG.on && S.active) {
        const dx = e.clientX - DRAG.lx;
        const dy = e.clientY - DRAG.ly;
        DRAG.lx = e.clientX;
        DRAG.ly = e.clientY;
        DRAG.moved += Math.hypot(dx, dy);
        if (DRAG.moved > 6) setShowHint(false);
        const s = 1 / Math.min(VW, VH);
        const r = S.active.tActiveR;
        const baseY = K.activeRot[1] + (S.active.flipped ? Math.PI : 0);
        r.v[1] = clamp(r.v[1] + dx * 3.1 * s, baseY - ROT_AMP_X, baseY + ROT_AMP_X);
        r.v[0] = clamp(r.v[0] + dy * 2.1 * s, K.activeRot[0] - ROT_AMP_Y, K.activeRot[0] + ROT_AMP_Y);
        r.d = 0;
        return;
      }

      if (MOBILE || S.active || S.anim !== 'inactive') {
        canvas.style.cursor = S.active ? 'grab' : 'default';
        return;
      }

      ptr.set(nx, ny);
      ray.setFromCamera(ptr, camera);
      const hits = ray.intersectObjects(
        items.map((b) => b.hit),
        false
      );
      const b = hits.length ? (hits[0].object.userData.item as BoxObj) : null;
      setLifted(b);
      canvas.style.cursor = b ? 'pointer' : 'default';
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target !== canvas) return;
      const { nx, ny } = getNormalizedCoords(e.clientX, e.clientY);
      ptr.set(nx, ny);
      ray.setFromCamera(ptr, camera);

      if (S.active) {
        const h = ray.intersectObject(S.active.body, false);
        if (h.length) {
          DRAG.on = true;
          DRAG.moved = 0;
          DRAG.lx = e.clientX;
          DRAG.ly = e.clientY;
          canvas.style.cursor = 'grabbing';
          try {
            canvas.setPointerCapture(e.pointerId);
          } catch {
            // ignore
          }
          e.preventDefault();
        } else {
          clearActive();
        }
        return;
      }

      const hits = ray.intersectObjects(
        items.map((b) => b.hit),
        false
      );
      if (hits.length) {
        setActive(MOBILE ? items[M.index] : (hits[0].object.userData.item as BoxObj));
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!DRAG.on) return;
      DRAG.on = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      canvas.style.cursor = 'grab';
      if (DRAG.moved < 10) {
        flipActive();
      } else {
        dragReset();
      }
    };

    const onPointerLeave = () => {
      ORB.tx = 0;
      ORB.ty = 0;
      if (!MOBILE && !S.active && S.anim === 'inactive') setLifted(null);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && S.active) clearActive();
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('keydown', onKeyDown);

    /* ---- Resize Observer & Mode Application ---- */
    function applyMode() {
      furniture.visible = !MOBILE;
      wall.visible = true;
      for (const B of items) {
        B.basePos = itemBasePos(B);
        B.restTilt = MOBILE ? K.mTilt : B._lean;
        if (B !== S.active) {
          B.tActiveP.set([...B.basePos]);
          B.tTilt.set(MOBILE ? [K.mTilt, 0, 0] : [...B.rest]);
          B.tHover.set([...B.base]);
        }
        B.hit.position.set(B.basePos[0], B.basePos[1], B.basePos[2] - 0.04);
        B.hit.rotation.x = MOBILE ? K.mTilt : B._lean;
        B.hit.rotation.y = MOBILE ? 0 : B._yaw;
        B.wallSh.visible = !MOBILE;
        B.cs.visible = !MOBILE;
        B.crease.visible = !MOBILE;
        B.refl.visible = !MOBILE;
        B.gRoot.renderOrder = MOBILE ? 100 - B.index : 0;
      }
      frameCamera();
    }

    function handleResize() {
      if (!stageEl) return;
      VW = Math.max(1, stageEl.clientWidth);
      VH = Math.max(1, stageEl.clientHeight);
      renderer.setSize(VW, VH, false);
      const pr = renderer.getPixelRatio();
      rt.setSize(Math.round(VW * pr), Math.round(VH * pr));
      passMat.uniforms.resolution.value.set(VW * pr, VH * pr);
      frameCamera();
      washResize();
    }

    const onMediaChange = (e: MediaQueryListEvent) => {
      MOBILE = e.matches;
      setIsMobile(MOBILE);
      applyMode();
    };
    MOBILE_Q.addEventListener('change', onMediaChange);

    const ro = new ResizeObserver(handleResize);
    ro.observe(stageEl);

    /* ---- Intro Sequence ---- */
    const wallFade = new Tw([0]);
    applyMode();
    handleResize();

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) {
          items.forEach((b) => b.refreshCover());
        }
      });
    }

    S.anim = 'intro';
    wallFade.start([1], K.introWallFade, NOW, easeOutQuart);
    items.forEach((B, i) => {
      B.tScale.set([1]);
      B.tHover.set([...B.base]);
      B.tTilt.set(MOBILE ? [B.restTilt, 0, 0] : [...B.rest]);
      B.tFade.set([0]);
      B.tFade.start([1], K.introFade, NOW, easeOutQuart, i * K.introStagger);
    });
    window.setTimeout(() => {
      if (S.anim === 'intro') S.anim = 'inactive';
      setStageReady(true);
    }, K.introWallFade + items.length * K.introStagger);

    /* ---- Main Render Loop ---- */
    let last = performance.now();
    let frameId = 0;
    let disposed = false;

    function renderFrame(now: number) {
      NOW = now;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const tg = WASH.target;
      const k2 = Math.min(1, dt * (tg > WASH.t ? 5.2 : 8.5));
      if (Math.abs(tg - WASH.t) > 0.0009 || WASH.dirty) {
        WASH.t += (tg - WASH.t) * k2;
        WASH.dirty = false;
        drawWash();
      }

      const camK = S.anim === 'intro' ? 1 : Math.min(1, dt * 3.4);
      ORB.x += (ORB.tx - ORB.x) * camK;
      ORB.y += (ORB.ty - ORB.y) * camK;
      applyCamera();

      wallFade.update(NOW);
      const wf = wallFade.v[0];
      wallMat.uniforms.uOpacity.value = wf;
      oakH.uniforms.uOpacity.value = wf;
      oakV.uniforms.uOpacity.value = wf;

      if (MOBILE && !S.active) {
        M.scroll += (M.target - M.scroll) * Math.min(1, dt * 9);
        const idx = clamp(Math.round(M.scroll), 0, items.length - 1);
        M.index = idx;
      }

      const catFilter = activeCategoryRef.current;

      for (const B of items) {
        if (MOBILE && B !== S.active && S.anim !== 'animatingBackward') {
          B.basePos = mPos(B.index, M.scroll);
          B.tActiveP.v[0] = B.basePos[0];
          B.tActiveP.v[1] = B.basePos[1];
          B.tActiveP.v[2] = B.basePos[2];
          B.tActiveP.d = 0;
          const u = clamp(M.scroll - B.index, 0, 1.6);
          B.tTilt.v[0] = lerp(K.mTilt, K.mFlat, smooth(Math.min(u, 1)));
          B.tTilt.d = 0;
          B.mFade = 1 - smooth(clamp((u - 0.28) / 0.5, 0, 1));
          B.gRoot.visible = B.mFade > 0.01 && B.index - M.scroll < 9.5;
        }

        const catMatch =
          catFilter === 'All Curios' || B.data.category === catFilter || B === S.active;
        const targetFilterOpacity = catMatch ? 1 : 0.26;
        B.tFilter.v[0] = lerp(B.tFilter.v[0], targetFilterOpacity, Math.min(1, dt * 8));

        B.tHover.update(NOW);
        B.tTilt.update(NOW);
        B.tActiveP.update(NOW);
        B.tActiveR.update(NOW);
        B.tScale.update(NOW);
        B.tRefl.update(NOW);
        B.tFade.update(NOW);
        B.tSeat.update(NOW);
        B.sWob.update(dt);

        B.gHover.position.set(B.tHover.v[0], B.tHover.v[1], B.tHover.v[2]);
        B.gTilt.rotation.set(B.tTilt.v[0], B.tTilt.v[1], B.tTilt.v[2]);
        B.gWob.rotation.set(B.sWob.v[0], B.sWob.v[1], B.sWob.v[2]);
        B.gRoot.position.set(B.tActiveP.v[0], B.tActiveP.v[1], B.tActiveP.v[2]);
        B.gRoot.rotation.set(B.tActiveR.v[0], B.tActiveR.v[1], B.tActiveR.v[2]);
        B.gScl.scale.setScalar(B.tScale.v[0]);

        const op =
          B.tFade.v[0] *
          wf *
          B.tFilter.v[0] *
          (MOBILE && B !== S.active ? B.mFade : 1);

        B.faceBaseMat.opacity = op;
        B.wallMat.uniforms.uOpacity.value = op;
        B.coverMat.uniforms.uOpacity.value = op;
        B.backMat.uniforms.uOpacity.value = op;
        for (let mIdx = 0; mIdx < B.embellishShaders.length; mIdx++) {
          B.embellishShaders[mIdx].uniforms.uOpacity.value = op;
        }
        if (B.bowShadowMat) {
          B.bowShadowMat.opacity = 0.72 * op;
        }

        if (!MOBILE) {
          const lift = B.tHover.v[1];
          const away = clamp((B.tHover.v[2] - B.base[2]) / 0.085, 0, 1);
          B.wallSh.position.x = B.basePos[0] - 0.09 - away * 0.05;
          B.wallSh.position.y = B.basePos[1] + lift - 0.04 + away * 0.02;
          B.wallSh.scale.setScalar((1 + away * 0.13) * (B.tScale.v[0] || 0.0001));
          const seat = B.tSeat.v[0];
          (B.wallSh.material as THREE.MeshBasicMaterial).opacity = (0.48 - away * 0.14) * op * seat;
          (B.cs.material as THREE.MeshBasicMaterial).opacity = 0.88 * (1 - away * 0.55) * op * seat;
          (B.crease.material as THREE.MeshBasicMaterial).opacity = 0.52 * (1 - away) * op * seat;
          B.reflMat.uniforms.uOpacity.value = B.tRefl.v[0] * op * seat;
          B.refl.position.z =
            K.itemZ + (SZH / 2) * Math.sin(-B._lean) + 0.24 + B.tHover.v[2] * 2;
        }
      }

      const wantBlur = S.anim === 'animatingForward' || S.anim === 'active';
      if (blurTw._w !== wantBlur) {
        blurTw._w = wantBlur;
        blurTw.i.start([wantBlur ? 16 : 0], 420, NOW, (t) => t, 80);
        blurTw.n.start([wantBlur ? 6 : 1], 380, NOW, (t) => t, 80);
      }
      blurTw.i.update(NOW);
      blurTw.n.update(NOW);

      const act =
        S.anim === 'animatingForward' || S.anim === 'active' || S.anim === 'animatingBackward';

      camera.layers.set(LAY_BG);
      renderer.setRenderTarget(rt);
      renderer.clear(true, true, false);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);

      passMat.uniforms.ignoreBlur.value = !act;
      passMat.uniforms.intensity.value = blurTw.i.v[0];
      passMat.uniforms.noiseScale.value = blurTw.n.v[0];
      renderer.clear(true, true, false);
      renderer.render(quadScene, quadCam);

      if (act) {
        renderer.clearDepth();
        camera.layers.set(LAY_FG);
        renderer.render(scene, camera);
      }
    }

    function tick(now: number) {
      if (disposed) return;
      if (stageVisible || S.anim === 'intro') {
        renderFrame(now);
      } else {
        last = now;
      }
      if (isSoftwareGl) {
        frameId = window.setTimeout(() => tick(performance.now()), 70);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      MOBILE_Q.removeEventListener('change', onMediaChange);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('keydown', onKeyDown);
      disposables.forEach((dItem) => dItem.dispose());
      renderer.dispose();
    };
  }, []);

  const mobileItem = SHELF_ITEMS[mobileIndex] ?? SHELF_ITEMS[0];

  return (
    <div
      ref={stageRef}
      className="relative w-full h-[610px] sm:h-[670px] lg:h-[740px] rounded-3xl overflow-hidden border border-[#E9C4D1] bg-[#F6DDE6] shadow-atelier-rest select-none"
    >
      {/* Interactive 3D Coffret & Parcel Shelf WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block touch-pan-y"
        aria-label="Interactive 3D Maison Confection coffret and curio parcel display"
      />

      {/* Torn Blush-Cotton Paper Slide-In Sheet */}
      <canvas
        ref={washRef}
        aria-hidden="true"
        className="hidden md:block pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-[min(600px,56%)] h-full"
      />

      {/* Desktop Left Editorial Detail Reveal on Coffret Focus */}
      <div
        className={`hidden md:flex flex-col justify-center absolute left-0 top-0 bottom-0 z-20 w-[min(480px,48%)] pl-10 lg:pl-14 pr-12 transition-opacity duration-300 ${
          selectedItem ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {selectedItem && (
          <div className="max-w-[330px] space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9E3B58] tabular-nums">
              {selectedItem.category} · {selectedItem.specTag} · ${selectedItem.price}
            </p>
            <h3 className="font-serif-editorial text-3xl lg:text-[40px] font-semibold leading-[1.08] text-[#161013]">
              {selectedItem.title}
            </h3>
            <p className="text-sm lg:text-[15px] leading-relaxed text-[#4D343E]">
              {selectedItem.blurb}
            </p>

            {activeProduct?.craftNotes?.[0] && (
              <p className="text-xs font-medium text-[#6E4E5A] border-t border-[#E9C4D1] pt-3">
                {activeProduct.craftNotes[0]}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => actionsRef.current?.flipActive()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FFF9FB] hover:bg-white text-[#161013] border border-[#E9C4D1] text-xs font-bold shadow-atelier-rest cursor-pointer transition-transform duration-150 hover:-translate-y-0.5"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#9E3B58]" />
                <span>{isFlipped ? 'Show front' : 'Inspect underside'}</span>
              </button>

              {activeProduct && (
                <>
                  <button
                    type="button"
                    onClick={() => onQuickAdd(activeProduct)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#161013] hover:bg-[#2B1C22] text-[#FDF2F5] text-xs font-bold bevel-letterpress cursor-pointer transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#F4C2D2]" />
                    <span>Add · ${selectedItem.price}</span>
                  </button>

                  {activeProduct.personalizable && (
                    <button
                      type="button"
                      onClick={() => onQuickPersonalize(activeProduct)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#F9E4EB] hover:bg-[#FFF9FB] text-[#161013] border border-[#161013]/20 text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#9E3B58]" />
                      <span>Personalize</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectProduct(activeProduct)}
                    className="text-xs font-bold text-[#6E4E5A] hover:text-[#161013] underline underline-offset-4 px-1 py-1 cursor-pointer"
                  >
                    Full specs
                  </button>
                </>
              )}

              <button
                type="button"
                aria-label="Close parcel inspection"
                onClick={() => actionsRef.current?.clearActive()}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FFF9FB]/90 hover:bg-white text-[#161013] border border-[#E9C4D1] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Interactive Drag Hint Pill */}
      <div
        className={`hidden md:flex items-center gap-2 pointer-events-none absolute top-5 right-6 z-20 px-4 py-2 rounded-full bg-[#FFF9FB]/95 border border-[#E9C4D1] text-xs font-semibold text-[#161013] shadow-atelier-rest transition-opacity duration-300 ${
          selectedItem && showHint ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span>Drag box to rotate · Tap to turn</span>
      </div>

      {/* Subtle Hover Prompt Badge (Desktop Idle) */}
      {!selectedItem && stageReady && (
        <div className="hidden md:flex items-center justify-between pointer-events-none absolute top-4 inset-x-6 z-10 text-xs font-semibold text-[#6E4E5A]">
          <span>
            {hoveredItem
              ? `${hoveredItem.title} · $${hoveredItem.price} — Click to unbox & inspect`
              : 'Hover any coffret or parcel to lift · Click to inspect & turn'}
          </span>
          <span className="tabular-nums text-[#9E3B58] font-bold">
            10 Curated Boxes & Packs
          </span>
        </div>
      )}

      {/* Desktop Bottom Catalogue Rail */}
      <div
        className={`hidden md:block absolute inset-x-0 bottom-0 z-20 pt-8 pb-3.5 px-5 bg-gradient-to-t from-[#F6DDE6]/95 via-[#F6DDE6]/78 to-transparent border-t border-[#E9C4D1]/50 transition-opacity duration-300 ${
          selectedItem ? 'opacity-40 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-between gap-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SHELF_ITEMS.map((item) => {
            const isMatch =
              activeCategory === 'All Curios' || item.category === activeCategory;
            const isSelected = selectedItem?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onPointerEnter={() => actionsRef.current?.hoverById(item.id)}
                onPointerLeave={() => actionsRef.current?.hoverById(null)}
                onClick={() => actionsRef.current?.selectById(item.id)}
                className={`group flex items-center gap-2.5 text-left px-2.5 py-1.5 rounded-xl shrink-0 cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#161013] text-[#FDF2F5] shadow-atelier-rest'
                    : isMatch
                    ? 'hover:bg-[#FFF9FB]/85 text-[#161013]'
                    : 'opacity-40 hover:opacity-80 text-[#6E4E5A]'
                }`}
              >
                <img
                  src={item.image}
                  alt=""
                  className="w-8 h-9 rounded-md object-cover border border-[#E9C4D1]/70 shrink-0 transition-transform duration-200 group-hover:scale-105"
                />
                <div className="min-w-0">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider tabular-nums ${
                      isSelected ? 'text-[#F4C2D2]' : 'text-[#9E3B58]'
                    }`}
                  >
                    {item.specTag} · ${item.price}
                  </p>
                  <p className="text-xs font-semibold truncate max-w-[116px]">
                    {item.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Control Bar & Stack Navigation */}
      <div className="md:hidden absolute inset-x-0 bottom-0 z-20 p-4 pt-12 bg-gradient-to-t from-[#F6DDE6] via-[#F6DDE6]/92 to-transparent">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E3B58] tabular-nums">
              {mobileItem.specTag} · ${mobileItem.price}
            </p>
            <h3 className="font-serif-editorial text-xl font-semibold text-[#161013] truncate">
              {mobileItem.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              aria-label="Previous coffret"
              onClick={() => actionsRef.current?.stepMobile(-1)}
              className="w-9 h-9 rounded-full bg-[#FFF9FB] border border-[#E9C4D1] flex items-center justify-center text-[#161013] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Next coffret"
              onClick={() => actionsRef.current?.stepMobile(1)}
              className="w-9 h-9 rounded-full bg-[#FFF9FB] border border-[#E9C4D1] flex items-center justify-center text-[#161013] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (selectedItem?.id === mobileItem.id) {
                actionsRef.current?.flipActive();
              } else {
                actionsRef.current?.selectById(mobileItem.id);
              }
            }}
            className="flex-1 py-2.5 px-3 rounded-full bg-[#FFF9FB] border border-[#E9C4D1] text-xs font-bold text-[#161013] cursor-pointer"
          >
            {selectedItem?.id === mobileItem.id ? 'Turn Pack' : 'Inspect Box'}
          </button>

          {selectedItem && (
            <button
              type="button"
              aria-label="Close pack inspection"
              onClick={() => actionsRef.current?.clearActive()}
              className="w-10 h-10 rounded-full bg-[#FFF9FB] border border-[#E9C4D1] flex items-center justify-center text-[#161013] shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {productMap.get(mobileItem.productId) && (
            <button
              type="button"
              onClick={() => onQuickAdd(productMap.get(mobileItem.productId)!)}
              className="flex-1 py-2.5 px-3 rounded-full bg-[#161013] text-[#FDF2F5] text-xs font-bold cursor-pointer"
            >
              Add · ${mobileItem.price}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
