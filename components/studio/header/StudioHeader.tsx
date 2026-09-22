"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Printer,
  Download,
  ExternalLink,
  SlidersHorizontal,
  Menu,
} from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import ActionButton from "@/components/common/ActionButton";
import ViewModeToggle from "./ViewModeToggle";
import SplitRatioPresets from "./SplitRatioPresets";
import { ViewMode } from "@/lib/store/useStudioStore";
import { useResponsive } from "@/hooks/useResponsive";

interface StudioHeaderProps {
  slug: string;
  workspaceName: string;
  selectedFile: string;
  isDirty: boolean;
  lastSavedTime: string | null;
  saveToast: string | null;
  viewMode: ViewMode;
  splitRatio: number;
  syncScroll: boolean;
  isSaving: boolean;
  isExportingPdf: boolean;
  onSave: () => void;
  onExportPdf: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSplitRatioChange: (ratio: number) => void;
  onToggleSyncScroll: () => void;
  onToggleMobileDrawer?: () => void;
}

export default function StudioHeader({
  slug,
  workspaceName,
  selectedFile,
  isDirty,
  lastSavedTime,
  saveToast,
  viewMode,
  splitRatio,
  syncScroll,
  isSaving,
  isExportingPdf,
  onSave,
  onExportPdf,
  onViewModeChange,
  onSplitRatioChange,
  onToggleSyncScroll,
  onToggleMobileDrawer,
}: StudioHeaderProps) {
  const { isMobile } = useResponsive();

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between flex-shrink-0 z-30 shadow-xs select-none">
      {/* Left: Brand, Back & File Badge */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {/* Mobile Drawer Button */}
        {isMobile && onToggleMobileDrawer && (
          <button
            type="button"
            onClick={onToggleMobileDrawer}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
            title="เปิดเมนูเอกสาร"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Back to Reader Link */}
        <Link
          href={`/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200 flex-shrink-0"
          title="Back to Document Reader View"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reader View</span>
        </Link>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* File and Workspace Info */}
        <div className="flex items-center space-x-1.5 min-w-0">
          <span className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[120px] sm:max-w-xs">
            {workspaceName}
          </span>
          <span className="text-slate-400 font-mono text-xs hidden sm:inline">/</span>
          <span className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md font-semibold truncate max-w-[140px] sm:max-w-[180px]">
            {selectedFile}
          </span>
        </div>

        {/* Dirty / Saved Status Badge */}
        <div className="hidden md:flex items-center space-x-2">
          {isDirty ? (
            <StatusBadge status="unsaved" label="Unsaved Changes" pulse />
          ) : (
            <StatusBadge
              status="saved"
              label={`Saved ${lastSavedTime ? `(${lastSavedTime})` : ""}`}
            />
          )}

          {saveToast && (
            <span className="text-xs font-semibold text-emerald-600 animate-fade-in">
              {saveToast}
            </span>
          )}
        </div>
      </div>

      {/* Center: View Mode & Split Presets (Desktop / Tablet only) */}
      <div className="hidden lg:flex items-center space-x-2">
        <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />

        {viewMode === "split" && (
          <SplitRatioPresets
            currentRatio={splitRatio}
            onSelectRatio={onSplitRatioChange}
          />
        )}

        {viewMode === "split" && (
          <button
            type="button"
            onClick={onToggleSyncScroll}
            className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border transition-colors ${
              syncScroll
                ? "bg-blue-50 border-blue-200 text-blue-700 font-semibold"
                : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800"
            }`}
            title="Synchronize scrolling between editor and preview"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Sync Scroll</span>
          </button>
        )}
      </div>

      {/* Right: Actions (Save, Print, Export) */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
        {/* Quick Save */}
        <ActionButton
          variant="primary"
          onClick={onSave}
          disabled={isSaving}
          isLoading={isSaving}
          loadingText="Saving..."
          icon={<Save className="w-3.5 h-3.5" />}
          responsiveText
        >
          Save (⌘S)
        </ActionButton>

        {/* Print A4 */}
        <Link
          href={`/${slug}/print`}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg shadow-xs transition-colors"
          title="Open Print A4 View"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Print A4</span>
          <ExternalLink className="w-2.5 h-2.5 text-slate-400 hidden sm:inline" />
        </Link>

        {/* Export PDF */}
        <ActionButton
          variant="secondary"
          onClick={onExportPdf}
          disabled={isExportingPdf}
          isLoading={isExportingPdf}
          loadingText="Generating..."
          icon={<Download className="w-3.5 h-3.5 text-slate-500" />}
          responsiveText
        >
          Export PDF
        </ActionButton>
      </div>
    </header>
  );
}
