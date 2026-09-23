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
    { ratio: 35, label: "35:65", title: "เน้นดูตัวอย่าง Preview (35:65)" },
    { ratio: 50, label: "50:50", title: "สมดุลเท่ากัน (50:50)" },
    { ratio: 65, label: "65:35", title: "เน้นพิมพ์ Editor (65:35)" },
  ];

  return (
    <div className="flex items-center bg-theme-surface-sunken border border-theme-border rounded-retro p-0.5 sm:p-1 gap-1 text-xs font-mono select-none shadow-retro-sm">
      {presets.map((p) => {
        const isActive = currentRatio === p.ratio;
        return (
          <button
            key={p.ratio}
            type="button"
            onClick={() => onSelectRatio(p.ratio)}
            title={p.title}
            className={cn(
              "px-2.5 py-1 rounded-retro transition-all cursor-pointer font-semibold",
              isActive
                ? "bg-theme-surface text-theme-primary font-bold border border-theme-border shadow-retro-sm"
                : "text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-hover"
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
