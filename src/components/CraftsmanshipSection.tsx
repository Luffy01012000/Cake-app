"use client";

import React from "react";
import { ShieldCheck, Sparkles, Truck, Award, HeartHandshake, CheckCircle2 } from "lucide-react";

interface CraftsmanshipSectionProps {
  onOrderTastingFlight: () => void;
}

export default function CraftsmanshipSection({
  onOrderTastingFlight,
}: CraftsmanshipSectionProps) {
  const pillars = [
    {
      icon: Award,
      title: "Grand Cru Ingredients",
      desc: "Single-origin Valrhona 72% Araguani chocolate, slow-churned Normandy AOP butter, whole Tahitian vanilla beans, and unrefined organic cane sugar. Never artificial extracts or hydrogenated fats.",
    },
    {
      icon: Sparkles,
      title: "Micro-Precision Structural Art",
      desc: "Engineered with internal titanium-food-grade dowels and tempered cocoa butter ganache to ensure multi-tier stability in any ballroom climate while retaining an ethereal, melt-in-mouth crumb.",
    },
    {
      icon: Truck,
      title: "Climate-Guaranteed Courier",
      desc: "Transported in custom calibrated refrigerated vaults (4°C) with active gyroscope shock absorbers. Hand-delivered and placed on your venue's cake table by our master pastry technicians.",
    },
  ];

  return (
    <section className="w-full bg-[#ffffff] dark:bg-[#000000] py-24 sm:py-32 transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-[760px] mb-16">
          <span className="text-[13px] uppercase tracking-wider text-[#707070] dark:text-[#a1a1a6] font-semibold block mb-2">
            Haute Pâtisserie Standards
          </span>
          <h2 className="heading-md text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
            Culinary engineering meets botanical art.
          </h2>
          <p className="body-canonical text-[#707070] dark:text-[#a1a1a6]">
            Every AURA centerpiece undergoes 72 hours of meticulous preparation — from 48-hour cold sponge fermentation to hand-formed sugar petal texturing.
          </p>
        </div>

        {/* 3 Pillars Grid with 28px Borderless Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="card-apple bg-[#f5f5f7] dark:bg-[#161618] border border-transparent dark:border-[#2c2c2e] p-8 sm:p-10 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#202023] flex items-center justify-center mb-6 text-[#0071e3] dark:text-[#2997ff]">
                    <Icon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight mb-3">
                    {p.title}
                  </h3>
                  <p className="text-[14px] text-[#707070] dark:text-[#a1a1a6] leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* The Tasting Flight Callout (Alternating card on #f5f5f7 canvas) */}
        <div className="card-apple bg-[#f5f5f7] dark:bg-[#161618] border border-transparent dark:border-[#2c2c2e] p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-[620px]">
            <div className="flex items-center gap-2 text-[#b64400] dark:text-[#ff6934] text-[13px] font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              Pre-Event Experience
            </div>
            <h3 className="text-[28px] sm:text-[34px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight mb-3">
              Experience the Private Tasting Flight
            </h3>
            <p className="text-[15px] text-[#707070] dark:text-[#a1a1a6] leading-relaxed mb-4">
              Planning a wedding, milestone anniversary, or brand gala? We courier an insulated tasting flight containing all 6 signature cake sponges, curated ganaches, and compotes directly to your home before you finalize your commission.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] text-[#474747] dark:text-[#d1d1d6]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" /> 6 mini tasting cakes & fillings
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" /> Sommelier tasting notes guide
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" /> Complimentary 30-min chef consult
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" /> 100% credited toward your final cake
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
            <span className="text-[34px] sm:text-[38px] font-black text-[#1d1d1f] dark:text-[#f5f5f7] numr tracking-tight">$75</span>
            <span className="text-[13px] text-[#707070] dark:text-[#a1a1a6] font-medium">100% credited toward orders $300+</span>
            <button
              onClick={onOrderTastingFlight}
              className="btn-electric px-8 py-3.5 text-[15px] cursor-pointer"
            >
              Order Tasting Flight
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
