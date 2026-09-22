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
    <div className="border-b border-slate-300 bg-white px-3 sm:px-5 py-2 flex items-center justify-between sticky top-0 z-20 shadow-xs flex-shrink-0 select-none">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Document Preview
          </span>
        </div>
        {documentNumber && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline">
            {documentNumber} {version ? `v${version}` : ""}
          </span>
        )}
      </div>

      {/* Zoom and Page View Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs">
        {/* Page View Mode Toggle */}
        <button
          type="button"
          onClick={onToggleA4PageMode}
          className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
            isA4PageMode
              ? "bg-blue-50 text-blue-700 border border-blue-200 font-semibold"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
          }`}
          title="Toggle A4 Document Sheet View"
        >
          <Printer className="w-3 h-3" />
          <span>A4 Sheet</span>
        </button>

        <div className="h-3.5 w-px bg-slate-200" />

        {/* Zoom Buttons */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-md p-0.5">
          <button
            type="button"
            onClick={onZoomOut}
            className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="px-1.5 font-mono text-[10px] text-slate-600 font-semibold min-w-[36px] text-center">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-900"
            title="Reset Zoom"
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
