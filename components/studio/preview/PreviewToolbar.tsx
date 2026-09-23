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
    <div className="border-b border-theme-border bg-theme-surface px-2.5 sm:px-4 py-2 flex items-center justify-between sticky top-0 z-20 shadow-retro-sm flex-shrink-0 select-none gap-2 overflow-x-auto">
      {/* Title & Document Badge */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-theme-accent flex-shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-theme-text font-mono whitespace-nowrap">
            <span className="hidden xs:inline">Document </span>Preview
          </span>
        </div>
        {documentNumber && (
          <span className="h-7 sm:h-8 inline-flex items-center text-[10px] sm:text-xs font-mono px-2 rounded-retro bg-theme-surface-sunken text-theme-text border border-theme-border hidden lg:inline-flex font-semibold shadow-retro-sm whitespace-nowrap">
            {documentNumber} {version ? `v${version}` : ""}
          </span>
        )}
      </div>

      {/* Zoom and Page View Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs flex-shrink-0">
        {/* Page View Mode Toggle */}
        <button
          type="button"
          onClick={onToggleA4PageMode}
          className={`h-7 sm:h-8 px-2 sm:px-3 rounded-retro text-[11px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-retro-sm whitespace-nowrap ${
            isA4PageMode
              ? "bg-theme-accent-light text-theme-accent-text border border-theme-accent font-bold"
              : "bg-theme-surface-sunken text-theme-text-muted hover:text-theme-text border border-theme-border"
          }`}
          title="Toggle A4 Document Sheet View (แสดงแบบแผ่นกระดาษ A4)"
        >
          <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-theme-accent flex-shrink-0" />
          <span className="hidden sm:inline">A4 Sheet</span>
          <span className="sm:hidden">A4</span>
        </button>

        <div className="h-4 sm:h-5 w-px bg-theme-border-subtle" />

        {/* Zoom Buttons Group */}
        <div className="h-7 sm:h-8 flex items-center bg-theme-surface-sunken border border-theme-border rounded-retro p-0.5 gap-0.5 sm:gap-1 shadow-retro-sm flex-shrink-0">
          <button
            type="button"
            onClick={onZoomOut}
            className="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center hover:bg-theme-surface rounded-retro text-theme-text transition-colors cursor-pointer"
            title="Zoom Out (ย่อส่วน)"
          >
            <ZoomOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <span className="px-1 sm:px-2 font-mono text-[10px] sm:text-xs text-theme-text font-semibold min-w-[34px] sm:min-w-[42px] text-center whitespace-nowrap">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            className="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center hover:bg-theme-surface rounded-retro text-theme-text transition-colors cursor-pointer"
            title="Zoom In (ขยายส่วน)"
          >
            <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            className="h-6 w-6 sm:h-7 sm:w-7 hidden sm:flex items-center justify-center hover:bg-theme-surface rounded-retro text-theme-text-muted hover:text-theme-text transition-colors cursor-pointer border-l border-theme-border-subtle pl-1"
            title="Reset Zoom (คืนค่า 100%)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
