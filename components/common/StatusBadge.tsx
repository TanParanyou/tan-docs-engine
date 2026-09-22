"use client";

import React from "react";
import { CheckCircle2, Clock, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "saved"
  | "unsaved"
  | "approved"
  | "draft"
  | "review"
  | "confidential";

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  className?: string;
  pulse?: boolean;
}

export default function StatusBadge({
  status,
  label,
  className,
  pulse = false,
}: StatusBadgeProps) {
  const norm = (status || "").toLowerCase().trim();

  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
  let icon = <Clock className="w-3 h-3 text-slate-400" />;
  let defaultText = status;

  if (norm === "saved") {
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
    icon = <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
    defaultText = "Saved";
  } else if (norm === "unsaved" || norm === "dirty") {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
    icon = <Clock className="w-3 h-3 text-amber-500" />;
    defaultText = "Unsaved Changes";
    pulse = true;
  } else if (norm === "approved") {
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
    icon = <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
    defaultText = "Approved";
  } else if (norm === "draft" || norm === "draft for confirmation") {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
    icon = <Clock className="w-3 h-3 text-amber-500" />;
    defaultText = "Draft";
  } else if (norm === "review" || norm === "in review") {
    badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
    icon = <Sparkles className="w-3 h-3 text-blue-500" />;
    defaultText = "In Review";
  } else if (norm === "confidential") {
    badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
    icon = <AlertCircle className="w-3 h-3 text-purple-500" />;
    defaultText = "Confidential";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-all select-none",
        badgeStyle,
        pulse && "animate-pulse",
        className
      )}
    >
      {icon}
      <span>{label || defaultText}</span>
    </span>
  );
}
