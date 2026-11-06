"use client";

import React from "react";

interface CharacterCounterProps {
  current: number;
  minRecommended: number;
  maxRecommended: number;
}

export default function CharacterCounter({
  current,
  minRecommended,
  maxRecommended,
}: CharacterCounterProps) {
  let statusColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
  let statusText = "Optimal";

  if (current === 0) {
    statusColor = "text-amber-600 bg-amber-50 border-amber-200";
    statusText = "Missing";
  } else if (current < minRecommended) {
    statusColor = "text-amber-600 bg-amber-50 border-amber-200";
    statusText = "Short";
  } else if (current > maxRecommended) {
    statusColor = "text-red-600 bg-red-50 border-red-200";
    statusText = "Truncated";
  }

  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span className="text-gray-500 font-mono">
        {current}/{maxRecommended} chars
      </span>
      <span
        className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${statusColor}`}
      >
        {statusText}
      </span>
      <span className="text-[11px] text-gray-400 hidden sm:inline">
        (Recommended: {minRecommended}–{maxRecommended})
      </span>
    </div>
  );
}
