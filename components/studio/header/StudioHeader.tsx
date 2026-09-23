"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Printer,
  ExternalLink,
  SlidersHorizontal,
  Menu,
} from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import ActionButton from "@/components/common/ActionButton";
import ExportDropdown, { ExportFormat } from "@/components/common/ExportDropdown";
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
  onExport?: (format: ExportFormat) => Promise<void> | void;
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
  onExport,
  onViewModeChange,
  onSplitRatioChange,
  onToggleSyncScroll,
  onToggleMobileDrawer,
}: StudioHeaderProps) {
  const { isMobile } = useResponsive();

  return (
    <header className="h-15 sm:h-16 bg-theme-surface border-b-2 border-theme-border px-3 sm:px-5 flex items-center justify-between z-30 select-none shadow-retro-sm gap-3">
      {/* Left: Workspace & File Metadata */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Drawer Toggle */}
        {isMobile && onToggleMobileDrawer && (
          <button
            type="button"
            onClick={onToggleMobileDrawer}
            className="h-9 w-9 flex items-center justify-center rounded-retro text-theme-text hover:bg-theme-surface-hover border border-theme-border cursor-pointer shadow-retro-sm"
            title="เปิดเมนูเอกสาร"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Back to Reader Link */}
        <Link
          href={`/${slug}`}
          className="h-9 inline-flex items-center gap-2 text-xs font-semibold text-theme-text hover:text-theme-primary bg-theme-surface hover:bg-theme-surface-hover px-3 rounded-retro transition-colors border border-theme-border shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] flex-shrink-0"
          title="Back to Document Reader View"
        >
          <ArrowLeft className="w-4 h-4 text-theme-text-muted" />
          <span className="hidden sm:inline">Reader View</span>
        </Link>

        <div className="h-5 w-px bg-theme-border-subtle hidden sm:block flex-shrink-0" />

        {/* File and Workspace Info */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-xs sm:text-sm text-theme-text truncate max-w-[120px] sm:max-w-[200px] font-sans">
            {workspaceName}
          </span>
          <span className="text-theme-border-subtle font-mono text-xs hidden sm:inline">/</span>
          <span className="text-xs font-mono text-theme-accent-text bg-theme-accent-light border border-theme-accent/60 px-2.5 py-1 rounded-retro font-semibold truncate max-w-[140px] sm:max-w-[220px]">
            {selectedFile}
          </span>
        </div>

        {/* Dirty / Saved Status Badge */}
        <div className="hidden xl:flex items-center gap-2 flex-shrink-0">
          {isDirty ? (
            <StatusBadge status="unsaved" label="Unsaved Changes" pulse />
          ) : (
            <StatusBadge
              status="saved"
              label={`Saved ${lastSavedTime ? `(${lastSavedTime})` : ""}`}
            />
          )}

          {saveToast && (
            <span className="text-xs font-semibold text-theme-success animate-fade-in">
              {saveToast}
            </span>
          )}
        </div>
      </div>

      {/* Center: View Mode & Split Presets (Desktop / Tablet only) */}
      <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
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
            className={`h-9 px-3 rounded-retro text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer shadow-retro-sm ${
              syncScroll
                ? "bg-theme-accent-light border-theme-accent text-theme-accent-text font-bold"
                : "bg-theme-surface-sunken border-theme-border text-theme-text-muted hover:text-theme-text hover:bg-theme-surface"
            }`}
            title="Synchronize scrolling between editor and preview"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Sync Scroll</span>
          </button>
        )}
      </div>

      {/* Right: Actions (Save, Print, Export) */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Quick Save */}
        <ActionButton
          variant="primary"
          onClick={onSave}
          disabled={isSaving}
          isLoading={isSaving}
          loadingText="Saving..."
          icon={<Save className="w-4 h-4" />}
          size="md"
          className="h-9 px-3.5 text-xs font-semibold"
          responsiveText
        >
          Save (⌘S)
        </ActionButton>

        {/* Print A4 */}
        <Link
          href={`/${slug}/print`}
          target="_blank"
          className="h-9 inline-flex items-center gap-1.5 text-xs font-medium text-theme-text hover:text-theme-text bg-theme-surface hover:bg-theme-surface-hover border border-theme-border px-3.5 rounded-retro shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] transition-colors cursor-pointer"
          title="Open Print A4 View"
        >
          <Printer className="w-3.5 h-3.5 text-theme-text-muted" />
          <span className="hidden sm:inline">Print A4</span>
          <ExternalLink className="w-3 h-3 text-theme-text-faint hidden sm:inline" />
        </Link>

        {/* Export Dropdown */}
        <ExportDropdown
          workspaceSlug={slug}
          currentFilename={selectedFile}
          variant="secondary"
          buttonSize="md"
          className="h-9"
          onCustomExport={onExport}
        />
      </div>
    </header>
  );
}
