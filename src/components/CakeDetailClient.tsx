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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen bg-white dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] flex flex-col transition-colors duration-200">
      <Navbar />

      {/* 1. Header Bar with Back to Home & Catalog */}
      <nav aria-label="Breadcrumb" className="bg-[#fafafc] dark:bg-[#121214] border-b border-[#e5e5ea] dark:border-[#202024] py-3 px-4 sm:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center flex-wrap gap-2 text-[13px] text-[#707070] dark:text-[#a1a1a6]">
          <Link href="/" className="hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:underline">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/cakes" className="hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:underline">
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/occasions/${cake.occasion.toLowerCase().replace(/\s+/g, "-")}`}
            className="hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:underline"
          >
            {cake.occasion}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium truncate max-w-[250px]">
            {cake.name}
          </span>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 sm:py-16 flex-grow w-full">
        {/* Product Section Grid */}
        <article className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
          {/* Left Column: Visual & Caption */}
          <section className="lg:col-span-7 space-y-6">
            <figure className="relative aspect-[4/3] w-full rounded-[24px] overflow-hidden bg-[#f5f5f7] dark:bg-[#141416] border border-black/5 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-black/50">
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
              <figcaption className="text-[13px] text-[#707070] dark:text-[#a1a1a6] italic text-center max-w-[90%] mx-auto">
                {cake.imageCaption}
              </figcaption>
            )}

            {/* Tasting Notes & Culinary Highlights */}
            {cake.tastingNotes && cake.tastingNotes.length > 0 && (
              <div className="bg-[#fafafc] dark:bg-[#141416] rounded-[20px] p-6 border border-[#e5e5ea] dark:border-[#202024] space-y-3">
                <h2 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#b64400] dark:text-[#ff6934]" />
                  Sommelier Tasting Profile
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cake.tastingNotes.map((note, i) => (
                    <span
                      key={i}
                      className="bg-white dark:bg-[#1f1f24] border border-[#d6d6d6] dark:border-[#2c2c34] text-[#474747] dark:text-[#d1d1d6] text-[13px] px-3.5 py-1.5 rounded-full"
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
                  className="inline-block bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] text-[12px] font-semibold px-3 py-1 rounded-full hover:bg-[#0071e3]/20 transition-colors uppercase tracking-wider"
                >
                  {cake.occasion} Collection
                </Link>
                <span className="text-[12px] text-[#707070] dark:text-[#a1a1a6]">•</span>
                <span className="text-[12px] text-[#707070] dark:text-[#a1a1a6] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Lead: {cake.leadTime}
                </span>
              </div>

              <h1 className="text-[32px] sm:text-[40px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-tight">
                {cake.name}
              </h1>

              <p className="text-[18px] text-[#474747] dark:text-[#a1a1a6] font-normal leading-relaxed">
                {cake.tagline}
              </p>

              <div className="text-[36px] font-black text-[#1d1d1f] dark:text-[#f5f5f7] pt-2">
                ${cake.price}
                <span className="text-[14px] font-normal text-[#707070] dark:text-[#a1a1a6] ml-2">USD (Bespoke Handcrafted)</span>
              </div>
            </div>

            {/* Structural Specifications */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-[#f5f5f7] dark:bg-[#141416] border border-transparent dark:border-[#202024] rounded-[18px] text-[13px]">
              <div className="flex items-center gap-2.5 text-[#474747] dark:text-[#d1d1d6]">
                <Users className="w-4 h-4 text-[#707070] dark:text-[#a1a1a6] shrink-0" />
                <span>
                  <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">Servings:</strong> {cake.servings}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#474747] dark:text-[#d1d1d6]">
                <Layers className="w-4 h-4 text-[#707070] dark:text-[#a1a1a6] shrink-0" />
                <span>
                  <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">Architecture:</strong> {cake.tiers} {cake.tiers === 1 ? "Tier" : "Tiers"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#474747] dark:text-[#d1d1d6]">
                <Ruler className="w-4 h-4 text-[#707070] dark:text-[#a1a1a6] shrink-0" />
                <span>
                  <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">Dimensions:</strong> {cake.dimensions}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#474747] dark:text-[#d1d1d6]">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/20 shrink-0"
                  style={{ backgroundColor: cake.finishColor }}
                />
                <span>
                  <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">Finish:</strong> {cake.swatchName}
                </span>
              </div>
            </div>

            {/* Flavor Selector */}
            {cake.flavors && cake.flavors.length > 0 && (
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider block">
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
                          ? "bg-[#1d1d1f] dark:bg-[#2997ff] text-white font-medium shadow-sm"
                          : "bg-[#fafafc] dark:bg-[#141416] hover:bg-[#e8e8ed] dark:hover:bg-[#1f1f24] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#e5e5ea] dark:border-[#222226]"
                      }`}
                    >
                      <span>{flavor}</span>
                      {selectedFlavor === flavor && <Check className="w-4 h-4 text-emerald-400 dark:text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Complimentary Inscription */}
            <div className="space-y-2">
              <label htmlFor="inscription" className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wider block">
                Complimentary 24k Gold Lettering Inscription
              </label>
              <input
                id="inscription"
                type="text"
                placeholder="e.g. Forever & Always • 2026"
                value={customInscription}
                onChange={(e) => setCustomInscription(e.target.value)}
                maxLength={45}
                className="w-full px-4 py-3 rounded-[14px] bg-[#fafafc] dark:bg-[#141416] border border-[#e5e5ea] dark:border-[#222226] text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] transition-colors"
              />
              <span className="text-[11px] text-[#707070] dark:text-[#a1a1a6] block text-right">
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

              <div className="flex items-center justify-center gap-6 text-[12px] text-[#707070] dark:text-[#a1a1a6] pt-2">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  White-Glove Refrigerated Courier
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Culinary Artisan Guarantee
                </span>
              </div>
            </div>
          </section>
        </article>

        {/* Detailed Description Section (Semantic SEO Article) */}
        <section className="mt-20 pt-12 border-t border-[#e5e5ea] dark:border-[#202024] max-w-[860px]">
          <h2 className="text-[26px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight mb-4">
            Artisanal Conception & Architecture
          </h2>
          <div className="text-[16px] text-[#474747] dark:text-[#a1a1a6] leading-relaxed space-y-4">
            <p>{cake.description}</p>
            <p>
              Hand-sculpted in our metropolitan atelier by master pastry chefs, every dimension is calibrated to maintain aesthetic purity and structural poise throughout your event. Paired exclusively with sustainably harvested vanillas, grand cru single-origin chocolates, and organic botanicals.
            </p>
          </div>
        </section>

        {/* Cake Specific FAQs Section */}
        {cake.faqs && cake.faqs.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#e5e5ea] dark:border-[#202024] max-w-[860px]">
            <div className="mb-8">
              <div className="text-[13px] uppercase tracking-wider text-[#707070] dark:text-[#a1a1a6] font-medium mb-1">
                Frequently Asked Questions
              </div>
              <h2 className="text-[26px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                Everything you need to know about {cake.name}
              </h2>
            </div>

            <div className="space-y-3">
              {cake.faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-[#e5e5ea] dark:border-[#202024] rounded-[16px] overflow-hidden transition-colors bg-white dark:bg-[#141416]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#fafafc] dark:hover:bg-[#1a1a20] transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <span className="text-[20px] text-[#707070] dark:text-[#a1a1a6] font-light leading-none">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-[14px] text-[#707070] dark:text-[#a1a1a6] leading-relaxed border-t border-[#f5f5f7] dark:border-[#202024] pt-3">
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
          <section className="mt-24 pt-14 border-t border-[#e5e5ea] dark:border-[#202024]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <div className="text-[13px] uppercase tracking-wider text-[#707070] dark:text-[#a1a1a6] font-medium mb-1">
                  Interconnected Portfolio
                </div>
                <h2 className="text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                  More Architectural Cakes for {cake.occasion}
                </h2>
              </div>
              <Link
                href={`/occasions/${cake.occasion.toLowerCase().replace(/\s+/g, "-")}`}
                className="inline-flex items-center gap-1.5 text-[14px] text-[#0071e3] dark:text-[#2997ff] hover:underline font-medium"
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
                  className="group bg-[#fafafc] dark:bg-[#141416] rounded-[22px] overflow-hidden border border-[#e5e5ea] dark:border-[#202024] hover:shadow-lg dark:hover:shadow-black/50 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <Image
                      src={rel.image}
                      alt={rel.imageAlt || rel.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/5 dark:border-white/10">
                      ${rel.price}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="font-semibold text-[17px] text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors mb-1">
                        {rel.name}
                      </h3>
                      <p className="text-[13px] text-[#707070] dark:text-[#a1a1a6] line-clamp-2 leading-relaxed">
                        {rel.tagline}
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#e5e5ea] dark:border-[#202024] flex items-center justify-between text-[12px] text-[#707070] dark:text-[#a1a1a6]">
                      <span>{rel.servings}</span>
                      <span className="text-[#0071e3] dark:text-[#2997ff] font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
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

      <Footer />
    </div>
  );
}
