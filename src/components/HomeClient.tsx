"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import PromoRibbon from "@/components/PromoRibbon";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OccasionTabs from "@/components/OccasionTabs";
import VariantShowcase from "@/components/VariantShowcase";
import AtelierConfigurator from "@/components/AtelierConfigurator";
import CraftsmanshipSection from "@/components/CraftsmanshipSection";
import Footer from "@/components/Footer";
import CakeModal from "@/components/CakeModal";
import CartDrawer from "@/components/CartDrawer";
import { CakeProduct, CAKE_CATALOG, CartItem } from "@/data/cakes";

interface HomeClientProps {
  initialCakes?: CakeProduct[];
  homeFaqs?: { question: string; answer: string }[];
}

export default function HomeClient({
  initialCakes = CAKE_CATALOG,
  homeFaqs = [],
}: HomeClientProps) {
  const catalogCakes = initialCakes.length > 0 ? initialCakes : CAKE_CATALOG;

  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "initial-wedding-item",
      cake: catalogCakes[0] || CAKE_CATALOG[0],
      customInscription: "Forever & Always • 2026",
      flavorChoice: "Tahitian Vanilla Bean & Rosé Champagne",
      deliveryDate: "2026-11-25",
      quantity: 1,
    },
  ]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCake, setSelectedCake] = useState<CakeProduct | null>(null);
  const [activeOccasionFilter, setActiveOccasionFilter] = useState("All Occasions");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleAddToCart = (cake: CakeProduct, inscription?: string) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.cake.id === cake.id && item.customInscription === (inscription || "")
      );
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          cake,
          customInscription: inscription || "",
          flavorChoice: cake.flavors[0],
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleAddCustomCake = ({
    cake,
    customInscription,
    flavorChoice,
    deliveryDate,
  }: {
    cake: CakeProduct;
    customInscription: string;
    flavorChoice: string;
    deliveryDate: string;
  }) => {
    setCartItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        cake,
        customInscription,
        flavorChoice,
        deliveryDate,
        quantity: 1,
      },
    ]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderTastingFlight = () => {
    const flightCake: CakeProduct = {
      id: "tasting-flight-box",
      name: "Private Tasting Flight Experience",
      tagline: "6 Signature Gourmet Flavor Sponges & Fillings",
      occasion: "Weddings",
      price: 75,
      image: "/images/romance_blush_cake.jpg",
      finishColor: "#f0e4d3",
      swatchName: "Tasting Flight",
      servings: "2–4 people",
      tiers: 1,
      flavors: ["All 6 Signature AURA Flavors"],
      description: "Curated sommelier sample box with all 6 cake flavors and fillings couriered in an insulated chamber. 100% credited toward your wedding cake.",
      tastingNotes: ["Vanilla, Pistachio, Truffle, Rose, Lavender, Bergamot"],
      dimensions: "Insulated Gift Vault",
      leadTime: "Next-day dispatch",
    };
    handleAddToCart(flightCake);
  };

  const scrollToOccasions = () => {
    document.getElementById("occasions-catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToConfigurator = () => {
    document.getElementById("atelier-configurator")?.scrollIntoView({ behavior: "smooth" });
  };

  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <main className="min-h-screen bg-[#ffffff] selection:bg-[#0071e3] selection:text-white">
      {/* 1. Promo Ribbon */}
      <PromoRibbon onOpenConsultation={handleOrderTastingFlight} />

      {/* 2. 44px Sticky Frosted Navbar */}
      <Navbar
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectOccasion={(occ) => {
          setActiveOccasionFilter(occ);
          scrollToOccasions();
        }}
        onOpenConfigurator={scrollToConfigurator}
      />

      {/* 3. Product Hero Section */}
      <Hero
        onExplore={scrollToOccasions}
        onOpenConfigurator={scrollToConfigurator}
        onSelectCake={(cake) => setSelectedCake(cake)}
        featuredCake={catalogCakes[0] || CAKE_CATALOG[0]}
      />

      {/* 4. Occasions Catalog Section */}
      <OccasionTabs
        cakes={catalogCakes}
        onQuickView={(cake) => setSelectedCake(cake)}
        onAddToCart={handleAddToCart}
        activeFilter={activeOccasionFilter}
        setActiveFilter={setActiveOccasionFilter}
      />

      {/* 5. Color Variant Showcase Section */}
      <VariantShowcase
        onSelectCake={(cake) => setSelectedCake(cake)}
        onAddToCart={handleAddToCart}
      />

      {/* 6. Interactive Atelier Studio Configurator */}
      <AtelierConfigurator
        onAddCustomCake={handleAddCustomCake}
      />

      {/* 7. Craftsmanship & Tasting Notes */}
      <CraftsmanshipSection
        onOrderTastingFlight={handleOrderTastingFlight}
      />

      {/* 8. Interconnecting Occasions Directory (SEO Boost for Crawlers) */}
      <section className="w-full bg-[#fafafc] py-20 border-t border-[#e5e5ea]">
        <div className="max-w-[1024px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-[650px] mx-auto mb-12">
            <span className="text-[12px] uppercase font-semibold text-[#0071e3] tracking-wider mb-2 block">
              Architectural Cake Repertoire
            </span>
            <h2 className="text-[28px] sm:text-[36px] font-bold text-[#1d1d1f] tracking-tight mb-3">
              Tailored Cakes for Every Event Milestone
            </h2>
            <p className="text-[15px] text-[#707070] leading-relaxed">
              Explore dedicated portfolios engineered specifically for weddings, luxury birthday galas, private anniversaries, and modern celebrations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Wedding Cakes",
                slug: "weddings",
                desc: "Monumental multi-tier architectural centerpieces in pure ivory fondant and 24k gold leaf.",
                count: catalogCakes.filter((c) => c.occasion === "Weddings").length,
              },
              {
                title: "Birthday Cakes",
                slug: "birthdays",
                desc: "Modern minimalist single and multi-tier showstoppers with velvet spray cocoa finishes.",
                count: catalogCakes.filter((c) => c.occasion === "Birthdays").length,
              },
              {
                title: "Anniversary Cakes",
                slug: "anniversaries",
                desc: "Decadent dark truffle and reflective mirror glazes celebrating eternal devotion.",
                count: catalogCakes.filter((c) => c.occasion === "Anniversaries").length,
              },
              {
                title: "Baby Shower Cakes",
                slug: "baby-showers",
                desc: "Ethereal pastel blue and blush palettes with delicate micro sugar blossoms.",
                count: catalogCakes.filter((c) => c.occasion === "Baby Showers").length,
              },
              {
                title: "Gala & Event Cakes",
                slug: "galas",
                desc: "Avant-garde geometric stepped cubes designed for corporate banquets and brand galas.",
                count: catalogCakes.filter((c) => c.occasion === "Galas").length,
              },
              {
                title: "Complete Haute Catalog",
                slug: "catalog",
                href: "/cakes",
                desc: "Browse our entire portfolio of signature flavor profiles and custom architectural tiers.",
                count: catalogCakes.length,
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href || `/occasions/${item.slug}`}
                className="p-6 bg-white rounded-[20px] border border-[#e5e5ea] hover:border-[#0071e3] hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[17px] text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-[12px] bg-[#f5f5f7] px-2.5 py-0.5 rounded-full font-medium text-[#474747]">
                      {item.count} Cakes
                    </span>
                  </div>
                  <p className="text-[13px] text-[#707070] leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[13px] text-[#0071e3] font-medium group-hover:translate-x-1 transition-transform">
                  <span>Explore Portfolio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Frequently Asked Questions (Live FAQ Section from Admin Panel) */}
      {homeFaqs && homeFaqs.length > 0 && (
        <section className="w-full bg-white py-20 border-t border-[#e5e5ea]">
          <div className="max-w-[800px] mx-auto px-4 sm:px-8">
            <div className="text-center mb-12">
              <span className="text-[12px] uppercase font-semibold text-[#0071e3] tracking-wider mb-2 block">
                Patisserie Inquiries
              </span>
              <h2 className="text-[28px] sm:text-[36px] font-bold text-[#1d1d1f] tracking-tight mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-[15px] text-[#707070]">
                Everything you need to know about our commissioning process, flavor options, and refrigerated delivery.
              </p>
            </div>

            <div className="space-y-4">
              {homeFaqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="border border-[#e5e5ea] rounded-[16px] overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-[15px] text-[#1d1d1f] hover:bg-[#fafafc] transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle className="w-4 h-4 text-[#0071e3] shrink-0" />
                        {faq.question}
                      </span>
                      <span className="text-[20px] text-[#707070] font-light leading-none">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-[14px] text-[#707070] leading-relaxed border-t border-[#f5f5f7] pt-3 pl-12">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 10. Fine-Print Legal & Directory Footer */}
      <Footer
        onSelectOccasion={(occ) => {
          setActiveOccasionFilter(occ);
          scrollToOccasions();
        }}
        onOpenConfigurator={scrollToConfigurator}
      />

      {/* Interactive Quick View Modal */}
      <CakeModal
        cake={selectedCake}
        onClose={() => setSelectedCake(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Interactive Shopping Bag Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </main>
  );
}
