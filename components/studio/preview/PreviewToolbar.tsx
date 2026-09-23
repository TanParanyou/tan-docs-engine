"use client";

import React from "react";
import { Eye, Printer, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface PreviewToolbarProps {
  documentNumber?: string;
  version?: string;
  isA4PageMode: boolean;
  onToggleA4PageMode: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export default function PreviewToolbar({
  documentNumber,
  version,
  isA4PageMode,
  onToggleA4PageMode,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: PreviewToolbarProps) {
  return (
    <div className="border-b border-theme-border bg-theme-surface px-3 sm:px-5 py-2 flex items-center justify-between sticky top-0 z-20 shadow-retro-sm flex-shrink-0 select-none">
      {/* Title & Document Badge */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-theme-accent" />
          <span className="text-xs font-bold uppercase tracking-wider text-theme-text font-mono">
            Document Preview
          </span>
        </div>
        {documentNumber && (
          <span className="h-8 inline-flex items-center text-xs font-mono px-2.5 rounded-retro bg-theme-surface-sunken text-theme-text border border-theme-border hidden sm:inline-flex font-semibold shadow-retro-sm">
            {documentNumber} {version ? `v${version}` : ""}
          </span>
        )}
      </div>

      {/* Zoom and Page View Controls */}
      <div className="flex items-center space-x-2 text-xs">
        {/* Page View Mode Toggle */}
        <button
          type="button"
          onClick={onToggleA4PageMode}
          className={`h-8 px-3 rounded-retro text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-retro-sm ${
            isA4PageMode
              ? "bg-theme-accent-light text-theme-accent-text border border-theme-accent font-bold"
              : "bg-theme-surface-sunken text-theme-text-muted hover:text-theme-text border border-theme-border"
          }`}
          title="Toggle A4 Document Sheet View (แสดงแบบแผ่นกระดาษ A4)"
        >
          <Printer className="w-3.5 h-3.5 text-theme-accent" />
          <span>A4 Sheet</span>
        </button>

        <div className="h-5 w-px bg-theme-border-subtle" />

        {/* Zoom Buttons Group */}
        <div className="h-8 flex items-center bg-theme-surface-sunken border border-theme-border rounded-retro p-0.5 gap-1 shadow-retro-sm">
          <button
            type="button"
            onClick={onZoomOut}
            className="h-7 w-7 flex items-center justify-center hover:bg-theme-surface rounded-retro text-theme-text transition-colors cursor-pointer"
            title="Zoom Out (ย่อส่วน)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono text-xs text-theme-text font-semibold min-w-[42px] text-center">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            className="h-7 w-7 flex items-center justify-center hover:bg-theme-surface rounded-retro text-theme-text transition-colors cursor-pointer"
            title="Zoom In (ขยายส่วน)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            className="h-7 w-7 flex items-center justify-center hover:bg-theme-surface rounded-retro text-theme-text-muted hover:text-theme-text transition-colors cursor-pointer border-l border-theme-border-subtle pl-1"
            title="Reset Zoom (คืนค่า 100%)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
