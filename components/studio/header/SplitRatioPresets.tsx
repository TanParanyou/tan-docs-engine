"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SplitRatioPresetsProps {
  currentRatio: number;
  onSelectRatio: (ratio: number) => void;
}

export default function SplitRatioPresets({
  currentRatio,
  onSelectRatio,
}: SplitRatioPresetsProps) {
  const presets = [
    { ratio: 35, label: "35:65", title: "Preview Focus (35:65)" },
    { ratio: 50, label: "50:50", title: "Balanced (50:50)" },
    { ratio: 65, label: "65:35", title: "Editor Focus (65:35)" },
  ];

  return (
    <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-[11px] font-mono select-none">
      {presets.map((p) => {
        const isActive = currentRatio === p.ratio;
        return (
          <button
            key={p.ratio}
            type="button"
            onClick={() => onSelectRatio(p.ratio)}
            title={p.title}
            className={cn(
              "px-1.5 py-0.5 rounded transition-all",
              isActive
                ? "bg-white text-blue-600 font-bold shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
