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

  let badgeStyle = "bg-theme-surface-sunken text-theme-text-muted border-theme-border-subtle";
  let icon = <Clock className="w-3 h-3 text-theme-text-muted" />;
  let defaultText = status;

  if (norm === "saved") {
    badgeStyle = "bg-theme-success-light text-theme-success border-theme-success/40";
    icon = <CheckCircle2 className="w-3 h-3 text-theme-success" />;
    defaultText = "Saved";
  } else if (norm === "unsaved" || norm === "dirty") {
    badgeStyle = "bg-theme-warning-light text-theme-warning border-theme-warning/40";
    icon = <Clock className="w-3 h-3 text-theme-warning" />;
    defaultText = "Unsaved Changes";
    pulse = true;
  } else if (norm === "approved") {
    badgeStyle = "bg-theme-success-light text-theme-success border-theme-success/40";
    icon = <CheckCircle2 className="w-3 h-3 text-theme-success" />;
    defaultText = "Approved";
  } else if (norm === "draft" || norm === "draft for confirmation") {
    badgeStyle = "bg-theme-warning-light text-theme-warning border-theme-warning/40";
    icon = <Clock className="w-3 h-3 text-theme-warning" />;
    defaultText = "Draft";
  } else if (norm === "review" || norm === "in review") {
    badgeStyle = "bg-theme-accent-light text-theme-accent-text border-theme-accent/40";
    icon = <Sparkles className="w-3 h-3 text-theme-accent" />;
    defaultText = "In Review";
  } else if (norm === "confidential") {
    badgeStyle = "bg-theme-danger-light text-theme-danger border-theme-danger/40";
    icon = <AlertCircle className="w-3 h-3 text-theme-danger" />;
    defaultText = "Confidential";
  }

  return (
    <span
      className={cn(
        "h-7.5 inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 rounded-retro border transition-all select-none shadow-[1px_1px_0px_rgba(0,0,0,0.06)]",
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
