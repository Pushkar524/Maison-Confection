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
  'Best Seller': 'bg-[#161013] text-[#FDF2F5]',
  'Custom Monogram': 'bg-[#F4C2D2] text-[#161013]',
  'Limited Edition': 'bg-[#3B1D28] text-[#FDF2F5]',
  Handcrafted: 'bg-[#F9E4EB] text-[#161013] border border-[#E9C4D1]',
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
    <article className="group flex flex-col bg-[#FFF9FB] border border-[#E9C4D1] rounded-2xl overflow-hidden bevel-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-atelier-hover">
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
            className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap ${
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
          className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full bg-[#FFF9FB]/95 border border-[#E9C4D1] flex items-center justify-center text-[#161013] hover:text-[#9E3B58] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161013]"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-[#161013] text-[#161013]' : ''
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
              className="w-full py-2 px-4 rounded-full bg-[#161013] text-[#FDF2F5] text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-atelier-rest hover:bg-[#2B1C22] cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5 text-[#F4C2D2]" />
              <span>Quick Personalize</span>
            </button>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5 md:p-6">
        <div className="flex items-center gap-2 text-xs text-[#6E4E5A] mb-1.5">
          <span>{product.category}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{product.occasion}</span>
        </div>

        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161013] rounded"
        >
          <h3 className="font-serif-editorial text-[22px] leading-snug font-semibold text-[#161013] group-hover:text-[#9E3B58] transition-colors">
            {product.title}
          </h3>
        </button>

        <p className="mt-1.5 text-sm text-[#6E4E5A] line-clamp-2 flex-1">
          {product.subtitle}
        </p>

        <div className="mt-5 pt-4 border-t border-[#E9C4D1] flex items-center justify-between gap-3">
          <span className="text-lg font-bold text-[#161013] tabular-nums">
            ${product.price.toFixed(0)}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onQuickPersonalize(product)}
              className="md:hidden px-3 py-2 rounded-full bg-[#F9E4EB] border border-[#E9C4D1] text-xs font-bold text-[#161013] whitespace-nowrap cursor-pointer"
            >
              Personalize
            </button>
            <button
              type="button"
              onClick={() => onQuickAdd(product)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F9E4EB] hover:bg-[#161013] text-[#161013] hover:text-[#FDF2F5] border border-[#E9C4D1] hover:border-[#161013] text-xs font-bold whitespace-nowrap cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161013]"
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
