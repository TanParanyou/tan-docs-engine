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
    <div className="flex items-center bg-slate-100 border border-slate-200/90 rounded-lg p-1 gap-1 text-xs font-mono select-none">
      {presets.map((p) => {
        const isActive = currentRatio === p.ratio;
        return (
          <button
            key={p.ratio}
            type="button"
            onClick={() => onSelectRatio(p.ratio)}
            title={p.title}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all cursor-pointer font-semibold",
              isActive
                ? "bg-white text-blue-600 shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
