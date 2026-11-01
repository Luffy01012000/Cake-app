"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, Search, Sparkles, X } from "lucide-react";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onSelectOccasion: (occ: string) => void;
  onOpenConfigurator: () => void;
}

export default function Navbar({
  cartCount,
  onOpenCart,
  onSelectOccasion,
  onOpenConfigurator,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Weddings", occ: "Weddings" },
    { name: "Birthdays", occ: "Birthdays" },
    { name: "Anniversaries", occ: "Anniversaries" },
    { name: "Baby Showers", occ: "Baby Showers" },
    { name: "Galas", occ: "Galas" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full h-[44px] transition-all duration-300 ${
          scrolled
            ? "bg-[#fafafc]/85 backdrop-blur-md border-b border-[#d6d6d6]/60 shadow-[0_1px_0_rgba(0,0,0,0.05)]"
            : "bg-[#ffffff]/90 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        <div className="max-w-[1024px] mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-1.5 text-[#1d1d1f] hover:opacity-75 transition-opacity"
          >
            <span className="font-semibold tracking-[-0.03em] text-[15px] uppercase">
              Aura
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#707070] font-medium hidden sm:inline">
              Pâtisserie
            </span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  onSelectOccasion(link.occ);
                  const el = document.getElementById("occasions-catalog");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-[12px] text-[#1d1d1f] hover:text-[#0071e3] transition-colors font-normal tracking-[-0.01em] cursor-pointer"
              >
                {link.name}
              </button>
            ))}

            {/* Atelier Studio Link */}
            <button
              onClick={onOpenConfigurator}
              className="text-[12px] text-[#1d1d1f] hover:text-[#0071e3] transition-colors font-medium tracking-[-0.01em] inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#b64400]" />
              Atelier Studio
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors cursor-pointer p-1"
            >
              <Search className="w-4 h-4 stroke-[1.75]" />
            </button>

            <button
              onClick={onOpenCart}
              aria-label="Bag"
              className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors cursor-pointer relative p-1"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0071e3] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium numr">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-down Search Bar */}
      {searchOpen && (
        <div className="bg-[#fafafc] border-b border-[#d6d6d6] py-4 px-6 transition-all duration-200">
          <div className="max-w-[720px] mx-auto flex items-center gap-3">
            <Search className="w-4 h-4 text-[#707070]" />
            <input
              type="text"
              placeholder="Search by occasion (e.g. Wedding, Birthday), flavor (e.g. Pistachio), or size..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-[15px] focus:outline-none placeholder:text-[#707070]"
              autoFocus
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="text-[#707070] hover:text-[#1d1d1f] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
