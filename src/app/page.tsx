"use client";

import React, { useState } from "react";
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

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "initial-wedding-item",
      cake: CAKE_CATALOG[0],
      customInscription: "Forever & Always • 2026",
      flavorChoice: "Tahitian Vanilla Bean & Rosé Champagne",
      deliveryDate: "2026-11-25",
      quantity: 1,
    },
  ]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCake, setSelectedCake] = useState<CakeProduct | null>(null);
  const [activeOccasionFilter, setActiveOccasionFilter] = useState("All Occasions");

  // Cart operations
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

      {/* 3. Product Hero Section (Cathedral of white space) */}
      <Hero
        onExplore={scrollToOccasions}
        onOpenConfigurator={scrollToConfigurator}
        onSelectCake={(cake) => setSelectedCake(cake)}
        featuredCake={CAKE_CATALOG[0]}
      />

      {/* 4. Occasions Catalog Section (#f5f5f7 canvas band) */}
      <OccasionTabs
        onQuickView={(cake) => setSelectedCake(cake)}
        onAddToCart={handleAddToCart}
        activeFilter={activeOccasionFilter}
        setActiveFilter={setActiveOccasionFilter}
      />

      {/* 5. Color Variant Showcase Section (#ffffff canvas band) */}
      <VariantShowcase
        onSelectCake={(cake) => setSelectedCake(cake)}
        onAddToCart={handleAddToCart}
      />

      {/* 6. Interactive Atelier Studio Configurator (#f5f5f7 canvas band) */}
      <AtelierConfigurator
        onAddCustomCake={handleAddCustomCake}
      />

      {/* 7. Craftsmanship & Tasting Notes (#ffffff canvas band) */}
      <CraftsmanshipSection
        onOrderTastingFlight={handleOrderTastingFlight}
      />

      {/* 8. Fine-Print Legal & Directory Footer (#f5f5f7 canvas band) */}
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
