"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

export default function PromoRibbon({
  onOpenConsultation,
}: {
  onOpenConsultation?: () => void;
}) {
  return (
    <div className="bg-[#f5f5f7] border-b border-[#d6d6d6]/40 py-2.5 px-4 text-center">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 text-[13px] text-[#1d1d1f] tracking-tight">
        <span>
          White-glove climate-controlled delivery in New York, London, Paris & Zurich.
        </span>
        <button
          onClick={onOpenConsultation}
          className="text-[#0066cc] hover:underline font-medium inline-flex items-center gap-0.5 cursor-pointer"
        >
          Reserve private tasting flight
          <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
        </button>
      </div>
    </div>
  );
}
