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
  { num: '02', title: 'Confections & Treats' },
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
    'Crafted especially for you in small batches for an unforgettable afternoon.'
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
      title: `Custom ${selectedVessel.name} Box`,
      editionLabel: `${totalCurioCount} Hand-Picked Treats`,
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
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#FF8FB3] mb-2">
          Interactive Studio Configurator
        </p>
        <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-[56px] font-light tracking-[-0.02em] text-[#FFF0F5] leading-[1.06]">
          Compose a Custom Gift Box
        </h1>
        <p className="mt-3 text-sm text-[#C98DA4] max-w-lg">
          Pick a linen vessel, fill with daily confections, and finish with satin ribbon and wax.
        </p>
      </div>

      {/* Custom Step Tiles */}
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
                  ? 'bg-gradient-to-br from-[#4D142C] to-[#340C1D] border-[#FF8FB3] ring-2 ring-[#FF8FB3]/30 shadow-atelier-rest'
                  : 'bg-gradient-to-br from-[#340D1E] to-[#270916] border-[#6E2440] hover:border-[#C96B8E]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#FCE4EC] to-[#F5B8CD] text-[#240814]'
                      : isDone
                        ? 'bg-[#631B38] text-[#FF8FB3]'
                        : 'bg-[#220712] text-[#D996AE]'
                  }`}
                >
                  Step {s.num}
                </span>
                {isDone && <Check className="w-4 h-4 text-[#FF8FB3]" />}
              </div>
              <span className="font-serif-editorial text-lg font-semibold text-[#FFF0F5] block truncate">
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Split Builder Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Interactive Step Canvas */}
        <div className="lg:col-span-7 bg-gradient-to-b from-[#3A0F22] via-[#2F0B1B] to-[#250815] border border-[#6E2440] rounded-3xl p-6 sm:p-8 bevel-card">
          {/* STEP 1: Vessel & Lining */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif-editorial text-3xl sm:text-[34px] font-light tracking-[-0.01em] text-[#FFF0F5]">
                  01. Cushioned Vessel
                </h2>
                <p className="text-[13px] text-[#C98DA4] mt-1.5">
                  Archival cloth box lined with pressed satin.
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
                          ? 'bg-[#4D142C] border-[#FF8FB3] ring-2 ring-[#FF8FB3]/30'
                          : 'bg-[#290916]/85 border-[#6E2440] hover:border-[#C96B8E]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center -space-x-2">
                          <span
                            className="w-8 h-8 rounded-lg border border-[#A84D70] shadow-xs"
                            style={{ backgroundColor: vessel.outerHex }}
                          />
                          <span
                            className="w-8 h-8 rounded-lg border border-[#A84D70] shadow-xs"
                            style={{ backgroundColor: vessel.liningHex }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#D996AE] tabular-nums">
                          Up to {vessel.capacity}
                        </span>
                      </div>

                      <h3 className="font-serif-editorial text-lg font-semibold text-[#FFF0F5]">
                        {vessel.name}
                      </h3>
                      <p className="text-xs text-[#D996AE] mt-1">{vessel.material}</p>
                      <p className="text-xs font-semibold text-[#FCE7EF] mt-3 tabular-nums">
                        Holds up to {vessel.capacity} treats
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Confections & Treats */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif-editorial text-3xl sm:text-[34px] font-light tracking-[-0.01em] text-[#FFF0F5]">
                    02. Confections & Treats
                  </h2>
                  <p className="text-[13px] text-[#C98DA4] mt-1.5">
                    Select up to {selectedVessel.capacity} treats for your {selectedVessel.name}.
                  </p>
                </div>
                <div className="px-4 py-2 rounded-full bg-[#240814] border border-[#7D2B4B] text-xs font-bold text-[#FF8FB3] tabular-nums whitespace-nowrap self-start">
                  {totalCurioCount} / {selectedVessel.capacity} Items Selected
                </div>
              </div>

              <div className="divide-y divide-[#6E2440] border-y border-[#6E2440]">
                {BOX_CURIO_ADDONS.map((addon) => {
                  const count = curioCounts[addon.id] || 0;
                  const atCapacity = totalCurioCount >= selectedVessel.capacity;
                  return (
                    <div
                      key={addon.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#6E2440] bg-[#240814] shrink-0">
                          <ResilientImage
                            src={addon.image}
                            alt={addon.name}
                            fallbackTitle={addon.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-xs text-[#D996AE]">
                            <span>{addon.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{addon.weightOrCount}</span>
                          </div>
                          <h3 className="font-serif-editorial text-lg font-semibold text-[#FFF0F5]">
                            {addon.name}
                          </h3>
                          <p className="text-xs text-[#E8B4C6]">{addon.note}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-4 shrink-0">
                        <div className="inline-flex items-center gap-2 p-1 rounded-full bg-[#240814] border border-[#6E2440]">
                          <button
                            type="button"
                            onClick={() => adjustCurio(addon.id, -1)}
                            disabled={count === 0}
                            aria-label={`Remove one ${addon.name}`}
                            className="w-8 h-8 rounded-full bg-[#3D1023] border border-[#7D2B4B] flex items-center justify-center text-[#FFF0F5] disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="min-w-[24px] text-center text-sm font-bold text-[#FFF0F5] tabular-nums">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => adjustCurio(addon.id, 1)}
                            disabled={atCapacity}
                            aria-label={`Add one ${addon.name}`}
                            className="w-8 h-8 rounded-full bg-[#3D1023] border border-[#7D2B4B] flex items-center justify-center text-[#FFF0F5] hover:border-[#FF8FB3] disabled:opacity-40 cursor-pointer"
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
                <h2 className="font-serif-editorial text-3xl sm:text-[34px] font-light tracking-[-0.01em] text-[#FFF0F5]">
                  03. Satin Ribbon & Wax Seal
                </h2>
                <p className="text-[13px] text-[#C98DA4] mt-1.5">
                  Hand-tied silk ribbon with a brass-stamped seal.
                </p>
              </div>

              <div className="space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#FFF0F5]">
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
                            ? 'border-[#FF8FB3] bg-[#4D142C] ring-2 ring-[#FF8FB3]/30'
                            : 'border-[#6E2440] bg-[#290916]/85 hover:border-[#C96B8E]'
                        }`}
                      >
                        <span
                          className="w-9 h-9 rounded-lg border border-white/20 shrink-0"
                          style={{ backgroundColor: ribbon.hex }}
                        />
                        <div>
                          <span className="block text-sm font-bold text-[#FFF0F5]">
                            {ribbon.name}
                          </span>
                          <span className="block text-xs text-[#D996AE]">Included · 38mm silk</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#6E2440]">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#FFF0F5]">
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
                            ? 'border-[#FF8FB3] bg-[#4D142C] ring-2 ring-[#FF8FB3]/30'
                            : 'border-[#6E2440] bg-[#290916]/85 hover:border-[#C96B8E]'
                        }`}
                      >
                        <span
                          className="mx-auto w-10 h-10 rounded-full flex items-center justify-center text-[#FCE4EC] border border-white/20 font-serif-editorial text-lg font-semibold mb-2 shadow-sm"
                          style={{ backgroundColor: seal.hex }}
                        >
                          {seal.motif}
                        </span>
                        <span className="block text-xs font-bold text-[#FFF0F5]">{seal.name}</span>
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
                <h2 className="font-serif-editorial text-3xl sm:text-[34px] font-light tracking-[-0.01em] text-[#FFF0F5]">
                  04. Letterpress Card & Monogram
                </h2>
                <p className="text-[13px] text-[#C98DA4] mt-1.5">
                  Customize your 600gsm cotton enclosure card.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="builder-monogram"
                    className="block text-xs font-bold uppercase tracking-wider text-[#FFF0F5] mb-2"
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
                    className="w-full h-12 px-4 rounded-xl bg-[#220712] border border-[#6E2440] text-sm font-bold uppercase tracking-widest text-[#FFF0F5] focus:outline-none focus:border-[#FF8FB3] focus:ring-4 focus:ring-[#FF8FB3]/15"
                  />
                </div>

                <div className="sm:col-span-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#FFF0F5] mb-2">
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
                              ? 'border-[#FF8FB3] bg-[#4D142C] ring-2 ring-[#FF8FB3]/30'
                              : 'border-[#6E2440] bg-[#290916] hover:border-[#C96B8E]'
                          }`}
                        >
                          <span className={`block w-full h-4 rounded mb-1 ${opt.swatchClass}`} />
                          <span className="block text-[11px] font-bold text-[#FCE7EF] truncate">
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
                  className="block text-xs font-bold uppercase tracking-wider text-[#FFF0F5] mb-2"
                >
                  Personal Gift Message
                </label>
                <textarea
                  id="builder-message"
                  rows={3}
                  maxLength={160}
                  value={cardMessage}
                  onChange={(e) => setCardMessage(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#220712] border border-[#6E2440] text-sm text-[#FFF0F5] focus:outline-none focus:border-[#FF8FB3] focus:ring-4 focus:ring-[#FF8FB3]/15"
                />
              </div>
            </div>
          )}

          {/* Step Navigation Footer */}
          <div className="mt-8 pt-6 border-t border-[#6E2440] flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D1023] border border-[#7D2B4B] text-sm font-bold text-[#FCE7EF] hover:border-[#FF8FB3] disabled:opacity-40 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E84F82] to-[#B81D52] hover:from-[#F26694] hover:to-[#C9235B] text-[#FFF4F8] border border-[#FF9BBE]/35 text-sm font-bold cursor-pointer bevel-letterpress"
              >
                <span>Continue to {STEPS[step + 1].title}</span>
                <ArrowRight className="w-4 h-4 text-[#FFE6EF]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddCustomBox}
                disabled={selectedCurios.length === 0}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#E84F82] to-[#B81D52] hover:from-[#F26694] hover:to-[#C9235B] text-[#FFF4F8] border border-[#FF9BBE]/35 text-sm font-bold cursor-pointer bevel-letterpress disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4 text-[#FFE6EF]" />
                <span>Add Custom Box</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Sticky Live Box Proof */}
        <aside className="lg:col-span-5 lg:sticky lg:top-28 bg-gradient-to-b from-[#340D1E] to-[#260814] border border-[#6E2440] rounded-3xl p-6 sm:p-8 space-y-6 shadow-atelier-rest">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif-editorial text-3xl font-light tracking-[-0.01em] text-[#FFF0F5]">
              Live Box Proof
            </h2>
            <span className="text-xs font-semibold text-[#FF8FB3] tabular-nums">
              {totalCurioCount} / {selectedVessel.capacity} treats
            </span>
          </div>

          {/* Interactive Tactile Box & Scalloped Card Visual */}
          <div
            className="relative rounded-2xl p-6 border border-[#7D2B4B] overflow-hidden shadow-atelier-rest transition-colors"
            style={{ backgroundColor: selectedVessel.outerHex }}
          >
            {/* Satin Ribbon Crossband */}
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-5 opacity-95"
              style={{ backgroundColor: selectedRibbon.hex }}
            />
            <div
              className="relative z-10 mx-auto max-w-xs rounded-2xl p-5 border-2 border-dashed border-[#D86089] stamp-card-surface text-center shadow-atelier-rest"
              style={{
                boxShadow: `0 0 0 6px ${selectedVessel.liningHex}66`,
              }}
            >
              <div
                className="mx-auto w-9 h-9 rounded-full flex items-center justify-center text-[#FCE4EC] font-serif-editorial text-base font-semibold mb-2 shadow-sm"
                style={{ backgroundColor: selectedSeal.hex }}
              >
                {selectedSeal.motif}
              </div>
              <div
                className="font-serif-editorial text-2xl font-semibold tracking-wider mb-1.5"
                style={{ color: activeFoilMeta.textHex }}
              >
                {monogram.trim().toUpperCase() || 'VR'}
              </div>
              <p className="font-serif-editorial italic text-xs text-[#240814] leading-relaxed">
                “{cardMessage.trim() || 'Handcrafted with care.'}”
              </p>
            </div>
          </div>

          {/* Summary Breakdown */}
          <div className="bg-[#240814] border border-[#6E2440] rounded-2xl p-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#6E2440]">
              <span className="text-[#E8B4C6]">{selectedVessel.name}</span>
              <span className="text-xs font-medium text-[#C98DA4]">{selectedVessel.capacity} treats max</span>
            </div>

            {selectedCurios.length === 0 ? (
              <p className="text-xs text-[#FF8FB3] py-2">
                Select at least 1 confection or treat in Step 02.
              </p>
            ) : (
              <ul className="space-y-2">
                {selectedCurios.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2">
                    <span className="text-[#FCE7EF] truncate">
                      <strong className="tabular-nums">{c.count}×</strong> {c.name}
                    </span>
                    <span className="text-xs text-[#C98DA4] shrink-0">
                      {c.weightOrCount}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="pt-2.5 border-t border-[#6E2440] flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#D996AE]">
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
            className="w-full inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E84F82] to-[#B81D52] hover:from-[#F26694] hover:to-[#C9235B] text-[#FFF4F8] border border-[#FF9BBE]/35 text-sm font-bold cursor-pointer bevel-letterpress disabled:opacity-50 transition-transform hover:scale-[1.01]"
          >
            <ShoppingBag className="w-4 h-4 text-[#FFE6EF]" />
            <span>Add Custom Box to Bag</span>
          </button>
        </aside>
      </div>
    </section>
  );
}
