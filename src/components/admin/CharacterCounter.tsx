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
  let statusColor = "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-850/60";
  let statusText = "Optimal";

  if (current === 0) {
    statusColor = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-850/60";
    statusText = "Missing";
  } else if (current < minRecommended) {
    statusColor = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-850/60";
    statusText = "Short";
  } else if (current > maxRecommended) {
    statusColor = "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-850/60";
    statusText = "Truncated";
  }

  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span className="text-gray-500 dark:text-neutral-400 font-mono">
        {current}/{maxRecommended} chars
      </span>
      <span
        className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${statusColor}`}
      >
        {statusText}
      </span>
      <span className="text-[11px] text-gray-400 dark:text-neutral-500 hidden sm:inline">
        (Recommended: {minRecommended}–{maxRecommended})
      </span>
    </div>
  );
}
