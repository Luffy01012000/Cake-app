"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Eye, Check } from "lucide-react";
import { CakeProduct, CAKE_CATALOG } from "../data/cakes";

interface OccasionTabsProps {
  onQuickView: (cake: CakeProduct) => void;
  onAddToCart: (cake: CakeProduct) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export default function OccasionTabs({
  onQuickView,
  onAddToCart,
  activeFilter,
  setActiveFilter,
}: OccasionTabsProps) {
  const [addedId, setAddedId] = useState<string | null>(null);

  const occasions = [
    "All Occasions",
    "Weddings",
    "Birthdays",
    "Anniversaries",
    "Baby Showers",
    "Galas",
  ];

  const filteredCakes =
    activeFilter === "All Occasions"
      ? CAKE_CATALOG
      : CAKE_CATALOG.filter((cake) => cake.occasion === activeFilter);

  const handleAdd = (cake: CakeProduct) => {
    onAddToCart(cake);
    setAddedId(cake.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section
      id="occasions-catalog"
      className="w-full bg-[#f5f5f7] py-24 sm:py-32"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="text-[13px] uppercase tracking-wider text-[#707070] font-medium mb-2">
            The Commission Collection
          </div>
          <h2 className="text-[32px] sm:text-[44px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
            Cakes engineered for milestone moments.
          </h2>
          <p className="text-[19px] text-[#707070] max-w-[700px] font-normal leading-relaxed">
            Every creation is designed from scratch around your event’s theme, guest count, and flavor preferences.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none">
          {occasions.map((occ) => (
            <button
              key={occ}
              onClick={() => setActiveFilter(occ)}
              className={`px-5 py-2.5 rounded-full text-[14px] font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeFilter === occ
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-white text-[#1d1d1f] hover:bg-[#e8e8ed]"
              }`}
            >
              {occ}
            </button>
          ))}
        </div>

        {/* 2-Column or 3-Column Card Grid (28px radius, NO shadow, white background) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCakes.map((cake) => (
            <div
              key={cake.id}
              className="bg-[#ffffff] rounded-[28px] overflow-hidden flex flex-col transition-all duration-300 hover:translate-y-[-4px] group"
            >
              {/* Product Visual */}
              <div className="relative aspect-[4/3] w-full bg-[#f5f5f7] overflow-hidden">
                <Image
                  src={cake.image}
                  alt={cake.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-white/90 backdrop-blur-md text-[#1d1d1f] text-[12px] font-medium px-3 py-1 rounded-full">
                    {cake.occasion}
                  </span>
                  {cake.isNew && (
                    <span className="bg-[#b64400] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>

                {/* Swatch indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full">
                  <span
                    className="w-3 h-3 rounded-full border border-black/10"
                    style={{ backgroundColor: cake.finishColor }}
                  />
                  <span className="text-[11px] font-medium text-[#474747]">
                    {cake.swatchName}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-7 sm:p-8 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                    <h3 className="text-[21px] font-semibold text-[#1d1d1f] tracking-tight">
                      {cake.name}
                    </h3>
                    <div className="flex items-baseline gap-1 shrink-0">
                      <span className="text-[12px] uppercase text-[#707070] font-semibold tracking-wider">from</span>
                      <span className="text-[26px] sm:text-[28px] font-black text-[#1d1d1f] tracking-tight numr">
                        ${cake.price}
                      </span>
                    </div>
                  </div>

                  <p className="text-[14px] text-[#707070] line-clamp-2 mb-4 leading-relaxed">
                    {cake.description}
                  </p>

                  {/* Specs Pill Summary */}
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="text-[12px] bg-[#f5f5f7] text-[#474747] px-2.5 py-1 rounded-md">
                      {cake.servings}
                    </span>
                    <span className="text-[12px] bg-[#f5f5f7] text-[#474747] px-2.5 py-1 rounded-md">
                      {cake.tiers} {cake.tiers === 1 ? "Tier" : "Tiers"}
                    </span>
                    <span className="text-[12px] bg-[#f5f5f7] text-[#474747] px-2.5 py-1 rounded-md">
                      Lead: {cake.leadTime}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#f5f5f7]">
                  <button
                    onClick={() => handleAdd(cake)}
                    className={`flex-1 py-2.5 px-4 rounded-full text-[14px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                      addedId === cake.id
                        ? "bg-emerald-600 text-white"
                        : "bg-[#0071e3] hover:bg-[#0077ed] text-white"
                    }`}
                  >
                    {addedId === cake.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Added to Bag
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add to Bag
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onQuickView(cake)}
                    aria-label="Quick View"
                    className="p-2.5 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-[#474747]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
