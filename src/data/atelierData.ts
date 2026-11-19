import {
  AtelierProduct,
  BoxCurioAddon,
  BoxVessel,
  FoilFinish,
  RibbonOption,
  StationerySuiteTemplate,
  WaxSealOption,
} from '../types/atelier';

export const HERO_IMAGE = '/src/assets/images/hero_atelier_giftbox_1795102537857.jpg';

export const ATELIER_PRODUCTS: AtelierProduct[] = [
  {
    id: 'coffret-grand-bonbon',
    title: 'Grand Jardin Bonbon Coffret',
    subtitle: 'Single-origin praline, salted caramel & edible gold leaf',
    category: 'Confection Boxes',
    occasion: 'Celebration & Thank You',
    price: 78,
    image: '/src/assets/images/product_bonbon_coffret_1795102538021.jpg',
    backdropTint: '#F9E4EB',
    tag: 'Best Seller',
    description:
      'Sixteen hand-painted single-origin cacao bonbons paired with candied Amalfi citron dusted in 24k edible gold leaf, nested inside a keepsake silk-rose coffret.',
    craftNotes: [
      '70% Ecuadorian Criollo & Piedmont hazelnut praline',
      'Keepsake rigid blush linen box with noir grosgrain tie',
      'Optional foil-stamped lid monogram',
    ],
    editions: [
      { id: '16pc', label: '16-Piece Keepsake', priceDelta: 0, detail: '240g net · 4 flavors' },
      { id: '24pc', label: '24-Piece Grand Tier', priceDelta: 34, detail: '380g net · 6 flavors' },
    ],
    personalizable: true,
  },
  {
    id: 'atelier-macaron-ribbon',
    title: 'Fête du Jour Macaron Parcel',
    subtitle: 'Rosewater, Bronte pistachio & blood orange macarons',
    category: 'Confection Boxes',
    occasion: 'Birthdays & Bridal',
    price: 64,
    image: '/src/assets/images/product_macaron_ribbon_box_1795102538417.jpg',
    backdropTint: '#FDF2F5',
    tag: 'Handcrafted',
    description:
      'A pillowy blush linen keepsake cube bound in deep noir satin ribbon, cushioned with twelve crisp almond-flour macarons and a hand-lettered cotton gift tag.',
    craftNotes: [
      'Baked fresh each morning with organic almond flour',
      'Hand-tied double-faced satin ribbon',
      'Includes calligraphed cotton hang-tag',
    ],
    editions: [
      { id: '12pc', label: '12-Macaron Cube', priceDelta: 0, detail: 'With linen gift tag' },
      { id: '24pc', label: '24-Macaron Double', priceDelta: 42, detail: 'Two-tier ribbon box' },
    ],
    personalizable: true,
  },
  {
    id: 'cotton-rag-invitation-suite',
    title: 'Eliza & Oliver Letterpress Suite',
    subtitle: '600gsm deckle-edge cotton rag with blind deboss',
    category: 'Event Stationery',
    occasion: 'Weddings & Galas',
    price: 185,
    image: '/src/assets/images/product_stationery_suite_1795102538035.jpg',
    backdropTint: '#F9E4EB',
    tag: 'Custom Monogram',
    description:
      'Pressed on antique Heidelberg platens using 600gsm deckle-edge cotton rag. Complete with a scalloped RSVP card, hand-dyed silk ribbon, and brass-stamped wax seal.',
    craftNotes: [
      '600gsm handmade 100% cotton rag paper',
      'Deep blind deboss & bespoke couple crest',
      'Hand-poured champagne gold sealing wax',
    ],
    editions: [
      { id: 'sample', label: 'Curated Sample Pack', priceDelta: -165, detail: '3 physical proofs' },
      { id: '25', label: 'Suite of 25', priceDelta: 0, detail: 'Includes envelopes & seals' },
      { id: '50', label: 'Suite of 50', priceDelta: 145, detail: 'Includes guest addressing' },
    ],
    personalizable: true,
  },
  {
    id: 'wildflower-tea-honey-curio',
    title: 'Aurora Botanical Tea & Honey Duo',
    subtitle: 'Elderflower oolong caddy, raw wildflower honey & sugared violets',
    category: 'Tea & Pantry',
    occasion: 'Housewarming & Host',
    price: 56,
    image: '/src/assets/images/product_curio_tea_tin_1795102538911.jpg',
    backdropTint: '#FDF2F5',
    tag: 'Limited Edition',
    description:
      'An embossed apothecary tea tin filled with whole-blossom chamomile and elderflower oolong, paired with single-apiary wildflower honey, brass tasting spoon, and crystalized violet petals.',
    craftNotes: [
      '120g small-batch loose leaf botanical blend',
      '227g unfiltered Provence wildflower honey',
      'Scalloped vintage botanical apothecary label',
    ],
    editions: [
      { id: 'duo', label: 'Tea & Honey Duo', priceDelta: 0, detail: 'With brass tasting spoon' },
      { id: 'trio', label: 'Grand Pantry Trio', priceDelta: 28, detail: 'Adds 2 honey jars & violets' },
    ],
    personalizable: true,
  },
  {
    id: 'atelier-pour-toi-hamper',
    title: 'Pour Toi Unboxing Keepsake',
    subtitle: 'Silk-lined gift trunk with macarons, bonbons & wax-sealed note',
    category: 'Confection Boxes',
    occasion: 'Anniversaries & Milestones',
    price: 128,
    image: HERO_IMAGE,
    backdropTint: '#F9E4EB',
    tag: 'Best Seller',
    description:
      'Our signature multi-sensory unboxing ritual: a petal-rose silk-lined linen trunk holding pistachio macarons, gold-dusted truffles, dried chamomile sprigs, and a wax-sealed letterpress card.',
    craftNotes: [
      'Reusable linen & petal-rose satin presentation trunk',
      'Combines macarons, 9 gold-foiled bonbons & botanicals',
      'Custom calligraphy card sealed with botanical rose wax',
    ],
    editions: [
      { id: 'classic', label: 'Signature Trunk', priceDelta: 0, detail: '18 confections + card' },
      { id: 'grand', label: 'Atelier Reserve', priceDelta: 48, detail: 'Adds tea caddy & honey' },
    ],
    personalizable: true,
  },
  {
    id: 'scalloped-menu-placecards',
    title: 'Scalloped Soirée Menu & Place Cards',
    subtitle: 'Hand-torn cotton menus & ribbon-tied seating cards',
    category: 'Event Stationery',
    occasion: 'Dinner Parties & Weddings',
    price: 92,
    image: '/src/assets/images/product_stationery_suite_1795102538035.jpg',
    backdropTint: '#FDF2F5',
    tag: 'Custom Monogram',
    description:
      'Tailored table stationery crafted on heavy rose-tinted cotton stock with scalloped die-cut borders, custom course typography, and satin ribbon knots for unforgettable intimate dinners.',
    craftNotes: [
      'Die-cut scalloped borders on 450gsm cotton card',
      'Custom foil or letterpress menu typesetting',
      'Includes matching guest place cards',
    ],
    editions: [
      { id: '12', label: 'Table for 12', priceDelta: 0, detail: '12 menus + 12 place cards' },
      { id: '24', label: 'Table for 24', priceDelta: 65, detail: '24 menus + 24 place cards' },
    ],
    personalizable: true,
  },
];

