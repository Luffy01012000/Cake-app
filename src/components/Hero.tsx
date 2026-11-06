"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronRight, Sparkles } from "lucide-react";
import { CakeProduct } from "../data/cakes";

interface HeroProps {
  onExplore: () => void;
  onOpenConfigurator: () => void;
  onSelectCake: (cake: CakeProduct) => void;
  featuredCake: CakeProduct;
}

export default function Hero({
  onExplore,
  onOpenConfigurator,
  onSelectCake,
  featuredCake,
}: HeroProps) {
  // Swatches for the Hero Finish selector
  const finishes = [
    { name: "Starlight Ivory", color: "#f0e4d3", image: "/images/wedding_cake.jpg", occasion: "Weddings & Grand Ceremonies" },
    { name: "Blush Rose", color: "#e8d0d0", image: "/images/birthday_cake.jpg", occasion: "Milestone Birthdays" },
    { name: "Midnight Truffle", color: "#2e3642", image: "/images/anniversary_cake.jpg", occasion: "Anniversaries & Romance" },
    { name: "Citrus Pistachio", color: "#dddc8c", image: "/images/gala_pistachio_cake.jpg", occasion: "Galas & Architecture" },
    { name: "Sky Azure", color: "#c8d8e0", image: "/images/baby_shower_cake.jpg", occasion: "Baby Showers & Revelations" },
  ];

  const [activeFinishIndex, setActiveFinishIndex] = useState(0);
  const currentFinish = finishes[activeFinishIndex];

  return (
    <section className="relative w-full bg-[#ffffff] dark:bg-[#000000] pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center flex flex-col items-center">
        
        {/* Nuevo Badge (Apple Warm Orange Accent #b64400) */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#b64400] dark:text-[#ff6934] text-[13px] font-medium tracking-tight">
            Nuevo
          </span>
          <span className="text-[#707070] dark:text-[#a1a1a6] text-[13px] tracking-tight">
            The 2026 Haute Pâtisserie Collection
          </span>
        </div>

        {/* Product Eyebrow */}
        <h2 className="text-[17px] sm:text-[19px] font-medium text-[#707070] dark:text-[#a1a1a6] mb-3 tracking-[-0.022em]">
          Bespoke Occasion Masterpieces
        </h2>

        {/* Cathedral of White Space Display Headline (80-96px weight 700 with -1.44px tracking) */}
        <h1 className="display-headline text-[#1d1d1f] dark:text-[#f5f5f7] max-w-[980px] tracking-[-1.44px] mb-6">
          Pure celebration. <br className="hidden sm:inline" />
          Architecturally elevated.
        </h1>

        {/* Canonical Body Copy */}
        <p className="body-canonical text-[#707070] dark:text-[#a1a1a6] max-w-[640px] mb-8 font-normal">
          Handcrafted architectural cakes for weddings, milestone birthdays, anniversaries, and grand galas.
          Sculpted with Grand Cru chocolates, organic botanical infusions, and 24k gold leaf.
        </p>

        {/* Action CTAs: Apple Electric Blue Pill and Wash Pill */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-4">
          <button
            onClick={onOpenConfigurator}
            className="btn-electric cursor-pointer text-[15px] px-7 py-3"
          >
            <Sparkles className="w-4 h-4 text-white/90" />
            Design Your Custom Cake
          </button>
          <button
            onClick={onExplore}
            className="btn-wash cursor-pointer text-[15px] px-6 py-3"
          >
            Explore Occasions
          </button>
        </div>

        {/* Pricing Subtitle */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 px-5 py-2 rounded-full bg-[#f5f5f7] dark:bg-[#161618] border border-[#d6d6d6]/50 dark:border-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] text-[15px] sm:text-[16px]">
          <span className="text-[#707070] dark:text-[#a1a1a6]">Signature tiers from</span>
          <strong className="text-[20px] sm:text-[22px] font-black text-[#1d1d1f] dark:text-[#f5f5f7] numr">$165</strong>
          <span className="text-[#d6d6d6] dark:text-[#38383a] hidden sm:inline">•</span>
          <span className="text-[#707070] dark:text-[#a1a1a6]">Couture grand tiers from</span>
          <strong className="text-[20px] sm:text-[22px] font-black text-[#1d1d1f] dark:text-[#f5f5f7] numr">$450</strong>
        </div>

        {/* Finish Swatch Selector */}
        <div className="flex flex-col items-center gap-2.5 mb-10">
          <span className="text-[12px] uppercase tracking-wider text-[#707070] dark:text-[#a1a1a6] font-medium">
            Finish & Palette — <strong className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">{currentFinish.name}</strong> ({currentFinish.occasion})
          </span>
          <div className="flex items-center gap-3 p-1.5 bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-full">
            {finishes.map((f, idx) => (
              <button
                key={f.name}
                onClick={() => setActiveFinishIndex(idx)}
                title={`${f.name} — ${f.occasion}`}
                aria-label={f.name}
                className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer relative ${
                  activeFinishIndex === idx
                    ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1c1c1e] ring-[#0071e3] dark:ring-[#2997ff] scale-110"
                    : "hover:scale-105 opacity-80 hover:opacity-100"
                }`}
                style={{ backgroundColor: f.color }}
              />
            ))}
          </div>
        </div>

        {/* Product Visual Presentation (Hero centerpiece) */}
        <div className="relative w-full max-w-[960px] aspect-[4/3] rounded-[28px] overflow-hidden bg-[#f5f5f7] dark:bg-[#161618] group transition-all duration-500">
          <Image
            src={currentFinish.image}
            alt={currentFinish.name}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 960px"
            className="object-cover object-center group-hover:scale-[1.015] transition-transform duration-700 ease-out"
          />

          {/* Subtle overlay badge for interactive trigger */}
          <div className="absolute bottom-6 left-6 right-6 sm:left-8 sm:right-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 dark:bg-[#1c1c1e]/85 backdrop-blur-md rounded-[20px] p-4 sm:px-6 border border-white/60 dark:border-white/10">
            <div>
              <div className="text-[12px] uppercase tracking-wider text-[#707070] dark:text-[#a1a1a6] font-medium">
                Featured Occasion Piece
              </div>
              <div className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                {currentFinish.name} Edition
              </div>
            </div>

            <button
              onClick={() => onSelectCake(featuredCake)}
              className="text-[#0066cc] dark:text-[#2997ff] hover:text-[#0071e3] font-medium text-[14px] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              View detailed specifications
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
