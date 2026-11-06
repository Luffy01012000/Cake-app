"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Check, ShieldCheck, Plus, Clock, Users, Ruler } from "lucide-react";
import { CakeProduct } from "../data/cakes";

interface CakeModalProps {
  cake: CakeProduct | null;
  onClose: () => void;
  onAddToCart: (cake: CakeProduct, inscription?: string) => void;
}

export default function CakeModal({
  cake,
  onClose,
  onAddToCart,
}: CakeModalProps) {
  const [inscription, setInscription] = useState("");
  const [added, setAdded] = useState(false);

  // Disable background page scrollbar when modal is open
  React.useEffect(() => {
    if (cake) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [cake]);

  if (!cake) return null;

  const handleAdd = () => {
    onAddToCart(cake, inscription);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 dark:bg-black/70 backdrop-blur-sm animate-fade-in cursor-pointer"
    >
      <div
        className="relative w-full max-w-[880px] max-h-[92vh] overflow-y-auto bg-white dark:bg-[#1c1c1e] border border-transparent dark:border-[#2c2c2e] rounded-[28px] p-6 sm:p-10 shadow-2xl transition-all cursor-default modal-seamless-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#e8e8ed] dark:hover:bg-[#38383a] flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Cake Image */}
          <div>
            <div className="relative aspect-[4/3] rounded-[22px] overflow-hidden bg-[#f5f5f7] dark:bg-[#161618] mb-4">
              <Image
                src={cake.image}
                alt={cake.name}
                fill
                sizes="(max-width: 768px) 100vw, 440px"
                className="object-cover"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-[#f5f5f7] dark:bg-[#242426] rounded-xl text-xs text-[#474747] dark:text-[#d1d1d6]">
              <span
                className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: cake.finishColor }}
              />
              <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{cake.swatchName} Finish</span>
              <span className="text-[#707070] dark:text-[#a1a1a6]">• Natural Cocoa Butter Velour</span>
            </div>
          </div>

          {/* Right Column: Specs & Ordering */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#0071e3] dark:text-[#2997ff] bg-[#0071e3]/10 dark:bg-[#2997ff]/15 px-2.5 py-0.5 rounded-full">
                  {cake.occasion}
                </span>
                {cake.isNew && (
                  <span className="text-xs uppercase tracking-wider font-semibold text-white bg-[#b64400] px-2 py-0.5 rounded-full">
                    New 2026
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight mb-2">
                {cake.name}
              </h2>
              <p className="text-sm text-[#707070] dark:text-[#a1a1a6] mb-4">
                {cake.tagline}
              </p>

              {/* Prominent Bold Pricing */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-xs uppercase tracking-wider text-[#707070] dark:text-[#a1a1a6] font-semibold">Price:</span>
                <span className="text-3xl sm:text-4xl font-black text-[#1d1d1f] dark:text-[#f5f5f7] numr tracking-tight">
                  ${cake.price}
                </span>
                <span className="text-xs text-[#707070] dark:text-[#a1a1a6] ml-1">Includes personalized gold plaque</span>
              </div>

              <p className="text-sm text-[#474747] dark:text-[#d1d1d6] leading-relaxed mb-6">
                {cake.description}
              </p>

              {/* Key Specs Icons */}
              <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-[#f5f5f7] dark:bg-[#242426] rounded-2xl text-xs text-[#474747] dark:text-[#d1d1d6]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                  <span><strong>Servings:</strong> {cake.servings}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                  <span><strong>Structure:</strong> {cake.tiers} Tier{cake.tiers > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                  <span><strong>Lead Time:</strong> {cake.leadTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span><strong>Logistics:</strong> 4°C Courier</span>
                </div>
              </div>

              {/* Tasting Notes */}
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#707070] dark:text-[#a1a1a6] mb-2">
                  Sommelier Tasting Profile
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {cake.tastingNotes.map((note) => (
                    <span
                      key={note}
                      className="text-xs bg-white dark:bg-[#202023] border border-[#d6d6d6] dark:border-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] px-3 py-1 rounded-full"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom Plaque Inscription */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#707070] dark:text-[#a1a1a6] mb-2">
                  Complimentary Gold Plaque Inscription
                </label>
                <input
                  type="text"
                  placeholder="e.g. Forever Yours • 2026"
                  value={inscription}
                  onChange={(e) => setInscription(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-[#d6d6d6] dark:border-[#2c2c2e] bg-white dark:bg-[#161618] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                />
              </div>
            </div>

            {/* Action */}
            <button
              onClick={handleAdd}
              disabled={added}
              className={`w-full py-4 px-6 rounded-full font-semibold text-[15px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0071e3] hover:bg-[#0077ed] text-white"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Your Bag
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add to Bag • ${cake.price}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