export const BOX_VESSELS: BoxVessel[] = [
  {
    id: 'petal-linen',
    name: 'Porcelain Rose & Silk Lining',
    material: 'Woven blush linen · Pleated rose silk inset',
    price: 24,
    outerHex: '#FDF2F5',
    liningHex: '#F4C2D2',
    capacity: 6,
  },
  {
    id: 'noir-velvet',
    name: 'Obsidian Noir & Blush Silk',
    material: 'Matte noir bookcloth · Petal-pink silk bed',
    price: 34,
    outerHex: '#161013',
    liningHex: '#F4C2D2',
    capacity: 8,
  },
  {
    id: 'quartz-archive',
    name: 'Rose Quartz Keepsake Trunk',
    material: 'Powder rose suede wrap · Ivory moiré silk',
    price: 30,
    outerHex: '#F9E4EB',
    liningHex: '#FFF9FB',
    capacity: 8,
  },
  {
    id: 'plum-heritage',
    name: 'Velvet Plum & Champagne',
    material: 'Deep plum cotton wrap · Champagne satin bed',
    price: 32,
    outerHex: '#3B1D28',
    liningHex: '#F9E4EB',
    capacity: 8,
  },
];

export const BOX_CURIO_ADDONS: BoxCurioAddon[] = [
  {
    id: 'addon-macarons',
    name: 'Pistachio & Rosewater Macarons',
    category: 'Patisserie',
    weightOrCount: 'Box of 6',
    price: 22,
    image: '/src/assets/images/product_macaron_ribbon_box_1795102538417.jpg',
    note: 'Crisp almond shells with floral buttercream',
  },
  {
    id: 'addon-bonbons',
    name: 'Gold-Leaf Praline Bonbons',
    category: 'Chocolatier',
    weightOrCount: '8 Pieces',
    price: 28,
    image: '/src/assets/images/product_bonbon_coffret_1795102538021.jpg',
    note: 'Single-origin dark chocolate & hazelnut',
  },
  {
    id: 'addon-tea',
    name: 'Elderflower & Chamomile Caddy',
    category: 'Botanical Tea',
    weightOrCount: '120g Tin',
    price: 26,
    image: '/src/assets/images/product_curio_tea_tin_1795102538911.jpg',
    note: 'Embossed apothecary keepsake tin',
  },
  {
    id: 'addon-honey',
    name: 'Provence Wildflower Raw Honey',
    category: 'Pantry Curio',
    weightOrCount: '227g + Brass Spoon',
    price: 24,
    image: '/src/assets/images/product_curio_tea_tin_1795102538911.jpg',
    note: 'Unfiltered blossom honey with solid brass dipper',
  },
  {
    id: 'addon-violets',
    name: 'Crystalized Sugared Violet Petals',
    category: 'Confection',
    weightOrCount: '65g Apothecary Dish',
    price: 18,
    image: '/src/assets/images/product_curio_tea_tin_1795102538911.jpg',
    note: 'Hand-candied Toulouse violet blossoms',
  },
  {
    id: 'addon-seal-kit',
    name: 'Deckle Stationery & Wax Seal Set',
    category: 'Paper Atelier',
    weightOrCount: '4 Cards + Brass Stamp',
    price: 30,
    image: '/src/assets/images/product_stationery_suite_1795102538035.jpg',
    note: '600gsm cotton rag correspondence cards',
  },
];

