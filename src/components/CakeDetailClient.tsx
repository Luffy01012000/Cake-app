"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Check,
  Sparkles,
  Layers,
  Users,
  Ruler,
  Clock,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { CakeWithFaqs } from "@/lib/data-service";

interface CakeDetailClientProps {
  cake: CakeWithFaqs;
  relatedCakes: CakeWithFaqs[];
}

export default function CakeDetailClient({
  cake,
  relatedCakes,
}: CakeDetailClientProps) {
  const [selectedFlavor, setSelectedFlavor] = useState(cake.flavors[0] || "Signature Vanilla");
  const [customInscription, setCustomInscription] = useState("");
  const [added, setAdded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header Bar with Back to Home & Catalog */}
      <nav aria-label="Breadcrumb" className="bg-[#fafafc] border-b border-[#e5e5ea] py-3 px-4 sm:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center flex-wrap gap-2 text-[13px] text-[#707070]">
          <Link href="/" className="hover:text-[#1d1d1f] hover:underline">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/cakes" className="hover:text-[#1d1d1f] hover:underline">
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/occasions/${cake.occasion.toLowerCase().replace(/\s+/g, "-")}`}
            className="hover:text-[#1d1d1f] hover:underline"
          >
            {cake.occasion}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1d1d1f] font-medium truncate max-w-[250px]">
            {cake.name}
          </span>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {/* Product Section Grid */}
        <article className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
          {/* Left Column: Visual & Caption */}
          <section className="lg:col-span-7 space-y-6">
            <figure className="relative aspect-[4/3] w-full rounded-[24px] overflow-hidden bg-[#f5f5f7] border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <Image
                src={cake.image}
                alt={cake.imageAlt || `${cake.name} architectural luxury cake`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
              {cake.isNew && (
                <div className="absolute top-4 left-4 bg-[#b64400] text-white text-[12px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  New Haute Release
                </div>
              )}
            </figure>

            {cake.imageCaption && (
              <figcaption className="text-[13px] text-[#707070] italic text-center max-w-[90%] mx-auto">
                {cake.imageCaption}
              </figcaption>
            )}

            {/* Tasting Notes & Culinary Highlights */}
            {cake.tastingNotes && cake.tastingNotes.length > 0 && (
              <div className="bg-[#fafafc] rounded-[20px] p-6 border border-[#e5e5ea] space-y-3">
                <h2 className="text-[14px] font-semibold text-[#1d1d1f] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#b64400]" />
                  Sommelier Tasting Profile
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cake.tastingNotes.map((note, i) => (
                    <span
                      key={i}
                      className="bg-white border border-[#d6d6d6] text-[#474747] text-[13px] px-3.5 py-1.5 rounded-full"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Right Column: Key Details & Purchasing */}
          <section className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Link
                  href={`/occasions/${cake.occasion.toLowerCase().replace(/\s+/g, "-")}`}
                  className="inline-block bg-[#0071e3]/10 text-[#0071e3] text-[12px] font-semibold px-3 py-1 rounded-full hover:bg-[#0071e3]/20 transition-colors uppercase tracking-wider"
                >
                  {cake.occasion} Collection
                </Link>
                <span className="text-[12px] text-[#707070]">•</span>
                <span className="text-[12px] text-[#707070] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Lead: {cake.leadTime}
                </span>
              </div>

              <h1 className="text-[32px] sm:text-[40px] font-bold text-[#1d1d1f] tracking-tight leading-tight">
                {cake.name}
              </h1>

              <p className="text-[18px] text-[#474747] font-normal leading-relaxed">
                {cake.tagline}
              </p>

              <div className="text-[36px] font-black text-[#1d1d1f] pt-2">
                ${cake.price}
                <span className="text-[14px] font-normal text-[#707070] ml-2">USD (Bespoke Handcrafted)</span>
              </div>
            </div>

            {/* Structural Specifications */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-[#f5f5f7] rounded-[18px] text-[13px]">
              <div className="flex items-center gap-2.5 text-[#474747]">
                <Users className="w-4 h-4 text-[#707070] shrink-0" />
                <span>
                  <strong className="text-[#1d1d1f]">Servings:</strong> {cake.servings}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#474747]">
                <Layers className="w-4 h-4 text-[#707070] shrink-0" />
                <span>
                  <strong className="text-[#1d1d1f]">Architecture:</strong> {cake.tiers} {cake.tiers === 1 ? "Tier" : "Tiers"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#474747]">
                <Ruler className="w-4 h-4 text-[#707070] shrink-0" />
                <span>
                  <strong className="text-[#1d1d1f]">Dimensions:</strong> {cake.dimensions}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#474747]">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: cake.finishColor }}
                />
                <span>
                  <strong className="text-[#1d1d1f]">Finish:</strong> {cake.swatchName}
                </span>
              </div>
            </div>

            {/* Flavor Selector */}
            {cake.flavors && cake.flavors.length > 0 && (
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wider block">
                  Select Cake Flavor Composition
                </label>
                <div className="space-y-2">
                  {cake.flavors.map((flavor) => (
                    <button
                      key={flavor}
                      type="button"
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`w-full text-left px-4 py-3 rounded-[14px] text-[14px] transition-all flex items-center justify-between cursor-pointer ${
                        selectedFlavor === flavor
                          ? "bg-[#1d1d1f] text-white font-medium shadow-sm"
                          : "bg-[#fafafc] hover:bg-[#e8e8ed] text-[#1d1d1f] border border-[#e5e5ea]"
                      }`}
                    >
                      <span>{flavor}</span>
                      {selectedFlavor === flavor && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Complimentary Inscription */}
            <div className="space-y-2">
              <label htmlFor="inscription" className="text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wider block">
                Complimentary 24k Gold Lettering Inscription
              </label>
              <input
                id="inscription"
                type="text"
                placeholder="e.g. Forever & Always • 2026"
                value={customInscription}
                onChange={(e) => setCustomInscription(e.target.value)}
                maxLength={45}
                className="w-full px-4 py-3 rounded-[14px] bg-[#fafafc] border border-[#e5e5ea] text-[14px] focus:outline-none focus:border-[#0071e3] transition-colors"
              />
              <span className="text-[11px] text-[#707070] block text-right">
                {customInscription.length}/45 characters
              </span>
            </div>

            {/* CTA Add to Bag */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-4 px-6 rounded-full text-[16px] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  added
                    ? "bg-emerald-600 text-white"
                    : "bg-[#0071e3] hover:bg-[#0077ed] text-white hover:scale-[1.01]"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Your Haute Bag!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Reserve This Cake (${cake.price})
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-6 text-[12px] text-[#707070] pt-2">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  White-Glove Refrigerated Courier
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Culinary Artisan Guarantee
                </span>
              </div>
            </div>
          </section>
        </article>

        {/* Detailed Description Section (Semantic SEO Article) */}
        <section className="mt-20 pt-12 border-t border-[#e5e5ea] max-w-[860px]">
          <h2 className="text-[26px] font-bold text-[#1d1d1f] tracking-tight mb-4">
            Artisanal Conception & Architecture
          </h2>
          <div className="text-[16px] text-[#474747] leading-relaxed space-y-4">
            <p>{cake.description}</p>
            <p>
              Hand-sculpted in our metropolitan atelier by master pastry chefs, every dimension is calibrated to maintain aesthetic purity and structural poise throughout your event. Paired exclusively with sustainably harvested vanillas, grand cru single-origin chocolates, and organic botanicals.
            </p>
          </div>
        </section>

        {/* Cake Specific FAQs Section */}
        {cake.faqs && cake.faqs.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#e5e5ea] max-w-[860px]">
            <div className="mb-8">
              <div className="text-[13px] uppercase tracking-wider text-[#707070] font-medium mb-1">
                Frequently Asked Questions
              </div>
              <h2 className="text-[26px] font-bold text-[#1d1d1f] tracking-tight">
                Everything you need to know about {cake.name}
              </h2>
            </div>

            <div className="space-y-3">
              {cake.faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-[#e5e5ea] rounded-[16px] overflow-hidden transition-colors bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-[15px] text-[#1d1d1f] hover:bg-[#fafafc] transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <span className="text-[20px] text-[#707070] font-light leading-none">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-[14px] text-[#707070] leading-relaxed border-t border-[#f5f5f7] pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Deep Internal Linking: Related Cakes in this Occasion */}
        {relatedCakes && relatedCakes.length > 0 && (
          <section className="mt-24 pt-14 border-t border-[#e5e5ea]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <div className="text-[13px] uppercase tracking-wider text-[#707070] font-medium mb-1">
                  Interconnected Portfolio
                </div>
                <h2 className="text-[28px] font-bold text-[#1d1d1f] tracking-tight">
                  More Architectural Cakes for {cake.occasion}
                </h2>
              </div>
              <Link
                href={`/occasions/${cake.occasion.toLowerCase().replace(/\s+/g, "-")}`}
                className="inline-flex items-center gap-1.5 text-[14px] text-[#0071e3] hover:underline font-medium"
              >
                Explore all {cake.occasion} cakes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCakes.slice(0, 3).map((rel) => (
                <Link
                  key={rel.id}
                  href={`/cakes/${rel.slug}`}
                  className="group bg-[#fafafc] rounded-[22px] overflow-hidden border border-[#e5e5ea] hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={rel.image}
                      alt={rel.imageAlt || rel.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#1d1d1f]">
                      ${rel.price}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="font-semibold text-[17px] text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors mb-1">
                        {rel.name}
                      </h3>
                      <p className="text-[13px] text-[#707070] line-clamp-2 leading-relaxed">
                        {rel.tagline}
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#e5e5ea] flex items-center justify-between text-[12px] text-[#707070]">
                      <span>{rel.servings}</span>
                      <span className="text-[#0071e3] font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Details &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
