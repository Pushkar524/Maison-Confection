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
    const generatedId = `BCC-${Math.floor(1040 + Math.random() * 8900)}`;
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
      className="fixed inset-0 z-50 flex justify-end bg-[#161013]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Curated Gift Bag"
    >
      <div className="w-full max-w-lg bg-[#FDF2F5] h-full flex flex-col border-l border-[#E9C4D1] shadow-atelier-modal">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#E9C4D1] bg-[#F9E4EB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#161013]" />
            <h2 className="font-serif-editorial text-2xl font-semibold text-[#161013]">
              {step === 'confirmed'
                ? 'Atelier Order Confirmed'
                : step === 'checkout'
                  ? 'Dispatch Details'
                  : 'Your Gift Bag'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCloseDrawer}
            aria-label="Close gift bag"
            className="w-9 h-9 rounded-full bg-[#FFF9FB] border border-[#E9C4D1] flex items-center justify-center text-[#6E4E5A] hover:text-[#161013] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 'confirmed' ? (
            <div className="bg-[#FFF9FB] border border-[#E9C4D1] rounded-3xl p-8 text-center space-y-4 bevel-card">
              <div className="w-14 h-14 rounded-full bg-[#161013] text-[#F4C2D2] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9E3B58]">
                Order #{orderNumber} Confirmed
              </p>
              <h3 className="font-serif-editorial text-3xl font-semibold text-[#161013]">
                Merci, {recipientName || 'Atelier Patron'}
              </h3>
              <p className="text-sm text-[#6E4E5A] leading-relaxed">
                Our patisserie and letterpress artisans have queued your order for small-batch
                preparation. A dispatch confirmation has been prepared for{' '}
                <strong className="text-[#161013]">{email || 'your inbox'}</strong>.
              </p>
              <div className="pt-4 border-t border-[#E9C4D1] text-xs text-[#6E4E5A] space-y-1">
                <p>Destination: {address}, {postalCode}</p>
                <p>Includes hand-tied silk ribbon & wax-sealed parcel care</p>
              </div>
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="mt-4 px-7 py-3 rounded-full bg-[#161013] hover:bg-[#2B1C22] text-[#FDF2F5] text-sm font-bold cursor-pointer bevel-letterpress"
              >
                Return to Atelier
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F9E4EB] border border-[#E9C4D1] mx-auto flex items-center justify-center text-[#9E3B58]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-serif-editorial text-2xl font-semibold text-[#161013]">
                Your gift bag is empty
              </h3>
              <p className="text-sm text-[#6E4E5A] max-w-xs mx-auto">
                Explore curated confection coffrets or compose your own keepsake parcel in the
                Bespoke Builder.
              </p>
            </div>
          ) : step === 'bag' ? (
            <>
              {/* Complimentary Courier Progress */}
              <div className="bg-[#F9E4EB] border border-[#E9C4D1] rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-[#161013]">
                  {remainingForFreeShipping === 0
                    ? 'Complimentary chilled courier & silk gift wrap unlocked.'
                    : `Add $${remainingForFreeShipping} more for complimentary chilled courier & silk wrap.`}
                </p>
                <div className="h-2 rounded-full bg-[#FFF9FB] border border-[#E9C4D1] overflow-hidden">
                  <div
                    className="h-full bg-[#161013] transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((subtotal / freeWrapThreshold) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Itemized List */}
              <ul className="divide-y divide-[#E9C4D1]">
                {items.map((item) => (
                  <li key={item.uid} className="py-4 flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#E9C4D1] bg-[#F9E4EB] shrink-0">
                      <ResilientImage
                        src={item.image}
                        alt={item.title}
                        fallbackTitle={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif-editorial text-lg font-semibold text-[#161013] leading-snug">
                          {item.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.uid)}
                          aria-label={`Remove ${item.title}`}
                          className="text-[#6E4E5A] hover:text-[#161013] p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-[#6E4E5A] mt-0.5">{item.editionLabel}</p>

                      {item.personalization && (
                        <div className="mt-2 p-2.5 rounded-xl bg-[#F9E4EB] border border-[#E9C4D1] text-xs text-[#161013] space-y-0.5">
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
                            <p className="italic text-[#6E4E5A]">“{item.personalization.giftNote}”</p>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 p-1 rounded-full bg-[#FFF9FB] border border-[#E9C4D1]">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.uid, -1)}
                            aria-label={`Decrease quantity of ${item.title}`}
                            className="w-7 h-7 rounded-full bg-[#F9E4EB] flex items-center justify-center text-[#161013] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="min-w-[20px] text-center text-xs font-bold text-[#161013] tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.uid, 1)}
                            aria-label={`Increase quantity of ${item.title}`}
                            className="w-7 h-7 rounded-full bg-[#F9E4EB] flex items-center justify-center text-[#161013] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-[#161013] tabular-nums">
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
              <div className="bg-[#F9E4EB] border border-[#E9C4D1] rounded-2xl p-4 text-xs text-[#6E4E5A] flex items-center justify-between">
                <span>Order Summary ({items.length} parcels)</span>
                <strong className="text-sm text-[#161013] tabular-nums">${grandTotal}</strong>
              </div>

              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-xs font-bold uppercase tracking-wider text-[#161013] mb-1.5"
                >
                  Recipient Full Name
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Camille Laurent"
                  className="w-full h-12 px-3.5 rounded-xl bg-[#FFF9FB] border border-[#E9C4D1] text-sm text-[#161013] focus:outline-none focus:border-[#161013]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-email"
                  className="block text-xs font-bold uppercase tracking-wider text-[#161013] mb-1.5"
                >
                  Confirmation Email
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="camille@example.com"
                  className="w-full h-12 px-3.5 rounded-xl bg-[#FFF9FB] border border-[#E9C4D1] text-sm text-[#161013] focus:outline-none focus:border-[#161013]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-xs font-bold uppercase tracking-wider text-[#161013] mb-1.5"
                >
                  Delivery Street Address
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="24 Rue Saint-Honoré"
                  className="w-full h-12 px-3.5 rounded-xl bg-[#FFF9FB] border border-[#E9C4D1] text-sm text-[#161013] focus:outline-none focus:border-[#161013]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-postal"
                  className="block text-xs font-bold uppercase tracking-wider text-[#161013] mb-1.5"
                >
                  City & Postal Code
                </label>
                <input
                  id="checkout-postal"
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Paris, 75001"
                  className="w-full h-12 px-3.5 rounded-xl bg-[#FFF9FB] border border-[#E9C4D1] text-sm text-[#161013] focus:outline-none focus:border-[#161013]"
                />
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && step !== 'confirmed' && (
          <div className="p-6 border-t border-[#E9C4D1] bg-[#FFF9FB] space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-[#6E4E5A]">
                <span>Subtotal</span>
                <span className="tabular-nums">${subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-[#6E4E5A]">
                <span>Chilled Courier & Silk Wrap</span>
                <span className="tabular-nums">
                  {deliveryFee === 0 ? 'Complimentary' : `$${deliveryFee}`}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E9C4D1] text-base font-bold text-[#161013]">
                <span>Estimated Total</span>
                <span className="tabular-nums">${grandTotal}</span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 rounded-full bg-[#161013] hover:bg-[#2B1C22] text-[#FDF2F5] text-sm font-bold cursor-pointer bevel-letterpress transition-transform hover:scale-[1.01]"
              >
                Proceed to Dispatch Details
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('bag')}
                  className="px-5 py-3.5 rounded-full bg-[#F9E4EB] border border-[#E9C4D1] text-sm font-bold text-[#161013] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="atelier-checkout-form"
                  className="flex-1 py-3.5 rounded-full bg-[#161013] hover:bg-[#2B1C22] text-[#FDF2F5] text-sm font-bold cursor-pointer bevel-letterpress"
                >
                  Confirm Atelier Order
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
