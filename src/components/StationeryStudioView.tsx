import { Check, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import {
  FOIL_OPTIONS,
  RIBBON_OPTIONS,
  STATIONERY_TEMPLATES,
  WAX_SEAL_OPTIONS,
} from '../data/atelierData';
import { FoilFinish, GiftBagItem } from '../types/atelier';

interface StationeryStudioViewProps {
  onAddSuite: (item: GiftBagItem) => void;
}

const SUITE_QUANTITIES = [
  { id: 'sample', label: 'Physical Proof Sample (3 pcs)', multiplier: 0, flatPrice: 18 },
  { id: '25', label: 'Suite of 25', multiplier: 1, flatPrice: 0 },
  { id: '50', label: 'Suite of 50', multiplier: 1.85, flatPrice: 0 },
  { id: '100', label: 'Suite of 100', multiplier: 3.4, flatPrice: 0 },
];

export function StationeryStudioView({ onAddSuite }: StationeryStudioViewProps) {
  const [templateId, setTemplateId] = useState(STATIONERY_TEMPLATES[0].id);
  const activeTemplate =
    STATIONERY_TEMPLATES.find((t) => t.id === templateId) || STATIONERY_TEMPLATES[0];

  const [headline, setHeadline] = useState(activeTemplate.defaultHeadline);
  const [subline, setSubline] = useState(activeTemplate.defaultSubline);
  const [eventDate, setEventDate] = useState(activeTemplate.defaultDate);
  const [venue, setVenue] = useState(activeTemplate.defaultVenue);
  const [foil, setFoil] = useState<FoilFinish>('Champagne Gold');
  const [ribbonId, setRibbonId] = useState(RIBBON_OPTIONS[0].id);
  const [sealId, setSealId] = useState(WAX_SEAL_OPTIONS[0].id);
  const [qtyId, setQtyId] = useState('25');

  const handleTemplateSelect = (id: string) => {
    const next = STATIONERY_TEMPLATES.find((t) => t.id === id);
    if (!next) return;
    setTemplateId(id);
    setHeadline(next.defaultHeadline);
    setSubline(next.defaultSubline);
    setEventDate(next.defaultDate);
    setVenue(next.defaultVenue);
  };

  const activeFoil = FOIL_OPTIONS.find((f) => f.name === foil) || FOIL_OPTIONS[0];
  const activeRibbon = RIBBON_OPTIONS.find((r) => r.id === ribbonId) || RIBBON_OPTIONS[0];
  const activeSeal = WAX_SEAL_OPTIONS.find((w) => w.id === sealId) || WAX_SEAL_OPTIONS[0];
  const activeQty = SUITE_QUANTITIES.find((q) => q.id === qtyId) || SUITE_QUANTITIES[1];

  const computedPrice =
    activeQty.flatPrice > 0
      ? activeQty.flatPrice
      : Math.round(activeTemplate.basePricePer25 * activeQty.multiplier);

  const handleAddToBag = () => {
    onAddSuite({
      uid: `stationery-${templateId}-${qtyId}-${Date.now()}`,
      productId: activeTemplate.id,
      title: activeTemplate.name,
      editionLabel: activeQty.label,
      unitPrice: computedPrice,
      quantity: 1,
      image: activeTemplate.image,
      personalization: {
        foil,
        ribbonName: activeRibbon.name,
        waxSealName: activeSeal.name,
        suiteDetails: `${headline} · ${eventDate} · ${venue}`,
      },
    });
  };

  return (
    <section className="max-w-[1360px] mx-auto px-5 md:px-8 lg:px-12 pt-8 md:pt-12">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#FF8FB3] mb-2">
          Heidelberg Letterpress & Paper Studio
        </p>
        <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-[56px] font-light tracking-[-0.02em] text-[#FFF0F5] leading-[1.06]">
          Custom Event Stationery Studio
        </h1>
        <p className="mt-3 text-sm text-[#C98DA4] max-w-lg">
          Letterpress suites on 600gsm cotton rag with satin ribbon and wax.
        </p>
      </div>

      {/* Suite Template Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {STATIONERY_TEMPLATES.map((tpl) => {
          const selected = tpl.id === templateId;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleTemplateSelect(tpl.id)}
              className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                selected
                  ? 'bg-gradient-to-br from-[#4D142C] to-[#340C1D] border-[#FF8FB3] ring-2 ring-[#FF8FB3]/30 shadow-atelier-rest'
                  : 'bg-gradient-to-br from-[#340D1E] to-[#270916] border-[#6E2440] hover:border-[#C96B8E]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-[#FF8FB3]">{tpl.defaultPaper}</span>
                {selected && <Check className="w-4 h-4 text-[#FF8FB3]" />}
              </div>
              <h2 className="font-serif-editorial text-xl font-semibold text-[#FFF0F5]">
                {tpl.name}
              </h2>
              <p className="text-xs text-[#D996AE] mt-1">{tpl.subtitle}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left: Live Tabletop Three-Piece Suite Preview on Dark Velvet Mat */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#340D1E] via-[#2A0917] to-[#210712] border border-[#6E2440] rounded-3xl p-6 sm:p-10 space-y-6 shadow-atelier-rest">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#FF8FB3]">
            <span>Live Typesetting Proof</span>
            <span className="text-[#E8B4C6]">{activeTemplate.defaultPaper}</span>
          </div>

          {/* Three-piece Paper Ensemble */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Main Invitation Card (Physical 600gsm Cotton-Rag Paper Proof) */}
            <div className="md:col-span-7 bg-[#FFF3F7] border border-[#E07FA0] rounded-xl p-8 sm:p-10 text-center shadow-atelier-hover space-y-4">
              <div
                className="font-serif-editorial text-3xl sm:text-4xl font-semibold tracking-tight leading-tight"
                style={{ color: activeFoil.textHex }}
              >
                {headline || 'Your Headline'}
              </div>
              <div className="w-10 h-px bg-[#D86089] mx-auto" />
              <p className="text-sm text-[#781A3D] leading-relaxed max-w-xs mx-auto">
                {subline || 'Invite wording preview'}
              </p>
              <div className="pt-3 space-y-1 text-xs font-bold uppercase tracking-[0.14em] text-[#240814]">
                <p>{eventDate || 'Date & Time'}</p>
                <p className="text-[#781A3D] font-semibold">{venue || 'Venue Location'}</p>
              </div>
            </div>

            {/* Scalloped RSVP + Wax-Sealed Velvet Envelope */}
            <div className="md:col-span-5 space-y-5">
              {/* Scalloped RSVP Card with Ribbon Tie */}
              <div className="relative bg-[#FFF3F7] border-2 border-dashed border-[#D86089] rounded-2xl p-5 text-center shadow-atelier-rest stamp-card-surface">
                <div
                  className="h-3 w-24 mx-auto rounded-full mb-3"
                  style={{ backgroundColor: activeRibbon.hex }}
                />
                <p className="font-serif-editorial text-lg font-semibold text-[#240814] tracking-wider">
                  R.S.V.P.
                </p>
                <p className="text-[11px] text-[#781A3D] mt-1">
                  Kindly reply by the first of the month
                </p>
                <div className="mt-3 pt-2 border-t border-[#E07FA0] text-[11px] text-[#781A3D] space-y-1 text-left">
                  <p>___ Joyfully Accepts</p>
                  <p>___ Regretfully Declines</p>
                </div>
              </div>

              {/* Wax-Sealed Outer Velvet Envelope */}
              <div className="bg-gradient-to-br from-[#421126] to-[#2B0917] border border-[#7D2B4B] rounded-xl p-5 text-center shadow-atelier-rest">
                <div
                  className="mx-auto w-11 h-11 rounded-full flex items-center justify-center text-[#FCE4EC] border border-white/20 font-serif-editorial text-xl font-semibold shadow-sm mb-2"
                  style={{ backgroundColor: activeSeal.hex }}
                >
                  {activeSeal.motif}
                </div>
                <p className="text-xs font-bold text-[#FFF0F5]">{activeSeal.name}</p>
                <p className="text-[11px] text-[#E8B4C6]">
                  {activeRibbon.name} · {foil}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Typesetting & Order Controls */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#3A0F22] via-[#2F0B1B] to-[#250815] border border-[#6E2440] rounded-3xl p-6 sm:p-8 bevel-card space-y-5">
          <h2 className="font-serif-editorial text-3xl font-light tracking-[-0.01em] text-[#FFF0F5]">
            Suite Wording & Finish
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="suite-headline"
                className="block text-xs font-bold uppercase tracking-wider text-[#FFF0F5] mb-1.5"
              >
                Headline / Couple or Event Name
              </label>
              <input
                id="suite-headline"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#220712] border border-[#6E2440] text-sm text-[#FFF0F5] focus:outline-none focus:border-[#FF8FB3] focus:ring-4 focus:ring-[#FF8FB3]/15"
              />
            </div>

            <div>
              <label
                htmlFor="suite-subline"
                className="block text-xs font-bold uppercase tracking-wider text-[#FFF0F5] mb-1.5"
              >
                Invitation Subline
              </label>
              <textarea
                id="suite-subline"
                rows={2}
                value={subline}
                onChange={(e) => setSubline(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#220712] border border-[#6E2440] text-sm text-[#FFF0F5] focus:outline-none focus:border-[#FF8FB3] focus:ring-4 focus:ring-[#FF8FB3]/15"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="suite-date"
                  className="block text-xs font-bold uppercase tracking-wider text-[#FFF0F5] mb-1.5"
                >
                  Date & Hour
                </label>
                <input
                  id="suite-date"
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#220712] border border-[#6E2440] text-sm text-[#FFF0F5] focus:outline-none focus:border-[#FF8FB3]"
                />
              </div>
              <div>
                <label
                  htmlFor="suite-venue"
                  className="block text-xs font-bold uppercase tracking-wider text-[#FFF0F5] mb-1.5"
                >
                  Venue
                </label>
                <input
                  id="suite-venue"
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#220712] border border-[#6E2440] text-sm text-[#FFF0F5] focus:outline-none focus:border-[#FF8FB3]"
                />
              </div>
            </div>

            {/* Foil & Ribbon Pickers */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label
                  htmlFor="suite-foil"
                  className="block text-xs font-bold uppercase tracking-wider text-[#FFF0F5] mb-1.5"
                >
                  Ink / Foil
                </label>
                <select
                  id="suite-foil"
                  value={foil}
                  onChange={(e) => setFoil(e.target.value as FoilFinish)}
                  className="w-full h-11 px-3 rounded-xl bg-[#220712] border border-[#6E2440] text-sm font-semibold text-[#FFF0F5] focus:outline-none focus:border-[#FF8FB3] cursor-pointer"
                >
                  {FOIL_OPTIONS.map((f) => (
                    <option key={f.name} value={f.name} className="bg-[#240814] text-[#FFF0F5]">
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="suite-ribbon"
                  className="block text-xs font-bold uppercase tracking-wider text-[#FFF0F5] mb-1.5"
                >
                  Silk Ribbon
                </label>
                <select
                  id="suite-ribbon"
                  value={ribbonId}
                  onChange={(e) => setRibbonId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#220712] border border-[#6E2440] text-sm font-semibold text-[#FFF0F5] focus:outline-none focus:border-[#FF8FB3] cursor-pointer"
                >
                  {RIBBON_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[#240814] text-[#FFF0F5]">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[#FFF0F5] mb-2">
                Wax Seal Stamp
              </span>
              <div className="flex flex-wrap gap-2">
                {WAX_SEAL_OPTIONS.map((seal) => (
                  <button
                    key={seal.id}
                    type="button"
                    onClick={() => setSealId(seal.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                      sealId === seal.id
                        ? 'border-[#FF8FB3] bg-gradient-to-r from-[#FCE4EC] to-[#F5B8CD] text-[#240814]'
                        : 'border-[#6E2440] bg-[#220712] text-[#E8B4C6] hover:border-[#C96B8E]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/25"
                      style={{ backgroundColor: seal.hex }}
                    />
                    <span>{seal.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Suite Quantity Tier */}
            <div>
              <label
                htmlFor="suite-quantity"
                className="block text-xs font-bold uppercase tracking-wider text-[#FFF0F5] mb-1.5"
              >
                Print Run Quantity
              </label>
              <select
                id="suite-quantity"
                value={qtyId}
                onChange={(e) => setQtyId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#220712] border border-[#6E2440] text-sm font-semibold text-[#FFF0F5] focus:outline-none focus:border-[#FF8FB3] cursor-pointer"
              >
                {SUITE_QUANTITIES.map((q) => (
                  <option key={q.id} value={q.id} className="bg-[#240814] text-[#FFF0F5]">
                    {q.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[#6E2440]">
            <button
              type="button"
              onClick={handleAddToBag}
              className="w-full inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E84F82] to-[#B81D52] hover:from-[#F26694] hover:to-[#C9235B] text-[#FFF4F8] border border-[#FF9BBE]/35 text-sm font-bold cursor-pointer bevel-letterpress transition-transform hover:scale-[1.01]"
            >
              <ShoppingBag className="w-4 h-4 text-[#FFE6EF]" />
              <span>Add Stationery Suite</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