export const RIBBON_OPTIONS: RibbonOption[] = [
  { id: 'obsidian-noir', name: 'Obsidian Noir Satin', hex: '#161013', textHex: '#FDF2F5' },
  { id: 'petal-rose', name: 'Petal Blush Silk', hex: '#F2B8CB', textHex: '#161013' },
  { id: 'deep-plum', name: 'Velvet Plum Grosgrain', hex: '#6E263D', textHex: '#FDF2F5' },
  { id: 'champagne-silk', name: 'Champagne Gold Satin', hex: '#D4B475', textHex: '#161013' },
];

export const WAX_SEAL_OPTIONS: WaxSealOption[] = [
  { id: 'rose-crest', name: 'Obsidian Noir Crest', motif: 'M', hex: '#161013' },
  { id: 'champagne-monogram', name: 'Champagne Gold Seal', motif: '✦', hex: '#C9A25E' },
  { id: 'rose-plum', name: 'Deep Rose Velvet', motif: 'R', hex: '#9E3B58' },
  { id: 'blush-olive', name: 'Porcelain Blush', motif: '❦', hex: '#E39BB2' },
];

export const FOIL_OPTIONS: { name: FoilFinish; swatchClass: string; textHex: string }[] = [
  {
    name: 'Champagne Gold',
    swatchClass: 'bg-gradient-to-br from-[#F3DFB2] via-[#C9A25E] to-[#987236]',
    textHex: '#8E6B2D',
  },
  {
    name: 'Rose Gold',
    swatchClass: 'bg-gradient-to-br from-[#FADCE6] via-[#E39BB2] to-[#B4627C]',
    textHex: '#9E3B58',
  },
  {
    name: 'Blind Deboss',
    swatchClass: 'bg-gradient-to-br from-[#FFF9FB] via-[#F9E4EB] to-[#E9C4D1]',
    textHex: '#6E4E5A',
  },
  {
    name: 'Crimson Ink',
    swatchClass: 'bg-gradient-to-br from-[#3A222C] via-[#161013] to-[#000000]',
    textHex: '#161013',
  },
];

