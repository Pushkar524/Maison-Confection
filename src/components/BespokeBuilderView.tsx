import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  BOX_CURIO_ADDONS,
  BOX_VESSELS,
  FOIL_OPTIONS,
  HERO_IMAGE,
  RIBBON_OPTIONS,
  WAX_SEAL_OPTIONS,
} from '../data/atelierData';
import { FoilFinish, GiftBagItem } from '../types/atelier';
import { ResilientImage } from './ResilientImage';

interface BespokeBuilderViewProps {
  onAddCustomBox: (item: GiftBagItem) => void;
}

const STEPS = [
  { num: '01', title: 'Vessel & Lining' },
  { num: '02', title: 'Confections & Curios' },
  { num: '03', title: 'Ribbon & Wax Seal' },
  { num: '04', title: 'Letterpress Card' },
];

export function BespokeBuilderView({ onAddCustomBox }: BespokeBuilderViewProps) {
  const [step, setStep] = useState(0);
  const [vesselId, setVesselId] = useState(BOX_VESSELS[0].id);
  const [curioCounts, setCurioCounts] = useState<Record<string, number>>({
    'addon-macarons': 1,
    'addon-bonbons': 1,
  });
  const [ribbonId, setRibbonId] = useState(RIBBON_OPTIONS[0].id);
  const [waxSealId, setWaxSealId] = useState(WAX_SEAL_OPTIONS[0].id);
  const [foil, setFoil] = useState<FoilFinish>('Champagne Gold');
  const [monogram, setMonogram] = useState('E&O');
  const [cardMessage, setCardMessage] = useState(
    'Pour toi — crafted in small batches for an unforgettable afternoon.'
  );

  const selectedVessel = BOX_VESSELS.find((v) => v.id === vesselId) || BOX_VESSELS[0];
  const selectedRibbon = RIBBON_OPTIONS.find((r) => r.id === ribbonId) || RIBBON_OPTIONS[0];
  const selectedSeal = WAX_SEAL_OPTIONS.find((w) => w.id === waxSealId) || WAX_SEAL_OPTIONS[0];
  const activeFoilMeta = FOIL_OPTIONS.find((f) => f.name === foil) || FOIL_OPTIONS[0];

  const totalCurioCount = useMemo(
    () => Object.values(curioCounts).reduce((sum, count) => sum + count, 0),
    [curioCounts]
  );

  const selectedCurios = useMemo(
    () =>
      BOX_CURIO_ADDONS.filter((addon) => (curioCounts[addon.id] || 0) > 0).map((addon) => ({
        ...addon,
        count: curioCounts[addon.id],
      })),
    [curioCounts]
  );

  const totalPrice = useMemo(() => {
    const curiosSum = selectedCurios.reduce((acc, item) => acc + item.price * item.count, 0);
    return selectedVessel.price + curiosSum;
  }, [selectedVessel.price, selectedCurios]);

  const adjustCurio = (id: string, delta: number) => {
    setCurioCounts((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (delta > 0 && totalCurioCount >= selectedVessel.capacity) {
        return prev;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleAddCustomBox = () => {
    if (selectedCurios.length === 0) return;

    onAddCustomBox({
      uid: `custom-box-${Date.now()}`,
      productId: 'bespoke-custom-box',
      title: `Bespoke ${selectedVessel.name} Parcel`,
      editionLabel: `${totalCurioCount} Hand-Picked Curios`,
      unitPrice: totalPrice,
      quantity: 1,
      image: HERO_IMAGE,
      isCustomBox: true,
      personalization: {
        vesselName: selectedVessel.name,
        ribbonName: selectedRibbon.name,
        waxSealName: selectedSeal.name,
        foil,
        monogram: monogram.trim().toUpperCase() || undefined,
        giftNote: cardMessage.trim() || undefined,
        curioSummary: selectedCurios.map((c) => `${c.count}× ${c.name}`),
      },
    });
  };

  return (
    <section className="max-w-[1360px] mx-auto px-5 md:px-8 lg:px-12 pt-8 md:pt-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9E3B58] mb-2">
          Interactive Atelier Configurator
        </p>
        <h1 className="font-serif-editorial text-4xl md:text-[46px] font-semibold text-[#161013] leading-tight">
          Compose a Bespoke Gift Box
        </h1>
        <p className="mt-2 text-base text-[#6E4E5A] max-w-2xl">
          Select a cushioned linen vessel, fill it with daily confections and pantry curios, tie
          with satin ribbon, and seal a custom letterpress card.
        </p>
      </div>

      {/* Bespoke Step Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        {STEPS.map((s, idx) => {
          const isCurrent = step === idx;
          const isDone = idx < step;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(idx)}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-[#FFF9FB] border-[#161013] ring-4 ring-[#161013]/15 shadow-atelier-rest'
                  : 'bg-[#F9E4EB] border-[#E9C4D1] hover:border-[#161013]/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                    isCurrent
                      ? 'bg-[#161013] text-[#FDF2F5]'
                      : isDone
                        ? 'bg-[#F4C2D2] text-[#161013]'
                        : 'bg-[#FFF9FB] text-[#6E4E5A]'
                  }`}
                >
                  Step {s.num}
                </span>
                {isDone && <Check className="w-4 h-4 text-[#9E3B58]" />}
              </div>
              <span className="font-serif-editorial text-lg font-semibold text-[#161013] block truncate">
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Split Builder Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Interactive Step Canvas */}
        <div className="lg:col-span-7 bg-[#FFF9FB] border border-[#E9C4D1] rounded-3xl p-6 sm:p-8 bevel-card">
          {/* STEP 1: Vessel & Lining */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif-editorial text-2xl font-semibold text-[#161013]">
                  01. Choose Your Cushioned Vessel
                </h2>
                <p className="text-sm text-[#6E4E5A] mt-1">
                  Each keepsake box is wrapped in archival cloth and lined with pressed satin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BOX_VESSELS.map((vessel) => {
                  const selected = vessel.id === vesselId;
                  return (
                    <button
                      key={vessel.id}
                      type="button"
                      onClick={() => setVesselId(vessel.id)}
                      className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#FDF2F5] border-[#161013] ring-4 ring-[#161013]/15'
                          : 'bg-[#F9E4EB]/55 border-[#E9C4D1] hover:border-[#161013]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center -space-x-2">
                          <span
                            className="w-8 h-8 rounded-lg border border-[#E9C4D1] shadow-xs"
                            style={{ backgroundColor: vessel.outerHex }}
                          />
                          <span
                            className="w-8 h-8 rounded-lg border border-[#E9C4D1] shadow-xs"
                            style={{ backgroundColor: vessel.liningHex }}
                          />
                        </div>
                        <span className="text-sm font-bold text-[#9E3B58] tabular-nums">
                          ${vessel.price}
                        </span>
                      </div>

                      <h3 className="font-serif-editorial text-lg font-semibold text-[#161013]">
                        {vessel.name}
                      </h3>
                      <p className="text-xs text-[#6E4E5A] mt-1">{vessel.material}</p>
                      <p className="text-xs font-semibold text-[#161013] mt-3 tabular-nums">
                        Holds up to {vessel.capacity} curios
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Confections & Curios */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif-editorial text-2xl font-semibold text-[#161013]">
                    02. Curate Confections & Curios
                  </h2>
                  <p className="text-sm text-[#6E4E5A] mt-1">
                    Select up to {selectedVessel.capacity} treats to nest inside your{' '}
                    {selectedVessel.name}.
                  </p>
                </div>
                <div className="px-4 py-2 rounded-full bg-[#F9E4EB] border border-[#E9C4D1] text-xs font-bold text-[#161013] tabular-nums whitespace-nowrap self-start">
                  {totalCurioCount} / {selectedVessel.capacity} Curios Selected
                </div>
              </div>

              <div className="divide-y divide-[#E9C4D1] border-y border-[#E9C4D1]">
                {BOX_CURIO_ADDONS.map((addon) => {
                  const count = curioCounts[addon.id] || 0;
                  const atCapacity = totalCurioCount >= selectedVessel.capacity;
                  return (
                    <div
                      key={addon.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#E9C4D1] bg-[#F9E4EB] shrink-0">
                          <ResilientImage
                            src={addon.image}
                            alt={addon.name}
                            fallbackTitle={addon.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-xs text-[#6E4E5A]">
                            <span>{addon.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{addon.weightOrCount}</span>
                          </div>
                          <h3 className="font-serif-editorial text-lg font-semibold text-[#161013]">
                            {addon.name}
                          </h3>
                          <p className="text-xs text-[#6E4E5A]">{addon.note}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <span className="text-sm font-bold text-[#161013] tabular-nums">
                          ${addon.price}
                        </span>
                        <div className="inline-flex items-center gap-2 p-1 rounded-full bg-[#F9E4EB] border border-[#E9C4D1]">
                          <button
                            type="button"
                            onClick={() => adjustCurio(addon.id, -1)}
                            disabled={count === 0}
                            aria-label={`Remove one ${addon.name}`}
                            className="w-8 h-8 rounded-full bg-[#FFF9FB] border border-[#E9C4D1] flex items-center justify-center text-[#161013] disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="min-w-[24px] text-center text-sm font-bold text-[#161013] tabular-nums">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => adjustCurio(addon.id, 1)}
                            disabled={atCapacity}
                            aria-label={`Add one ${addon.name}`}
                            className="w-8 h-8 rounded-full bg-[#FFF9FB] border border-[#E9C4D1] flex items-center justify-center text-[#161013] hover:border-[#161013] disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Ribbon & Wax Seal */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif-editorial text-2xl font-semibold text-[#161013]">
                  03. Satin Ribbon & Sealing Wax
                </h2>
                <p className="text-sm text-[#6E4E5A] mt-1">
                  Every box is hand-tied in double-faced silk ribbon and stamped with warm wax.
                </p>
              </div>

              <div className="space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#161013]">
                  Ribbon Shade
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {RIBBON_OPTIONS.map((ribbon) => {
                    const active = ribbon.id === ribbonId;
                    return (
                      <button
                        key={ribbon.id}
                        type="button"
                        onClick={() => setRibbonId(ribbon.id)}
                        className={`flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'border-[#161013] bg-[#FDF2F5] ring-4 ring-[#161013]/15'
                            : 'border-[#E9C4D1] bg-[#F9E4EB]/45 hover:border-[#161013]/50'
                        }`}
                      >
                        <span
                          className="w-9 h-9 rounded-lg border border-black/15 shrink-0"
                          style={{ backgroundColor: ribbon.hex }}
                        />
                        <div>
                          <span className="block text-sm font-bold text-[#161013]">
                            {ribbon.name}
                          </span>
                          <span className="block text-xs text-[#6E4E5A]">Included · 38mm silk</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#E9C4D1]">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#161013]">
                  Botanical Wax Seal Emblem
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {WAX_SEAL_OPTIONS.map((seal) => {
                    const active = seal.id === waxSealId;
                    return (
                      <button
                        key={seal.id}
                        type="button"
                        onClick={() => setWaxSealId(seal.id)}
                        className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                          active
                            ? 'border-[#161013] bg-[#FDF2F5] ring-4 ring-[#161013]/15'
                            : 'border-[#E9C4D1] bg-[#F9E4EB]/45 hover:border-[#161013]/50'
                        }`}
                      >
                        <span
                          className="mx-auto w-10 h-10 rounded-full flex items-center justify-center text-[#FDF2F5] font-serif-editorial text-lg font-semibold mb-2 shadow-sm"
                          style={{ backgroundColor: seal.hex }}
                        >
                          {seal.motif}
                        </span>
                        <span className="block text-xs font-bold text-[#161013]">{seal.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Letterpress Card & Monogram */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif-editorial text-2xl font-semibold text-[#161013]">
                  04. Letterpress Card & Foil Monogram
                </h2>
                <p className="text-sm text-[#6E4E5A] mt-1">
                  Personalize your 600gsm cotton-rag enclosure card. Watch your proof update live.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="builder-monogram"
                    className="block text-xs font-bold uppercase tracking-wider text-[#161013] mb-2"
                  >
                    Monogram (4 chars)
                  </label>
                  <input
                    id="builder-monogram"
                    type="text"
                    maxLength={4}
                    value={monogram}
                    onChange={(e) => setMonogram(e.target.value)}
                    placeholder="E&O"
                    className="w-full h-12 px-4 rounded-xl bg-[#FDF2F5] border border-[#E9C4D1] text-sm font-bold uppercase tracking-widest text-[#161013] focus:outline-none focus:border-[#161013] focus:ring-4 focus:ring-[#161013]/15"
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
                              ? 'border-[#161013] bg-[#FDF2F5] ring-2 ring-[#161013]/20'
                              : 'border-[#E9C4D1] bg-[#FFF9FB] hover:border-[#161013]/50'
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
                  htmlFor="builder-message"
                  className="block text-xs font-bold uppercase tracking-wider text-[#161013] mb-2"
                >
                  Personal Gift Message
                </label>
                <textarea
                  id="builder-message"
                  rows={3}
                  maxLength={160}
                  value={cardMessage}
                  onChange={(e) => setCardMessage(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#FDF2F5] border border-[#E9C4D1] text-sm text-[#161013] focus:outline-none focus:border-[#161013] focus:ring-4 focus:ring-[#161013]/15"
                />
              </div>
            </div>
          )}

          {/* Step Navigation Footer */}
          <div className="mt-8 pt-6 border-t border-[#E9C4D1] flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F9E4EB] border border-[#E9C4D1] text-sm font-bold text-[#161013] disabled:opacity-40 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#161013] hover:bg-[#2B1C22] text-[#FDF2F5] text-sm font-bold cursor-pointer bevel-letterpress"
              >
                <span>Continue to {STEPS[step + 1].title}</span>
                <ArrowRight className="w-4 h-4 text-[#F4C2D2]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddCustomBox}
                disabled={selectedCurios.length === 0}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#161013] hover:bg-[#2B1C22] text-[#FDF2F5] text-sm font-bold cursor-pointer bevel-letterpress disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4 text-[#F4C2D2]" />
                <span>
                  Add Custom Box — <span className="tabular-nums">${totalPrice}</span>
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Right Sticky Live Parcel Proof */}
        <aside className="lg:col-span-5 lg:sticky lg:top-28 bg-[#F9E4EB] border border-[#E9C4D1] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif-editorial text-2xl font-semibold text-[#161013]">
              Live Parcel Proof
            </h2>
            <span className="text-xl font-bold text-[#9E3B58] tabular-nums">${totalPrice}</span>
          </div>

          {/* Interactive Tactile Box & Scalloped Card Visual */}
          <div
            className="relative rounded-2xl p-6 border border-[#E9C4D1] overflow-hidden shadow-atelier-rest transition-colors"
            style={{ backgroundColor: selectedVessel.outerHex }}
          >
            {/* Satin Ribbon Crossband */}
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-5 opacity-95"
              style={{ backgroundColor: selectedRibbon.hex }}
            />
            <div
              className="relative z-10 mx-auto max-w-xs rounded-2xl p-5 border-2 border-dashed border-[#D8A6B8] stamp-card-surface text-center shadow-atelier-rest"
              style={{
                boxShadow: `0 0 0 6px ${selectedVessel.liningHex}66`,
              }}
            >
              <div
                className="mx-auto w-9 h-9 rounded-full flex items-center justify-center text-[#FDF2F5] font-serif-editorial text-base font-semibold mb-2 shadow-sm"
                style={{ backgroundColor: selectedSeal.hex }}
              >
                {selectedSeal.motif}
              </div>
              <div
                className="font-serif-editorial text-2xl font-semibold tracking-wider mb-1.5"
                style={{ color: activeFoilMeta.textHex }}
              >
                {monogram.trim().toUpperCase() || 'MC'}
              </div>
              <p className="font-serif-editorial italic text-xs text-[#161013] leading-relaxed">
                “{cardMessage.trim() || 'Handcrafted with care.'}”
              </p>
            </div>
          </div>

          {/* Summary Breakdown */}
          <div className="bg-[#FFF9FB] border border-[#E9C4D1] rounded-2xl p-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E9C4D1]">
              <span className="text-[#6E4E5A]">{selectedVessel.name}</span>
              <span className="font-bold text-[#161013] tabular-nums">${selectedVessel.price}</span>
            </div>

            {selectedCurios.length === 0 ? (
              <p className="text-xs text-[#9E3B58] py-2">
                Select at least 1 confection or curio in Step 02 to complete your parcel.
              </p>
            ) : (
              <ul className="space-y-2">
                {selectedCurios.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2">
                    <span className="text-[#161013] truncate">
                      <strong className="tabular-nums">{c.count}×</strong> {c.name}
                    </span>
                    <span className="font-semibold text-[#161013] tabular-nums">
                      ${c.price * c.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="pt-2.5 border-t border-[#E9C4D1] flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#6E4E5A]">
              <span>Ribbon: {selectedRibbon.name}</span>
              <span aria-hidden="true">·</span>
              <span>Seal: {selectedSeal.name}</span>
              <span aria-hidden="true">·</span>
              <span>Foil: {foil}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCustomBox}
            disabled={selectedCurios.length === 0}
            className="w-full inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#161013] hover:bg-[#2B1C22] text-[#FDF2F5] text-sm font-bold cursor-pointer bevel-letterpress disabled:opacity-50 transition-transform hover:scale-[1.01]"
          >
            <ShoppingBag className="w-4 h-4 text-[#F4C2D2]" />
            <span>
              Add Bespoke Parcel to Bag — <span className="tabular-nums">${totalPrice}</span>
            </span>
          </button>
        </aside>
      </div>
    </section>
  );
}
