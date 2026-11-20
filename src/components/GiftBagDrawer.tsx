import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { GiftBagItem } from '../types/atelier';
import { ResilientImage } from './ResilientImage';

interface GiftBagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: GiftBagItem[];
  onUpdateQuantity: (uid: string, delta: number) => void;
  onRemoveItem: (uid: string) => void;
  onClearBag: () => void;
}

export function GiftBagDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearBag,
}: GiftBagDrawerProps) {
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [recipientName, setRecipientName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const freeWrapThreshold = 120;
  const remainingForFreeShipping = Math.max(0, freeWrapThreshold - subtotal);
  const deliveryFee = subtotal >= freeWrapThreshold || subtotal === 0 ? 0 : 12;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `VRC-${Math.floor(1040 + Math.random() * 8900)}`;
    setOrderNumber(generatedId);
    setStep('confirmed');
    onClearBag();
  };

  const handleCloseDrawer = () => {
    if (step === 'confirmed') {
      setStep('bag');
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#19050D]/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Curated Gift Bag"
    >
      <div className="w-full max-w-lg bg-gradient-to-b from-[#2E0B1A] via-[#240814] to-[#1D0711] h-full flex flex-col border-l border-[#6E2440] shadow-atelier-modal text-[#FCE7EF]">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#6E2440] bg-gradient-to-r from-[#3D1023] to-[#2B0A18] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#FF8FB3]" />
            <h2 className="font-serif-editorial text-2xl font-semibold text-[#FFF0F5]">
              {step === 'confirmed'
                ? 'Custom Order Confirmed'
                : step === 'checkout'
                  ? 'Dispatch Details'
                  : 'Your Gift Bag'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCloseDrawer}
            aria-label="Close gift bag"
            className="w-9 h-9 rounded-full bg-[#240814] border border-[#6E2440] flex items-center justify-center text-[#E8B4C6] hover:text-[#FFF0F5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 'confirmed' ? (
            <div className="bg-gradient-to-br from-[#3D1023] to-[#290916] border border-[#7D2B4B] rounded-3xl p-8 text-center space-y-4 bevel-card">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E84F82] to-[#B81D52] text-[#FFF4F8] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF8FB3]">
                Order #{orderNumber} Confirmed
              </p>
              <h3 className="font-serif-editorial text-3xl font-semibold text-[#FFF0F5]">
                Thank you, {recipientName || 'Valued Guest'}
              </h3>
              <p className="text-sm text-[#E8B4C6] leading-relaxed">
                Our pastry and letterpress artisans have queued your order for small-batch
                preparation. A dispatch confirmation has been prepared for{' '}
                <strong className="text-[#FFF0F5]">{email || 'your inbox'}</strong>.
              </p>
              <div className="pt-4 border-t border-[#6E2440] text-xs text-[#D996AE] space-y-1">
                <p>Destination: {address}, {postalCode}</p>
                <p>Includes hand-tied silk ribbon & wax-sealed parcel care</p>
              </div>
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="mt-4 px-7 py-3 rounded-full bg-gradient-to-r from-[#E84F82] to-[#B81D52] hover:from-[#F26694] hover:to-[#C9235B] text-[#FFF4F8] text-sm font-bold cursor-pointer bevel-letterpress"
              >
                Return to Studio
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#3A0F22] border border-[#6E2440] mx-auto flex items-center justify-center text-[#FF8FB3]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-serif-editorial text-2xl font-semibold text-[#FFF0F5]">
                Your gift bag is empty
              </h3>
              <p className="text-sm text-[#E8B4C6] max-w-xs mx-auto">
                Explore curated confection gift boxes or compose your own keepsake parcel in the
                Custom Box Builder.
              </p>
            </div>
          ) : step === 'bag' ? (
            <>
              {/* Complimentary Courier Progress */}
              <div className="bg-gradient-to-r from-[#3A0F22] to-[#2C0A18] border border-[#6E2440] rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-[#FCE7EF]">
                  {remainingForFreeShipping === 0
                    ? 'Complimentary chilled courier & silk gift wrap unlocked.'
                    : `Add $${remainingForFreeShipping} more for complimentary chilled courier & silk wrap.`}
                </p>
                <div className="h-2 rounded-full bg-[#220712] border border-[#6E2440] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF8FB3] to-[#E84F82] transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((subtotal / freeWrapThreshold) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Itemized List */}
              <ul className="divide-y divide-[#5E1D36]">
                {items.map((item) => (
                  <li key={item.uid} className="py-4 flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#6E2440] bg-[#360D1E] shrink-0">
                      <ResilientImage
                        src={item.image}
                        alt={item.title}
                        fallbackTitle={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif-editorial text-lg font-semibold text-[#FFF0F5] leading-snug">
                          {item.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.uid)}
                          aria-label={`Remove ${item.title}`}
                          className="text-[#D996AE] hover:text-[#FFF0F5] p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-[#D996AE] mt-0.5">{item.editionLabel}</p>

                      {item.personalization && (
                        <div className="mt-2 p-2.5 rounded-xl bg-[#340D1E] border border-[#6E2440] text-xs text-[#FCE7EF] space-y-0.5">
                          {item.personalization.monogram && (
                            <p>
                              Monogram: <strong>{item.personalization.monogram}</strong> (
                              {item.personalization.foil})
                            </p>
                          )}
                          {item.personalization.ribbonName && (
                            <p>
                              {item.personalization.ribbonName} ·{' '}
                              {item.personalization.waxSealName}
                            </p>
                          )}
                          {item.personalization.curioSummary && (
                            <p className="line-clamp-2">
                              Includes: {item.personalization.curioSummary.join(', ')}
                            </p>
                          )}
                          {item.personalization.suiteDetails && (
                            <p className="line-clamp-2">{item.personalization.suiteDetails}</p>
                          )}
                          {item.personalization.giftNote && (
                            <p className="italic text-[#E8B4C6]">“{item.personalization.giftNote}”</p>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 p-1 rounded-full bg-[#340D1E] border border-[#6E2440]">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.uid, -1)}
                            aria-label={`Decrease quantity of ${item.title}`}
                            className="w-7 h-7 rounded-full bg-[#240814] flex items-center justify-center text-[#FCE7EF] hover:text-[#FF8FB3] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="min-w-[20px] text-center text-xs font-bold text-[#FFF0F5] tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.uid, 1)}
                            aria-label={`Increase quantity of ${item.title}`}
                            className="w-7 h-7 rounded-full bg-[#240814] flex items-center justify-center text-[#FCE7EF] hover:text-[#FF8FB3] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-[#FF8FB3] tabular-nums">
                          ${item.unitPrice * item.quantity}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            /* Checkout Verification Form */
            <form id="atelier-checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="bg-gradient-to-r from-[#3A0F22] to-[#2C0A18] border border-[#6E2440] rounded-2xl p-4 text-xs text-[#E8B4C6] flex items-center justify-between">
                <span>Order Summary ({items.length} parcels)</span>
                <strong className="text-sm text-[#FFF0F5] tabular-nums">${grandTotal}</strong>
              </div>

              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-xs font-bold uppercase tracking-wider text-[#E8B4C6] mb-1.5"
                >
                  Recipient Full Name
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Claire Bennett"
                  className="w-full h-12 px-3.5 rounded-xl bg-[#220712] border border-[#6E2440] text-sm text-[#FFF0F5] placeholder:text-[#D996AE]/60 focus:outline-none focus:border-[#FF8FB3]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-email"
                  className="block text-xs font-bold uppercase tracking-wider text-[#E8B4C6] mb-1.5"
                >
                  Confirmation Email
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="claire@example.com"
                  className="w-full h-12 px-3.5 rounded-xl bg-[#220712] border border-[#6E2440] text-sm text-[#FFF0F5] placeholder:text-[#D996AE]/60 focus:outline-none focus:border-[#FF8FB3]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-xs font-bold uppercase tracking-wider text-[#E8B4C6] mb-1.5"
                >
                  Delivery Street Address
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="24 Kensington High Street"
                  className="w-full h-12 px-3.5 rounded-xl bg-[#220712] border border-[#6E2440] text-sm text-[#FFF0F5] placeholder:text-[#D996AE]/60 focus:outline-none focus:border-[#FF8FB3]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-postal"
                  className="block text-xs font-bold uppercase tracking-wider text-[#E8B4C6] mb-1.5"
                >
                  City & Postal Code
                </label>
                <input
                  id="checkout-postal"
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="London, W8 4PT"
                  className="w-full h-12 px-3.5 rounded-xl bg-[#220712] border border-[#6E2440] text-sm text-[#FFF0F5] placeholder:text-[#D996AE]/60 focus:outline-none focus:border-[#FF8FB3]"
                />
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && step !== 'confirmed' && (
          <div className="p-6 border-t border-[#6E2440] bg-gradient-to-t from-[#280916] to-[#340D1E] space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-[#E8B4C6]">
                <span>Subtotal</span>
                <span className="tabular-nums">${subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-[#E8B4C6]">
                <span>Chilled Courier & Silk Wrap</span>
                <span className="tabular-nums">
                  {deliveryFee === 0 ? 'Complimentary' : `$${deliveryFee}`}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#6E2440] text-base font-bold text-[#FFF0F5]">
                <span>Estimated Total</span>
                <span className="tabular-nums text-[#FF8FB3]">${grandTotal}</span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#E84F82] to-[#B81D52] hover:from-[#F26694] hover:to-[#C9235B] text-[#FFF4F8] text-sm font-bold cursor-pointer border border-[#FF9BBE]/35 bevel-letterpress transition-transform hover:scale-[1.01]"
              >
                Proceed to Dispatch Details
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('bag')}
                  className="px-5 py-3.5 rounded-full bg-[#2B0A18] border border-[#6E2440] text-sm font-bold text-[#FCE7EF] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="atelier-checkout-form"
                  className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-[#E84F82] to-[#B81D52] hover:from-[#F26694] hover:to-[#C9235B] text-[#FFF4F8] text-sm font-bold cursor-pointer border border-[#FF9BBE]/35 bevel-letterpress"
                >
                  Confirm Custom Order
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
