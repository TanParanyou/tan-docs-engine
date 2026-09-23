"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  title?: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center bg-slate-100/90 border border-slate-200/90 rounded-lg p-1 gap-1 select-none",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            title={opt.title || opt.label}
            className={cn(
              "flex items-center justify-center rounded-md font-medium transition-all cursor-pointer whitespace-nowrap",
              size === "sm"
                ? "px-2.5 py-1 text-xs gap-1.5 min-h-[28px]"
                : "px-3.5 py-1.5 text-xs gap-2 min-h-[32px]",
              isActive
                ? "bg-white text-blue-600 font-semibold shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent"
            )}
          >
            {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
