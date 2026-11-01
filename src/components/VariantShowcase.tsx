"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { CakeProduct, CAKE_CATALOG } from "../data/cakes";

interface VariantShowcaseProps {
  onSelectCake: (cake: CakeProduct) => void;
  onAddToCart: (cake: CakeProduct) => void;
}

export default function VariantShowcase({
  onSelectCake,
  onAddToCart,
}: VariantShowcaseProps) {
  const blushCake = CAKE_CATALOG.find((c) => c.id === "blush-seraphina-birthday") || CAKE_CATALOG[1];
  const midnightCake = CAKE_CATALOG.find((c) => c.id === "nocturne-anniversary-velvet") || CAKE_CATALOG[2];

  const [activeVariant, setActiveVariant] = useState<"blush" | "midnight">("blush");

  return (
    <section className="w-full bg-[#ffffff] dark:bg-[#000000] py-24 sm:py-32 transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-[800px] mx-auto mb-16">
          <div className="text-[13px] uppercase tracking-wider text-[#b64400] dark:text-[#ff6934] font-medium mb-2">
            Signature Finishes
          </div>
          <h2 className="heading-md text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
            Which finish tells your story?
          </h2>
          <p className="body-canonical text-[#707070] dark:text-[#a1a1a6]">
            From the romantic light of Blush Rose to the deep mystery of Nocturne Truffle.
            Every finish is engineered with natural cocoa butter velour and bespoke edible botanical art.
          </p>
        </div>

        {/* Two-Column Side-by-Side Cards at 28px Radius on #f5f5f7 canvas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Blush Rose */}
          <div className="card-apple bg-[#f5f5f7] dark:bg-[#161618] border border-transparent dark:border-[#2c2c2e] p-6 sm:p-10 flex flex-col justify-between group transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[12px] uppercase tracking-wider text-[#707070] dark:text-[#a1a1a6] font-semibold">
                    Finish 01
                  </span>
                  <h3 className="text-[26px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                    Blush Rose Velvet
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#e8d0d0] border border-black/10 shadow-inner" />
              </div>

              {/* Side-by-side Product Render with 28px radius */}
              <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-white dark:bg-[#121214] mb-6">
                <Image
                  src={blushCake.image}
                  alt={blushCake.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-[14px] text-[#474747] dark:text-[#d1d1d6]">
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Occasion:</span>
                  <span>Milestone Birthdays, Romantic Anniversaries, Haute Luncheons</span>
                </div>
                <div className="flex items-center gap-2 text-[14px] text-[#474747] dark:text-[#d1d1d6]">
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Profile:</span>
                  <span>Wild Alpine Raspberry, Ispahan Rose, Valrhona Ivoire</span>
                </div>
                <div className="text-[14px] text-[#707070] dark:text-[#a1a1a6] leading-relaxed">
                  Soft, luminous, and delightfully aromatic. Sprayed with micro-fine natural cocoa butter velvet for a powdery matte texture that melts at body temperature.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-[#d6d6d6]/60 dark:border-[#2c2c2e]">
              <div>
                <span className="text-[11px] uppercase text-[#707070] dark:text-[#a1a1a6] font-semibold block tracking-wider">Price</span>
                <span className="text-[28px] sm:text-[32px] font-black text-[#1d1d1f] dark:text-[#f5f5f7] numr tracking-tight">
                  ${blushCake.price}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectCake(blushCake)}
                  className="text-[14px] text-[#0066cc] dark:text-[#2997ff] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  Inspect Piece
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onAddToCart(blushCake)}
                  className="btn-electric text-[14px] py-2 px-5 cursor-pointer"
                >
                  Order Piece
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Midnight Truffle */}
          <div className="card-apple bg-[#f5f5f7] dark:bg-[#161618] border border-transparent dark:border-[#2c2c2e] p-6 sm:p-10 flex flex-col justify-between group transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[12px] uppercase tracking-wider text-[#707070] dark:text-[#a1a1a6] font-semibold">
                    Finish 02
                  </span>
                  <h3 className="text-[26px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                    Nocturne Truffle & Gold
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#2e3642] border border-black/10 shadow-inner" />
              </div>

              {/* Product Visual */}
              <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-white dark:bg-[#121214] mb-6">
                <Image
                  src={midnightCake.image}
                  alt={midnightCake.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-[14px] text-[#474747] dark:text-[#d1d1d6]">
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Occasion:</span>
                  <span>Intimate Anniversaries, Modern Galas, Luxury Celebrations</span>
                </div>
                <div className="flex items-center gap-2 text-[14px] text-[#474747] dark:text-[#d1d1d6]">
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Profile:</span>
                  <span>72% Araguani Dark Chocolate, Smoked Fleur de Sel, Bourbon</span>
                </div>
                <div className="text-[14px] text-[#707070] dark:text-[#a1a1a6] leading-relaxed">
                  Sculptural drama in edible art. Features a hand-molded chocolate wave gilded with genuine 24-karat gold leaf, providing an intoxicating, rich tasting journey.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-[#d6d6d6]/60 dark:border-[#2c2c2e]">
              <div>
                <span className="text-[11px] uppercase text-[#707070] dark:text-[#a1a1a6] font-semibold block tracking-wider">Price</span>
                <span className="text-[28px] sm:text-[32px] font-black text-[#1d1d1f] dark:text-[#f5f5f7] numr tracking-tight">
                  ${midnightCake.price}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectCake(midnightCake)}
                  className="text-[14px] text-[#0066cc] dark:text-[#2997ff] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  Inspect Piece
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onAddToCart(midnightCake)}
                  className="btn-electric text-[14px] py-2 px-5 cursor-pointer"
                >
                  Order Piece
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
