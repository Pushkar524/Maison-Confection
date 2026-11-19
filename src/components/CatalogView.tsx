import { ArrowLeft, Check, Heart, Minus, PenTool, Plus, Search, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ATELIER_PRODUCTS, FOIL_OPTIONS } from '../data/atelierData';
import {
  AtelierProduct,
  FoilFinish,
  GiftBagItem,
  ProductCategory,
} from '../types/atelier';
import { ProductCard } from './ProductCard';
import { ResilientImage } from './ResilientImage';

interface CatalogViewProps {
  selectedProduct: AtelierProduct | null;
  onSelectProduct: (product: AtelierProduct | null) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onQuickPersonalize: (product: AtelierProduct) => void;
  onQuickAdd: (product: AtelierProduct) => void;
  onAddConfiguredItem: (item: GiftBagItem) => void;
}

const CATEGORIES: ProductCategory[] = [
  'All Curios',
  'Confection Boxes',
  'Event Stationery',
  'Tea & Pantry',
];

type SortOption = 'featured' | 'price-asc' | 'price-desc';

export function CatalogView({
  selectedProduct,
  onSelectProduct,
  favorites,
  onToggleFavorite,
  onQuickPersonalize,
  onQuickAdd,
  onAddConfiguredItem,
}: CatalogViewProps) {
  const [category, setCategory] = useState<ProductCategory>('All Curios');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // PDP configuration state
  const [editionId, setEditionId] = useState<string>('');
  const [foil, setFoil] = useState<FoilFinish>('Champagne Gold');
  const [monogram, setMonogram] = useState('');
  const [giftNote, setGiftNote] = useState('');
  const [quantity, setQuantity] = useState(1);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = ATELIER_PRODUCTS.filter((p) => {
      if (category !== 'All Curios' && p.category !== category) return false;
      if (onlyFavorites && !favorites.includes(p.id)) return false;
      if (
        query &&
        !p.title.toLowerCase().includes(query) &&
        !p.subtitle.toLowerCase().includes(query) &&
        !p.occasion.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [category, searchQuery, sortBy, onlyFavorites, favorites]);

  if (selectedProduct) {
    const activeEdition =
      selectedProduct.editions.find((e) => e.id === editionId) || selectedProduct.editions[0];
    const unitPrice = Math.max(12, selectedProduct.price + activeEdition.priceDelta);
    const isFav = favorites.includes(selectedProduct.id);

    const handleAddPDP = () => {
      onAddConfiguredItem({
        uid: `${selectedProduct.id}-${activeEdition.id}-${foil}-${monogram || 'plain'}-${Date.now()}`,
        productId: selectedProduct.id,
        title: selectedProduct.title,
        editionLabel: activeEdition.label,
        unitPrice,
        quantity,
        image: selectedProduct.image,
        personalization:
          monogram || giftNote
            ? {
                monogram: monogram.trim().toUpperCase() || undefined,
                foil,
                giftNote: giftNote.trim() || undefined,
              }
            : { foil },
      });
      setQuantity(1);
    };

    return (
      <section className="max-w-[1360px] mx-auto px-5 md:px-8 lg:px-12 pt-8 md:pt-12">
        <button
          type="button"
          onClick={() => {
            onSelectProduct(null);
            setEditionId('');
            setMonogram('');
            setGiftNote('');
            setQuantity(1);
          }}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#6E4E5A] hover:text-[#161013] mb-8 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Atelier Collections</span>
        </button>

        {/* Contiguous PDP Split: Sticky Gallery Left + Sticky Purchase Module Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Photography Stage */}
          <div className="lg:col-span-6 lg:sticky lg:top-28 space-y-5">
            <div
              className="aspect-[4/3] rounded-2xl overflow-hidden border border-[#E9C4D1] shadow-atelier-rest"
              style={{ backgroundColor: selectedProduct.backdropTint }}
            >
              <ResilientImage
                src={selectedProduct.image}
                alt={selectedProduct.title}
                fallbackTitle={selectedProduct.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-[#F9E4EB] border border-[#E9C4D1] rounded-2xl p-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#161013]">
                Atelier Craft Specifications
              </p>
              <ul className="space-y-2">
                {selectedProduct.craftNotes.map((note) => (
                  <li key={note} className="flex items-start gap-2.5 text-sm text-[#161013]">
                    <Check className="w-4 h-4 text-[#9E3B58] shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="lg:col-span-6 bg-[#FFF9FB] border border-[#E9C4D1] rounded-3xl p-6 sm:p-8 md:p-10 bevel-card space-y-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#6E4E5A] mb-2">
                  <span>{selectedProduct.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedProduct.occasion}</span>
                </div>
                <h1 className="font-serif-editorial text-3xl md:text-[38px] font-semibold text-[#161013] leading-tight">
                  {selectedProduct.title}
                </h1>
              </div>

              <button
                type="button"
                onClick={() => onToggleFavorite(selectedProduct.id)}
                aria-label={isFav ? 'Remove from saved curios' : 'Save to favorites'}
                className="w-11 h-11 rounded-full bg-[#F9E4EB] border border-[#E9C4D1] flex items-center justify-center text-[#161013] hover:border-[#161013] shrink-0 cursor-pointer transition-colors"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-[#9E3B58] text-[#9E3B58]' : ''}`} />
              </button>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#161013] tabular-nums">
                ${unitPrice.toFixed(0)}
              </span>
              <span className="text-sm text-[#6E4E5A]">{activeEdition.detail}</span>
            </div>

            <p className="text-[15px] leading-relaxed text-[#6E4E5A]">
              {selectedProduct.description}
            </p>

            {/* Edition Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#161013]">
                Select Edition
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedProduct.editions.map((ed) => {
                  const active = activeEdition.id === ed.id;
                  const edPrice = Math.max(12, selectedProduct.price + ed.priceDelta);
                  return (
                    <button
                      key={ed.id}
                      type="button"
                      onClick={() => setEditionId(ed.id)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#FDF2F5] border-[#161013] ring-4 ring-[#161013]/15'
                          : 'bg-[#F9E4EB]/60 border-[#E9C4D1] hover:border-[#161013]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[#161013]">{ed.label}</span>
                        <span className="text-sm font-bold text-[#9E3B58] tabular-nums">
                          ${edPrice}
                        </span>
                      </div>
                      <span className="text-xs text-[#6E4E5A] block mt-1">{ed.detail}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Foil & Monogram Personalization */}
            <div className="space-y-4 pt-2 border-t border-[#E9C4D1]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#161013] inline-flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#9E3B58]" />
                  <span>Complimentary Foil & Monogram</span>
                </span>
                <span className="text-xs text-[#6E4E5A]">Included</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {FOIL_OPTIONS.map((opt) => {
                  const selected = foil === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setFoil(opt.name)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selected
                          ? 'border-[#161013] bg-[#FDF2F5] ring-2 ring-[#161013]/20'
                          : 'border-[#E9C4D1] bg-[#FFF9FB] hover:border-[#161013]/50'
                      }`}
                    >
                      <span className={`block w-full h-5 rounded-md mb-1.5 ${opt.swatchClass}`} />
                      <span className="block text-[11px] font-bold text-[#161013] truncate">
                        {opt.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="pdp-monogram"
                    className="block text-xs font-semibold text-[#161013] mb-1.5"
                  >
                    Monogram (up to 4 chars)
                  </label>
                  <input
                    id="pdp-monogram"
                    type="text"
                    maxLength={4}
                    value={monogram}
                    onChange={(e) => setMonogram(e.target.value)}
                    placeholder="e.g. E&O"
                    className="w-full h-12 px-3.5 rounded-xl bg-[#FDF2F5] border border-[#E9C4D1] text-sm font-bold uppercase tracking-widest text-[#161013] placeholder:text-[#6E4E5A]/60 focus:outline-none focus:border-[#161013] focus:ring-4 focus:ring-[#161013]/15"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="pdp-note"
                    className="block text-xs font-semibold text-[#161013] mb-1.5"
                  >
                    Enclosed Calligraphy Card Message
                  </label>
                  <input
                    id="pdp-note"
                    type="text"
                    maxLength={120}
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Pour toi, with warmest wishes..."
                    className="w-full h-12 px-3.5 rounded-xl bg-[#FDF2F5] border border-[#E9C4D1] text-sm text-[#161013] placeholder:text-[#6E4E5A]/60 focus:outline-none focus:border-[#161013] focus:ring-4 focus:ring-[#161013]/15"
                  />
                </div>
              </div>
            </div>

            {/* Quantity Stepper + Primary Buy CTA */}
            <div className="pt-4 border-t border-[#E9C4D1] flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="inline-flex items-center justify-between sm:justify-start gap-3 px-3 py-2 rounded-full bg-[#F9E4EB] border border-[#E9C4D1]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-8 h-8 rounded-full bg-[#FFF9FB] border border-[#E9C4D1] flex items-center justify-center text-[#161013] hover:border-[#161013] cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="min-w-[28px] text-center text-sm font-bold text-[#161013] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-8 h-8 rounded-full bg-[#FFF9FB] border border-[#E9C4D1] flex items-center justify-center text-[#161013] hover:border-[#161013] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddPDP}
                className="flex-1 inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#161013] hover:bg-[#2B1C22] text-[#FDF2F5] text-sm font-bold whitespace-nowrap cursor-pointer bevel-letterpress transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#161013]"
              >
                <ShoppingBag className="w-4 h-4 text-[#F4C2D2]" />
                <span>
                  Add to Gift Bag — <span className="tabular-nums">${unitPrice * quantity}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1360px] mx-auto px-5 md:px-8 lg:px-12 pt-8 md:pt-12">
      <div className="mb-8 md:mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9E3B58] mb-2">
          Complete Atelier Archive
        </p>
        <h1 className="font-serif-editorial text-4xl md:text-[46px] font-semibold text-[#161013] leading-tight">
          Confections, Keepsakes & Event Paper
        </h1>
        <p className="mt-2 text-base text-[#6E4E5A] max-w-2xl">
          Filter by category, search occasions, or click any curio to customize foil monograms and
          editions.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#F9E4EB] border border-[#E9C4D1] rounded-2xl p-4 md:p-5 mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  active
                    ? 'bg-[#161013] text-[#FDF2F5] shadow-atelier-rest'
                    : 'bg-[#FFF9FB] text-[#6E4E5A] border border-[#E9C4D1] hover:text-[#161013]'
                }`}
              >
                {cat}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setOnlyFavorites((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              onlyFavorites
                ? 'bg-[#F4C2D2] text-[#161013] border border-[#161013]'
                : 'bg-[#FFF9FB] text-[#6E4E5A] border border-[#E9C4D1] hover:text-[#161013]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-[#161013] text-[#161013]' : ''}`} />
            <span>Saved ({favorites.length})</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6E4E5A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search macarons, honey, weddings..."
              aria-label="Search atelier products"
              className="w-full sm:w-64 h-11 pl-10 pr-4 rounded-xl bg-[#FFF9FB] border border-[#E9C4D1] text-sm text-[#161013] placeholder:text-[#6E4E5A] focus:outline-none focus:border-[#161013] focus:ring-4 focus:ring-[#161013]/15"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort products"
            className="h-11 px-4 rounded-xl bg-[#FFF9FB] border border-[#E9C4D1] text-sm font-semibold text-[#161013] focus:outline-none focus:border-[#161013] cursor-pointer"
          >
            <option value="featured">Sort: Atelier Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Results Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#FFF9FB] border border-[#E9C4D1] rounded-3xl p-12 text-center space-y-4">
          <p className="font-serif-editorial text-2xl font-semibold text-[#161013]">
            No curios matched your current selection
          </p>
          <p className="text-sm text-[#6E4E5A]">
            Clear your search or category filter to view all artisanal boxes and stationery.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('All Curios');
              setSearchQuery('');
              setOnlyFavorites(false);
            }}
            className="px-6 py-2.5 rounded-full bg-[#161013] text-[#FDF2F5] text-sm font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectProduct={onSelectProduct}
              onQuickPersonalize={onQuickPersonalize}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      )}
    </section>
  );
}
