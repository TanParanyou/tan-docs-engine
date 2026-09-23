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
      "bg-theme-primary hover:bg-theme-primary-hover text-theme-primary-text font-semibold border border-theme-border shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50",
    secondary:
      "bg-theme-surface hover:bg-theme-surface-hover text-theme-text border border-theme-border shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50",
    outline:
      "bg-transparent hover:bg-theme-surface-sunken text-theme-text border border-theme-border-subtle hover:border-theme-border active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50",
    ghost:
      "bg-transparent hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text disabled:opacity-50",
    danger:
      "bg-theme-danger-light hover:bg-theme-danger/20 text-theme-danger border border-theme-danger/40 shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50",
  };

  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs gap-1 rounded-retro",
    md: "px-3.5 py-1.5 text-xs gap-1.5 rounded-retro",
    lg: "px-4 py-2 text-sm gap-2 rounded-retro",
  };

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all select-none cursor-pointer",
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
