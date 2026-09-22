"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  responsiveText?: boolean; // When true, text is hidden on small screens
}

export default function ActionButton({
  children,
  variant = "secondary",
  size = "md",
  icon,
  isLoading = false,
  loadingText,
  responsiveText = false,
  className,
  disabled,
  ...props
}: ActionButtonProps) {
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs disabled:opacity-50",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs disabled:opacity-50",
    outline:
      "bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-50",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-50",
    danger:
      "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-xs disabled:opacity-50",
  };

  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs gap-1 rounded-md",
    md: "px-3.5 py-1.5 text-xs gap-1.5 rounded-lg",
    lg: "px-4 py-2 text-sm gap-2 rounded-xl",
  };

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all select-none active:scale-[0.98]",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}

      {children && (
        <span className={cn(responsiveText && "hidden sm:inline")}>
          {isLoading && loadingText ? loadingText : children}
        </span>
      )}
    </button>
  );
}
