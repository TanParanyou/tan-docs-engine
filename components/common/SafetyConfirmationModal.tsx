"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react";

export interface SafetyConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning";
  icon?: "trash" | "warning";
}

export default function SafetyConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "ยืนยันการลบ",
  cancelText = "ยกเลิก",
  isLoading = false,
  variant = "danger",
  icon = "trash",
}: SafetyConfirmationModalProps) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-50 bg-theme-text/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-theme-surface border-2 border-theme-border shadow-retro p-6 rounded-retro relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 p-1 text-theme-text-muted hover:text-theme-text rounded-retro border border-transparent hover:border-theme-border disabled:opacity-30 cursor-pointer transition-colors"
          title="ปิด (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-retro border-2 flex items-center justify-center flex-shrink-0 shadow-retro-sm ${
              isDanger
                ? "bg-theme-danger-light border-theme-danger text-theme-danger"
                : "bg-theme-warning-light border-theme-warning text-theme-warning"
            }`}
          >
            {icon === "trash" ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div className="pr-6">
            <h3 className="font-bold text-base text-theme-text font-sans leading-tight">
              {title}
            </h3>
            <span
              className={`inline-block text-[10px] font-mono font-bold uppercase tracking-wider mt-1 px-1.5 py-0.2 border rounded-retro ${
                isDanger
                  ? "bg-theme-danger-light text-theme-danger border-theme-danger/30"
                  : "bg-theme-warning-light text-theme-warning border-theme-warning/30"
              }`}
            >
              {isDanger ? "Irreversible Action" : "Confirmation Required"}
            </span>
          </div>
        </div>

        {/* Modal Description */}
        <div className="text-xs text-theme-text-muted mb-6 leading-relaxed bg-theme-surface-sunken p-3 rounded-retro border border-theme-border-subtle">
          {description}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-theme-border-subtle">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-theme-surface hover:bg-theme-surface-hover text-theme-text border border-theme-border rounded-retro text-xs font-semibold shadow-retro-sm transition-all cursor-pointer active:translate-x-[0.5px] active:translate-y-[0.5px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 border rounded-retro text-xs font-bold shadow-retro-sm transition-all cursor-pointer flex items-center gap-1.5 active:translate-x-[0.5px] active:translate-y-[0.5px] disabled:opacity-50 disabled:cursor-not-allowed ${
              isDanger
                ? "bg-theme-danger text-white border-theme-border hover:bg-theme-danger/90"
                : "bg-theme-warning text-theme-warning-text border-theme-border hover:bg-theme-warning/90"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังดำเนินการ...</span>
              </>
            ) : (
              <>
                {icon === "trash" ? (
                  <Trash2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
