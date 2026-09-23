"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  className?: string;
  bodyClassName?: string;
  closeOnEsc?: boolean;
  closeOnBackdropClick?: boolean;
}

const maxWidthMap: Record<NonNullable<ModalProps["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-[96vw] w-[96vw]",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  badge,
  headerActions,
  children,
  footer,
  maxWidth = "2xl",
  className = "",
  bodyClassName = "",
  closeOnEsc = true,
  closeOnBackdropClick = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        className={cn(
          "bg-theme-surface rounded-retro shadow-retro-lg border-2 border-theme-border w-full overflow-hidden flex flex-col max-h-[90vh]",
          maxWidthMap[maxWidth],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || headerActions) && (
          <div className="px-6 py-4 bg-theme-surface-sunken border-b-2 border-theme-border text-theme-text flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3 min-w-0 pr-2">
              {icon && (
                <div className="w-9 h-9 rounded-retro bg-theme-primary flex items-center justify-center text-theme-primary-text border border-theme-border shadow-retro-sm flex-shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {typeof title === "string" ? (
                    <h2 className="font-bold text-base tracking-tight text-theme-text font-sans m-0 p-0 border-none truncate">
                      {title}
                    </h2>
                  ) : (
                    title
                  )}
                  {badge}
                </div>
                {subtitle && (
                  <p className="text-xs text-theme-text-muted m-0 mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {headerActions}
              <button
                onClick={onClose}
                type="button"
                className="p-1.5 rounded-retro hover:bg-theme-surface text-theme-text-muted hover:text-theme-text border border-theme-border cursor-pointer transition-colors shadow-retro-sm"
                title="ปิด (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className={cn("flex-1 overflow-y-auto text-theme-text", bodyClassName)}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3.5 bg-theme-surface-sunken border-t-2 border-theme-border flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
