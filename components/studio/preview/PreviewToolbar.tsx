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
    <div className="border-b border-slate-200 bg-white px-3 sm:px-5 py-2 flex items-center justify-between sticky top-0 z-20 shadow-2xs flex-shrink-0 select-none">
      {/* Title & Document Badge */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Document Preview
          </span>
        </div>
        {documentNumber && (
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 hidden sm:inline font-semibold">
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
          className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
            isA4PageMode
              ? "bg-blue-50 text-blue-700 border border-blue-200 font-semibold"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200"
          }`}
          title="Toggle A4 Document Sheet View (แสดงแบบแผ่นกระดาษ A4)"
        >
          <Printer className="w-3.5 h-3.5 text-blue-600" />
          <span>A4 Sheet</span>
        </button>

        <div className="h-5 w-px bg-slate-200" />

        {/* Zoom Buttons Group */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1 gap-1 shadow-2xs">
          <button
            type="button"
            onClick={onZoomOut}
            className="h-7 w-7 flex items-center justify-center hover:bg-white rounded-md text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Zoom Out (ย่อส่วน)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono text-xs text-slate-700 font-semibold min-w-[42px] text-center">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            className="h-7 w-7 flex items-center justify-center hover:bg-white rounded-md text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Zoom In (ขยายส่วน)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            className="h-7 w-7 flex items-center justify-center hover:bg-white rounded-md text-slate-500 hover:text-slate-900 transition-colors cursor-pointer border-l border-slate-200 pl-1"
            title="Reset Zoom (คืนค่า 100%)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
