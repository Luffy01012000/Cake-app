"use client";

import React, { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

interface GoogleSerpPreviewProps {
  title: string;
  description: string;
  urlPath: string;
  siteName?: string;
}

export default function GoogleSerpPreview({
  title,
  description,
  urlPath,
  siteName = "AURA Patisserie",
}: GoogleSerpPreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const displayTitle =
    title && title.trim()
      ? title.length > 60
        ? title.slice(0, 58) + "..."
        : title
      : "Page Title Preview — AURA Patisserie";

  const displayDescription =
    description && description.trim()
      ? description.length > 160
        ? description.slice(0, 157) + "..."
        : description
      : "Add a compelling meta description containing your target keywords to attract high-intent visitors and boost search ranking click-through rates.";

  const formattedUrl = urlPath.startsWith("/") ? urlPath.slice(1) : urlPath;
  const pathParts = formattedUrl ? formattedUrl.split("/") : [];

  return (
    <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-[#202025] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#202025] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-[13px] font-semibold text-gray-800 dark:text-[#f5f5f7]">
            Live Google SERP Snippet Preview
          </span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center bg-gray-100 dark:bg-[#1f1f24] p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              device === "desktop"
                ? "bg-white dark:bg-[#2c2c34] text-blue-600 dark:text-[#2997ff] shadow-xs font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              device === "mobile"
                ? "bg-white dark:bg-[#2c2c34] text-blue-600 dark:text-[#2997ff] shadow-xs font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile
          </button>
        </div>
      </div>

      {/* Simulated Google Search Result */}
      <div
        className={`bg-[#ffffff] dark:bg-[#1a1a1f] rounded-lg transition-all border border-transparent dark:border-[#282830] ${
          device === "mobile"
            ? "max-w-[390px] border border-gray-200 dark:border-[#282830] p-4 shadow-xs mx-auto"
            : "p-3 font-sans"
        }`}
      >
        {/* Favicon & Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-[#202124] dark:text-[#e8eaed] mb-1">
          <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-[9px] font-bold">
            A
          </div>
          <div className="flex items-center gap-1 overflow-hidden truncate">
            <span className="font-medium text-[#202124] dark:text-[#e8eaed]">{siteName}</span>
            <span className="text-[#5f6368] dark:text-[#9aa0a6]">https://aurapatisserie.com</span>
            {pathParts.map((part, i) => (
              <React.Fragment key={i}>
                <span className="text-[#5f6368] dark:text-[#9aa0a6]">›</span>
                <span className="text-[#5f6368] dark:text-[#9aa0a6] truncate">{part}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Title Link */}
        <h3
          className={`font-normal text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-tight mb-1 truncate ${
            device === "mobile" ? "text-[18px]" : "text-[20px]"
          }`}
        >
          {displayTitle}
        </h3>

        {/* Snippet Description */}
        <p className="text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-[1.4] line-clamp-2">
          {displayDescription}
        </p>
      </div>

      <div className="text-[11px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-[#18181c] rounded-lg p-2.5 flex items-center justify-between">
        <span>Search engines display up to ~600px width on desktop (~60 chars).</span>
        <span className="font-mono text-gray-500 dark:text-gray-400">
          {title ? title.length : 0} chars | {description ? description.length : 0} chars
        </span>
      </div>
    </div>
  );
}
