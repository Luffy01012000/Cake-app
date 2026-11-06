import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function Footer({
  onOpenConfigurator,
}: {
  onSelectOccasion?: (occ: string) => void;
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
              {[
                { name: "Weddings", slug: "weddings" },
                { name: "Birthdays", slug: "birthdays" },
                { name: "Anniversaries", slug: "anniversaries" },
                { name: "Baby Showers", slug: "baby-showers" },
                { name: "Galas", slug: "galas" },
              ].map((occ) => (
                <li key={occ.slug}>
                  <Link
                    href={`/occasions/${occ.slug}`}
                    className="hover:text-[#1d1d1f] hover:underline"
                  >
                    {occ.name} Cakes
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-semibold text-[#1d1d1f] mb-3">
              Atelier & Catalog
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/cakes" className="hover:text-[#1d1d1f] hover:underline">
                  Full Cake Catalog
                </Link>
              </li>
              <li>
                <button
                  onClick={onOpenConfigurator}
                  className="hover:text-[#1d1d1f] hover:underline cursor-pointer"
                >
                  Cake Architecture Studio
                </button>
              </li>
              <li>
                <a href="/sitemap.xml" className="hover:text-[#1d1d1f] hover:underline">
                  XML Sitemap
                </a>
              </li>
              <li>
                <a href="/robots.txt" className="hover:text-[#1d1d1f] hover:underline">
                  Robots & AI Directives
                </a>
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
            <Link href="/cakes" className="hover:underline">Catalog</Link>
            <span>•</span>
            <Link href="/admin" className="hover:underline inline-flex items-center gap-1 text-[#0071e3] font-medium">
              <Lock className="w-3 h-3" />
              SEO & Admin Panel
            </Link>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
