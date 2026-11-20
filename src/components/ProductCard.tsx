import { Heart, PenTool, Plus } from 'lucide-react';
import { AtelierProduct } from '../types/atelier';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: AtelierProduct;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectProduct: (product: AtelierProduct) => void;
  onQuickPersonalize: (product: AtelierProduct) => void;
  onQuickAdd: (product: AtelierProduct) => void;
}

const TAG_STYLE_MAP: Record<NonNullable<AtelierProduct['tag']>, string> = {
  'Best Seller': 'bg-gradient-to-r from-[#3A0E20] to-[#260814] text-[#FCE7EF] border border-[#8C2F52]',
  'Custom Monogram': 'bg-gradient-to-r from-[#E84F82] to-[#B81D52] text-[#FFF4F8]',
  'Limited Edition': 'bg-gradient-to-r from-[#6E0D2E] to-[#4A091F] text-[#FCE7EF] border border-[#B51649]/60',
  Handcrafted: 'bg-gradient-to-r from-[#FCE4EC] to-[#F5B8CD] text-[#240814]',
};

export function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
  onQuickPersonalize,
  onQuickAdd,
}: ProductCardProps) {
  return (
    <article className="group flex flex-col bg-gradient-to-b from-[#3A0F22] via-[#2F0B1B] to-[#250815] border border-[#6E2440] rounded-2xl overflow-hidden bevel-card transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9E3B5E] hover:shadow-atelier-hover">
      {/* Image Stage */}
      <div
        className="relative aspect-[4/3] overflow-hidden cursor-pointer"
        style={{ backgroundColor: product.backdropTint }}
        onClick={() => onSelectProduct(product)}
      >
        <ResilientImage
          src={product.image}
          alt={product.title}
          fallbackTitle={product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Single Luxury Tag */}
        {product.tag && (
          <span
            className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap shadow-sm ${
              TAG_STYLE_MAP[product.tag]
            }`}
          >
            {product.tag}
          </span>
        )}

        {/* Favorite Heart Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          aria-label={isFavorite ? `Remove ${product.title} from favorites` : `Save ${product.title} to favorites`}
          className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full bg-[#290916]/90 border border-[#7D2B4B] flex items-center justify-center text-[#FCE7EF] hover:text-[#FF8FB3] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB3]"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-[#FF6B9D] text-[#FF6B9D]' : ''
            }`}
          />
        </button>

        {/* Quick Personalize Hover Overlay */}
        {product.personalizable && (
          <div className="absolute inset-x-3.5 bottom-3.5 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus-within:opacity-100 transition-all duration-200">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickPersonalize(product);
              }}
              className="w-full py-2 px-4 rounded-full bg-gradient-to-r from-[#2D0A19]/95 to-[#1F0712]/95 border border-[#8C2F52] text-[#FCE7EF] text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-atelier-rest hover:from-[#E84F82] hover:to-[#B81D52] hover:text-[#FFF4F8] cursor-pointer transition-colors"
            >
              <PenTool className="w-3.5 h-3.5 text-[#FF8FB3]" />
              <span>Quick Personalize</span>
            </button>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5 md:p-6">
        <div className="flex items-center gap-2 text-xs text-[#D996AE] mb-1.5">
          <span>{product.category}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{product.occasion}</span>
        </div>

        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB3] rounded"
        >
          <h3 className="font-serif-editorial text-[22px] leading-snug font-semibold text-[#FFF0F5] group-hover:text-[#FF8FB3] transition-colors">
            {product.title}
          </h3>
        </button>

        <p className="mt-1.5 text-sm text-[#E8B4C6] line-clamp-2 flex-1">
          {product.subtitle}
        </p>

        <div className="mt-5 pt-4 border-t border-[#5E1D36] flex items-center justify-between gap-3">
          <span className="text-lg font-bold text-[#FFF0F5] tabular-nums">
            ${product.price.toFixed(0)}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onQuickPersonalize(product)}
              className="md:hidden px-3 py-2 rounded-full bg-[#3A0F22] border border-[#7D2B4B] text-xs font-bold text-[#FCE7EF] whitespace-nowrap cursor-pointer"
            >
              Personalize
            </button>
            <button
              type="button"
              onClick={() => onQuickAdd(product)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#451228] to-[#320C1C] hover:from-[#E84F82] hover:to-[#B81D52] text-[#FCE7EF] hover:text-[#FFF4F8] border border-[#8C2F52] hover:border-[#FF8FB3] text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB3]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