export const STATIONERY_TEMPLATES: StationerySuiteTemplate[] = [
  {
    id: 'wedding-suite',
    name: 'The Heirloom Wedding Suite',
    subtitle: 'Main invitation, scalloped RSVP card & wax-sealed outer envelope',
    basePricePer25: 185,
    defaultHeadline: 'Eliza & Oliver',
    defaultSubline: 'Request the pleasure of your company at their autumn garden wedding',
    defaultDate: 'September 21 · Half Past Four',
    defaultVenue: 'Orangerie du Jardin, Lyon',
    defaultPaper: '600gsm Deckle-Edge Cotton Rag',
    image: '/src/assets/images/product_stationery_suite_1795102538035.jpg',
  },
  {
    id: 'soiree-menu',
    name: 'Candlelight Tasting Menu',
    subtitle: 'Scalloped dinner menu, silk ribbon knot & custom guest place card',
    basePricePer25: 120,
    defaultHeadline: 'La Fête d’Automne',
    defaultSubline: 'An intimate five-course tasting supper & cellar pairing',
    defaultDate: 'Saturday, October 14 · Eight O’Clock',
    defaultVenue: 'Atelier Courtyard Salon',
    defaultPaper: '450gsm Rose-Tinted Pressboard',
    image: '/src/assets/images/product_stationery_suite_1795102538035.jpg',
  },
  {
    id: 'jubilee-keepsake',
    name: 'Milestone Jubilee Announcement',
    subtitle: 'Foil-stamped keepsake card with hand-pressed botanical wax seal',
    basePricePer25: 145,
    defaultHeadline: 'Celebrating Thirty Years',
    defaultSubline: 'Champagne, petits fours, and afternoon chamber music on the terrace',
    defaultDate: 'Sunday, May 18 · Three O’Clock',
    defaultVenue: 'Villa Saint-Clair',
    defaultPaper: '600gsm Petal-Tinted Cotton',
    image: '/src/assets/images/product_stationery_suite_1795102538035.jpg',
  },
];

export const CLIENT_STORIES = [
  {
    quote:
      'Every guest kept their scalloped place card and noir-ribbon blush box long after dessert. The blind-debossed cotton paper felt unmistakably personal.',
    author: 'Claire Beaumont',
    role: 'Creative Director · Studio Beaumont, Paris',
    detail: '120 Custom Welcome Coffrets',
  },
  {
    quote:
      'Our anniversary clients received the Pour Toi trunk with obsidian wax seals within 48 hours. Three wrote back just to praise the unboxing ritual.',
    author: 'Julian Mercer',
    role: 'Partner · Mercer & Vale Hospitality',
    detail: '45 Bespoke Gift Trunks',
  },
];
