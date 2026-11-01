"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

export default function Footer({
  onSelectOccasion,
  onOpenConfigurator,
}: {
  onSelectOccasion: (occ: string) => void;
  onOpenConfigurator: () => void;
}) {
  return (
    <footer className="w-full bg-[#f5f5f7] text-[#707070] text-[12px] pt-14 pb-16 border-t border-[#d6d6d6]/40">
      <div className="max-w-[1024px] mx-auto px-4 sm:px-8">
        
        {/* Footnote Disclaimers */}
        <div className="space-y-2.5 pb-8 border-b border-[#d6d6d6]/60 leading-relaxed font-normal">
          <p>
            1. Bespoke Commissions: All tiered occasion cakes are handcrafted to order in our Parisian-trained laboratory. Please allow minimum lead times (24 hours for single tiers, 5 to 7 business days for multi-tier wedding centerpieces).
          </p>
          <p>
            2. Climate-Controlled Guarantee: Transported within custom-calibrated insulated chambers monitored at 4°C with gyroscopic stabilization. White-glove delivery available across Manhattan, Brooklyn, Hamptons, London Zone 1-4, and Île-de-France.
          </p>
          <p>
            3. Private Tasting Flight credit: The $75 flight fee is applied as a direct deduction against any custom wedding or gala commission valued at $300 or more.
          </p>
        </div>

        {/* Directory Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-b border-[#d6d6d6]/60">
          <div>
            <h4 className="text-[12px] font-semibold text-[#1d1d1f] mb-3">
              Occasions
            </h4>
            <ul className="space-y-2">
              {["Weddings", "Birthdays", "Anniversaries", "Baby Showers", "Galas"].map((occ) => (
                <li key={occ}>
                  <button
                    onClick={() => {
                      onSelectOccasion(occ);
                      document.getElementById("occasions-catalog")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="hover:text-[#1d1d1f] hover:underline cursor-pointer"
                  >
                    {occ} Cakes
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-semibold text-[#1d1d1f] mb-3">
              Atelier & Services
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenConfigurator}
                  className="hover:text-[#1d1d1f] hover:underline cursor-pointer"
                >
                  Cake Architecture Studio
                </button>
              </li>
              <li>
                <a href="#occasions-catalog" className="hover:text-[#1d1d1f] hover:underline">
                  Private Tasting Flight
                </a>
              </li>
              <li>
                <span className="hover:text-[#1d1d1f] cursor-pointer">
                  Venue Logistics & Staging
                </span>
              </li>
              <li>
                <span className="hover:text-[#1d1d1f] cursor-pointer">
                  Dietary & Allergens Guide
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-semibold text-[#1d1d1f] mb-3">
              Flavors & Terroir
            </h4>
            <ul className="space-y-2">
              <li><span>Tahitian Bourbon Vanilla</span></li>
              <li><span>Valrhona 72% Araguani Truffle</span></li>
              <li><span>Bronte Pistachio & Japanese Yuzu</span></li>
              <li><span>Ispahan Mountain Rose Compote</span></li>
              <li><span>Earl Grey Bergamot Cloud</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-semibold text-[#1d1d1f] mb-3">
              AURA Flagships
            </h4>
            <ul className="space-y-2">
              <li><span>New York — Madison Avenue</span></li>
              <li><span>London — Mayfair, W1K</span></li>
              <li><span>Paris — Rue du Faubourg Saint-Honoré</span></li>
              <li><span>Zurich — Bahnhofstrasse</span></li>
            </ul>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#707070]">
          <div>
            Copyright © 2026 AURA Pâtisserie Haute Couture Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms of Commission</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Sales & Refunds</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Legal</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
