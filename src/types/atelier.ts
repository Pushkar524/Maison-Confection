export type ScreenView = 'home' | 'collections' | 'bespoke-box' | 'stationery';

export type ProductCategory =
  | 'All Curios'
  | 'Confection Boxes'
  | 'Event Stationery'
  | 'Tea & Pantry';

export type FoilFinish = 'Champagne Gold' | 'Rose Gold' | 'Blind Deboss' | 'Crimson Ink';

export interface ProductEdition {
  id: string;
  label: string;
  priceDelta: number;
  detail: string;
}

export interface AtelierProduct {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<ProductCategory, 'All Curios'>;
  occasion: string;
  price: number;
  image: string;
  backdropTint: string;
  tag?: 'Best Seller' | 'Limited Edition' | 'Custom Monogram' | 'Handcrafted';
  description: string;
  craftNotes: string[];
  editions: ProductEdition[];
  personalizable: boolean;
}

export interface BoxVessel {
  id: string;
  name: string;
  material: string;
  price: number;
  outerHex: string;
  liningHex: string;
  capacity: number;
}

export interface BoxCurioAddon {
  id: string;
  name: string;
  category: string;
  weightOrCount: string;
  price: number;
  image: string;
  note: string;
}

export interface RibbonOption {
  id: string;
  name: string;
  hex: string;
  textHex: string;
}

export interface WaxSealOption {
  id: string;
  name: string;
  motif: string;
  hex: string;
}

export interface BagItemPersonalization {
  monogram?: string;
  foil?: FoilFinish;
  giftNote?: string;
  ribbonName?: string;
  waxSealName?: string;
  vesselName?: string;
  curioSummary?: string[];
  suiteDetails?: string;
}

export interface GiftBagItem {
  uid: string;
  productId: string;
  title: string;
  editionLabel: string;
  unitPrice: number;
  quantity: number;
  image: string;
  isCustomBox?: boolean;
  personalization?: BagItemPersonalization;
}

export interface StationerySuiteTemplate {
  id: string;
  name: string;
  subtitle: string;
  basePricePer25: number;
  defaultHeadline: string;
  defaultSubline: string;
  defaultDate: string;
  defaultVenue: string;
  defaultPaper: string;
  image: string;
}
