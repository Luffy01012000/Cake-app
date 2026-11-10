"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Sparkles, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface NavbarProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onSelectOccasion?: (occ: string) => void;
  onOpenConfigurator?: () => void;
}

export default function Navbar({
  cartCount = 0,
  onOpenCart,
  onSelectOccasion,
  onOpenConfigurator,
}: NavbarProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Weddings", occ: "Weddings", slug: "weddings" },
    { name: "Birthdays", occ: "Birthdays", slug: "birthdays" },
    { name: "Anniversaries", occ: "Anniversaries", slug: "anniversaries" },
    { name: "Baby Showers", occ: "Baby Showers", slug: "baby-showers" },
    { name: "Galas", occ: "Galas", slug: "galas" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full h-[44px] transition-all duration-300 ${
          scrolled
            ? "bg-[#fafafc]/85 dark:bg-[#121214]/85 backdrop-blur-md border-b border-[#d6d6d6]/60 dark:border-[#2c2c2e] shadow-[0_1px_0_rgba(0,0,0,0.05)]"
            : "bg-[#ffffff]/90 dark:bg-[#000000]/90 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        <div className="max-w-[1024px] mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[#1d1d1f] dark:text-[#f5f5f7] hover:opacity-75 transition-opacity"
          >
            <span className="font-semibold tracking-[-0.03em] text-[15px] uppercase">
              Aura
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#707070] dark:text-[#a1a1a6] font-medium hidden sm:inline">
              Pâtisserie
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={`/occasions/${link.slug}`}
                onClick={(e) => {
                  if (onSelectOccasion) {
                    e.preventDefault();
                    onSelectOccasion(link.occ);
                    const el = document.getElementById("occasions-catalog");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-[#0071e3] dark:hover:text-[#2997ff] transition-colors font-normal tracking-[-0.01em] cursor-pointer"
              >
                {link.name}
              </Link>
            ))}

            {/* Atelier Studio Link */}
            <button
              onClick={() => {
                if (onOpenConfigurator) {
                  onOpenConfigurator();
                } else {
                  router.push("/#atelier");
                }
              }}
              className="text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-[#0071e3] dark:hover:text-[#2997ff] transition-colors font-medium tracking-[-0.01em] inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#b64400] dark:text-[#ff6934]" />
              Atelier Studio
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className="text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-[#0071e3] dark:hover:text-[#2997ff] transition-colors cursor-pointer p-1"
            >
              <Search className="w-4 h-4 stroke-[1.75]" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
              className="text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-[#0071e3] dark:hover:text-[#2997ff] transition-all cursor-pointer p-1 rounded-full hover:bg-[#f5f5f7] dark:hover:bg-[#202023]"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 stroke-[1.75] text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 stroke-[1.75]" />
              )}
            </button>

            <button
              onClick={() => {
                if (onOpenCart) {
                  onOpenCart();
                } else {
                  router.push("/");
                }
              }}
              aria-label="Bag"
              className="text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-[#0071e3] dark:hover:text-[#2997ff] transition-colors cursor-pointer relative p-1"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0071e3] dark:bg-[#2997ff] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium numr shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-down Search Bar */}
      {searchOpen && (
        <div className="bg-[#fafafc] dark:bg-[#1c1c1e] border-b border-[#d6d6d6] dark:border-[#2c2c2e] py-4 px-6 transition-all duration-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/cakes`);
              }
            }}
            className="max-w-[720px] mx-auto flex items-center gap-3"
          >
            <Search className="w-4 h-4 text-[#707070] dark:text-[#a1a1a6]" />
            <input
              type="text"
              placeholder="Search by occasion (e.g. Wedding, Birthday), flavor (e.g. Pistachio), or size..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-[15px] focus:outline-none placeholder:text-[#707070] dark:placeholder:text-[#a1a1a6] text-[#1d1d1f] dark:text-[#f5f5f7]"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-[#707070] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
