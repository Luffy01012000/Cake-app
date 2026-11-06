"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Check, Calendar, ShieldCheck } from "lucide-react";
import { CakeProduct, FLAVOR_PALETTES } from "../data/cakes";
import DatePickerModal from "./DatePickerModal";

interface AtelierConfiguratorProps {
  onAddCustomCake: (customItem: {
    cake: CakeProduct;
    customInscription: string;
    flavorChoice: string;
    deliveryDate: string;
  }) => void;
  onClose?: () => void;
}

export default function AtelierConfigurator({
  onAddCustomCake,
  onClose,
}: AtelierConfiguratorProps) {
  const [occasion, setOccasion] = useState<string>("Weddings");
  const [tiers, setTiers] = useState<number>(3);
  const [flavorIndex, setFlavorIndex] = useState<number>(0);
  const [finishStyle, setFinishStyle] = useState<string>("Botanical Sugar Blooms & 24k Gold");
  const [inscription, setInscription] = useState<string>("Céleste & Julian • 2026");
  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const tierOptions = [
    {
      tiers: 1,
      name: "Petite Salon",
      servings: "10–14 guests",
      basePrice: 180,
      image: "/images/romance_blush_cake.jpg",
      description: "Ideal for intimate birthday celebrations, romantic dinners, and elopements.",
    },
    {
      tiers: 2,
      name: "Classic Celebration",
      servings: "28–35 guests",
      basePrice: 340,
      image: "/images/anniversary_cake.jpg",
      description: "Perfect for anniversaries, milestones, and sophisticated baby showers.",
    },
    {
      tiers: 3,
      name: "Grand Tier",
      servings: "65–80 guests",
      basePrice: 650,
      image: "/images/wedding_cake.jpg",
      description: "Our signature wedding and milestone gala architectural centerpiece.",
    },
    {
      tiers: 4,
      name: "Gala Imperial",
      servings: "100–130 guests",
      basePrice: 920,
      image: "/images/gala_pistachio_cake.jpg",
      description: "Monumental presence for high-society weddings, brand galas, and balls.",
    },
  ];

  const finishStyles = [
    { id: "blooms", name: "Botanical Sugar Blooms & 24k Gold", extra: 50 },
    { id: "gold-drape", name: "Sculptural 24k Gold Ganache Drape", extra: 60 },
    { id: "minimalist", name: "Velvet Matte Minimalist Clean Edge", extra: 0 },
    { id: "geometric", name: "Modern Geometric Cantilever Bevels", extra: 75 },
  ];

  const currentTier = tierOptions.find((t) => t.tiers === tiers) || tierOptions[2];
  const selectedFinish = finishStyles.find((f) => f.name === finishStyle) || finishStyles[0];
  const selectedFlavor = FLAVOR_PALETTES[flavorIndex];

  const calculatedPrice = currentTier.basePrice + selectedFinish.extra;

  const handleBuildAndAdd = () => {
    const customCakeObj: CakeProduct = {
      id: `atelier-${Date.now()}`,
      name: `Atelier Custom ${currentTier.name}`,
      tagline: `Bespoke ${occasion} Commission`,
      occasion: occasion as CakeProduct["occasion"],
      price: calculatedPrice,
      image: currentTier.image,
      finishColor: selectedFlavor.color,
      swatchName: selectedFlavor.name,
      servings: currentTier.servings,
      tiers: currentTier.tiers,
      flavors: [selectedFlavor.name],
      description: `Custom ${tiers}-tier commission with ${selectedFinish.name}. Flavored with ${selectedFlavor.name}. Plaque: "${inscription}".`,
      tastingNotes: [selectedFlavor.notes],
      dimensions: `Custom ${tiers}-Tier Architectural Build`,
      leadTime: "Requires 5 days",
    };

    onAddCustomCake({
      cake: customCakeObj,
      customInscription: inscription,
      flavorChoice: selectedFlavor.name,
      deliveryDate: deliveryDate,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose?.();
    }, 2000);
  };

  return (
    <section
      id="atelier-configurator"
      className="w-full bg-[#f5f5f7] py-24 sm:py-32"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-[800px] mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-[13px] uppercase tracking-wider text-[#0071e3] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Atelier Bespoke Studio
          </div>
          <h2 className="heading-md text-[#1d1d1f] mb-4">
            Architect your own occasion centerpiece.
          </h2>
          <p className="body-canonical text-[#707070]">
            Customize every millimeter: choose your occasion, structural tiers, gourmet flavor symphony,
            and hand-lettered gold inscription.
          </p>
        </div>

        {/* Configurator 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Live Visual Render & Summary (5 cols) */}
          <div className="lg:col-span-5 sticky top-20 bg-white rounded-[28px] p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] uppercase tracking-wider text-[#707070] font-semibold">
                  Live Atelier Render
                </span>
                <span className="text-[13px] font-medium text-[#0071e3] bg-[#0071e3]/10 px-3 py-1 rounded-full">
                  {occasion}
                </span>
              </div>

              {/* Live Image based on Tiers */}
              <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden bg-[#f5f5f7] mb-6">
                <Image
                  src={currentTier.image}
                  alt={currentTier.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/60 text-xs">
                  <div className="font-semibold text-[#1d1d1f] truncate">
                    Inscription: &ldquo;{inscription || "No Custom Inscription"}&rdquo;
                  </div>
                  <div className="text-[#707070] text-[11px] mt-0.5 truncate">
                    {selectedFlavor.name} • {selectedFinish.name}
                  </div>
                </div>
              </div>

              {/* Spec sheet */}
              <div className="space-y-3 pt-2 text-[14px] text-[#474747]">
                <div className="flex justify-between py-2 border-b border-[#f5f5f7]">
                  <span className="text-[#707070]">Structural Build</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    {currentTier.name} ({tiers} {tiers === 1 ? "Tier" : "Tiers"})
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#f5f5f7]">
                  <span className="text-[#707070]">Servings</span>
                  <span className="font-semibold text-[#1d1d1f]">{currentTier.servings}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#f5f5f7]">
                  <span className="text-[#707070]">Flavor Symphony</span>
                  <span className="font-semibold text-[#1d1d1f] text-right max-w-[200px] truncate">
                    {selectedFlavor.name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#f5f5f7]">
                  <span className="text-[#707070]">Finishing Art</span>
                  <span className="font-semibold text-[#1d1d1f] text-right max-w-[200px] truncate">
                    {selectedFinish.name}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#707070]">Delivery Chamber</span>
                  <span className="font-semibold text-[#1d1d1f] flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 inline" /> Climate-controlled
                  </span>
                </div>
              </div>
            </div>

            {/* Total & Action */}
            <div className="pt-6 mt-6 border-t border-[#d6d6d6]/60">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-xs text-[#707070] block uppercase tracking-wider font-semibold">Total Custom Price</span>
                  <span className="text-4xl sm:text-5xl font-black text-[#1d1d1f] numr tracking-tight">${calculatedPrice}</span>
                </div>
                <span className="text-xs text-[#707070] text-right">Includes custom plaque & temperature courier</span>
              </div>

              <button
                onClick={handleBuildAndAdd}
                disabled={isSuccess}
                className={`w-full py-4 px-6 rounded-full font-semibold text-[16px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  isSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-[#0071e3] hover:bg-[#0077ed] text-white"
                }`}
              >
                {isSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    Custom Cake Added to Bag
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-white/80" />
                    Add Custom Cake • ${calculatedPrice}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-8 bg-white rounded-[28px] p-8 sm:p-10 shadow-sm">
            
            {/* Step 1: Occasion */}
            <div>
              <label className="block text-[13px] uppercase tracking-wider text-[#707070] font-semibold mb-3">
                1. Select Occasion
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {["Weddings", "Birthdays", "Anniversaries", "Baby Showers", "Galas"].map((occ) => (
                  <button
                    key={occ}
                    onClick={() => setOccasion(occ)}
                    className={`py-2.5 px-4 rounded-xl text-[14px] font-medium transition-all text-center cursor-pointer border ${
                      occasion === occ
                        ? "border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]"
                        : "border-[#d6d6d6]/80 text-[#1d1d1f] hover:bg-[#f5f5f7]"
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Tiers & Servings */}
            <div>
              <label className="block text-[13px] uppercase tracking-wider text-[#707070] font-semibold mb-3">
                2. Structure & Capacity
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tierOptions.map((opt) => (
                  <div
                    key={opt.tiers}
                    onClick={() => setTiers(opt.tiers)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      tiers === opt.tiers
                        ? "border-[#0071e3] bg-[#0071e3]/5 ring-1 ring-[#0071e3]"
                        : "border-[#d6d6d6]/80 hover:bg-[#fafafc]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[15px] text-[#1d1d1f]">
                        {opt.name}
                      </span>
                      <span className="text-[20px] font-bold text-[#1d1d1f] numr">
                        ${opt.basePrice}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#0071e3] font-medium mb-1">
                      {opt.tiers} {opt.tiers === 1 ? "Tier" : "Tiers"} • {opt.servings}
                    </div>
                    <p className="text-[12px] text-[#707070] leading-snug">
                      {opt.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Flavor Symphony */}
            <div>
              <label className="block text-[13px] uppercase tracking-wider text-[#707070] font-semibold mb-3">
                3. Flavor Symphony
              </label>
              <div className="space-y-2.5">
                {FLAVOR_PALETTES.map((flav, idx) => (
                  <div
                    key={flav.id}
                    onClick={() => setFlavorIndex(idx)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      flavorIndex === idx
                        ? "border-[#0071e3] bg-[#0071e3]/5 ring-1 ring-[#0071e3]"
                        : "border-[#d6d6d6]/80 hover:bg-[#fafafc]"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 mt-0.5 border border-black/10 shadow-sm"
                      style={{ backgroundColor: flav.color }}
                    />
                    <div className="flex-1">
                      <div className="text-[14px] font-semibold text-[#1d1d1f]">
                        {flav.name}
                      </div>
                      <div className="text-[12px] text-[#707070] mt-0.5">
                        {flav.notes}
                      </div>
                    </div>
                    {flavorIndex === idx && (
                      <Check className="w-4 h-4 text-[#0071e3] shrink-0 mt-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: Finishing Texture & Art */}
            <div>
              <label className="block text-[13px] uppercase tracking-wider text-[#707070] font-semibold mb-3">
                4. Exterior Art & Finish
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {finishStyles.map((fin) => (
                  <button
                    key={fin.id}
                    onClick={() => setFinishStyle(fin.name)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                      finishStyle === fin.name
                        ? "border-[#0071e3] bg-[#0071e3]/5 text-[#1d1d1f]"
                        : "border-[#d6d6d6]/80 text-[#707070] hover:bg-[#fafafc]"
                    }`}
                  >
                    <span className="text-[13px] font-medium text-[#1d1d1f]">
                      {fin.name}
                    </span>
                    <span className="text-[14px] font-bold text-[#1d1d1f] numr shrink-0 ml-2">
                      {fin.extra > 0 ? `+$${fin.extra}` : <span className="text-emerald-600 font-semibold text-xs">Included</span>}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Custom Inscription Plaque & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] uppercase tracking-wider text-[#707070] font-semibold mb-2">
                  5. Hand-Piped Plaque Text
                </label>
                <input
                  type="text"
                  value={inscription}
                  onChange={(e) => setInscription(e.target.value)}
                  placeholder="e.g. Happy 30th Caroline"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#d6d6d6] text-[14px] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              {/* Whole-Field Clickable Date Selector (Opens Popup Modal Picker) */}
              <div
                onClick={() => setIsDatePickerOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-[#d6d6d6] hover:border-[#0071e3] transition-all bg-white cursor-pointer group flex items-center justify-between select-none shadow-2xs hover:shadow-xs"
              >
                <div className="flex-1">
                  <span className="block text-[11px] uppercase tracking-wider text-[#707070] font-semibold cursor-pointer">
                    Delivery / Event Date
                  </span>
                  <div className="text-[14px] font-bold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors mt-0.5">
                    {deliveryDate
                      ? new Date(deliveryDate + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Select date"}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#f5f5f7] group-hover:bg-[#0071e3]/10 flex items-center justify-center transition-colors">
                  <Calendar className="w-4 h-4 text-[#707070] group-hover:text-[#0071e3] transition-colors" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Date Picker Popup Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={deliveryDate}
        onSelectDate={(newDate) => setDeliveryDate(newDate)}
        title="Atelier Delivery Date"
      />
    </section>
  );
}
