import { PenTool, X } from 'lucide-react';
import { useState } from 'react';
import { FOIL_OPTIONS } from '../data/atelierData';
import { AtelierProduct, FoilFinish, GiftBagItem } from '../types/atelier';

interface QuickPersonalizeModalProps {
  product: AtelierProduct | null;
  onClose: () => void;
  onConfirm: (item: GiftBagItem) => void;
}

export function QuickPersonalizeModal({
  product,
  onClose,
  onConfirm,
}: QuickPersonalizeModalProps) {
  const [monogram, setMonogram] = useState('A&M');
  const [foil, setFoil] = useState<FoilFinish>('Champagne Gold');
  const [giftNote, setGiftNote] = useState('With warmest congratulations on your celebration.');

  if (!product) return null;

  const activeFoilMeta = FOIL_OPTIONS.find((f) => f.name === foil) || FOIL_OPTIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultEdition = product.editions[0];
    onConfirm({
      uid: `${product.id}-pers-${Date.now()}`,
      productId: product.id,
      title: product.title,
      editionLabel: defaultEdition.label,
      unitPrice: product.price + defaultEdition.priceDelta,
      quantity: 1,
      image: product.image,
      personalization: {
        monogram: monogram.trim().toUpperCase() || undefined,
        foil,
        giftNote: giftNote.trim() || undefined,
      },
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161013]/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-personalize-heading"
    >
      <div className="w-full max-w-2xl bg-[#FDF2F5] border border-[#E9C4D1] rounded-3xl shadow-atelier-modal overflow-hidden">
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#E9C4D1] bg-[#F9E4EB]">
          <div className="flex items-center gap-2.5">
            <PenTool className="w-4 h-4 text-[#9E3B58]" />
            <h2
              id="quick-personalize-heading"
              className="font-serif-editorial text-xl sm:text-2xl font-semibold text-[#161013]"
            >
              Personalize {product.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close personalization dialog"
            className="w-9 h-9 rounded-full bg-[#FFF9FB] border border-[#E9C4D1] flex items-center justify-center text-[#6E4E5A] hover:text-[#161013] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Scalloped Postage-Stamp Live Preview */}
          <div className="bg-[#F9E4EB] border border-[#E9C4D1] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="w-full max-w-md bg-[#FFF9FB] border-2 border-dashed border-[#D8A6B8] rounded-2xl p-6 shadow-atelier-rest stamp-card-surface">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6E4E5A] mb-2">
                600gsm Cotton Enclosure Card · {foil}
              </p>
              <div
                className="font-serif-editorial text-3xl font-semibold tracking-wider mb-3"
                style={{ color: activeFoilMeta.textHex }}
              >
                {monogram.trim().toUpperCase() || 'MC'}
              </div>
              <p className="font-serif-editorial italic text-base text-[#161013] leading-relaxed">
                “{giftNote.trim() || 'A small confection crafted just for you.'}”
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="modal-monogram"
                className="block text-xs font-bold uppercase tracking-wider text-[#161013] mb-2"
              >
                Monogram
              </label>
              <input
                id="modal-monogram"
                type="text"
                maxLength={4}
                value={monogram}
                onChange={(e) => setMonogram(e.target.value)}
                placeholder="A&M"
                className="w-full h-12 px-3.5 rounded-xl bg-[#FFF9FB] border border-[#E9C4D1] text-sm font-bold uppercase tracking-widest text-[#161013] focus:outline-none focus:border-[#161013] focus:ring-4 focus:ring-[#161013]/15"
              />
            </div>

            <div className="sm:col-span-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#161013] mb-2">
                Foil Stamp Finish
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FOIL_OPTIONS.map((opt) => {
                  const selected = foil === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setFoil(opt.name)}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        selected
                          ? 'border-[#161013] bg-[#FFF9FB] ring-2 ring-[#161013]/20'
                          : 'border-[#E9C4D1] bg-[#FFF9FB]/75 hover:bg-[#FFF9FB]'
                      }`}
                    >
                      <span className={`block w-full h-4 rounded mb-1 ${opt.swatchClass}`} />
                      <span className="block text-[11px] font-bold text-[#161013] truncate">
                        {opt.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="modal-note"
              className="block text-xs font-bold uppercase tracking-wider text-[#161013] mb-2"
            >
              Hand-Calligraphed Gift Message
            </label>
            <textarea
              id="modal-note"
              rows={2}
              maxLength={140}
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-[#FFF9FB] border border-[#E9C4D1] text-sm text-[#161013] focus:outline-none focus:border-[#161013] focus:ring-4 focus:ring-[#161013]/15"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-full bg-[#F9E4EB] border border-[#E9C4D1] text-sm font-bold text-[#6E4E5A] hover:text-[#161013] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-3 rounded-full bg-[#161013] hover:bg-[#2B1C22] text-[#FDF2F5] text-sm font-bold cursor-pointer bevel-letterpress transition-transform hover:scale-[1.02]"
            >
              Save & Add to Bag — <span className="tabular-nums">${product.price}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
