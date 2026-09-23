"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WorkspaceData } from "@/lib/types";
import DocumentViewer from "@/components/viewer/DocumentViewer";
import DocSectionsNav, { FileViewMode } from "@/components/viewer/DocSectionsNav";
import ExportDropdown from "@/components/common/ExportDropdown";
import {
  ArrowLeft,
  Printer,
  Calendar,
  User,
  Building,
  CheckCircle2,
  Clock,
  Edit3,
} from "lucide-react";

interface WorkspaceReaderProps {
  workspace: WorkspaceData;
  coverPageHtml: string;
  primaryColor: string;
  accentColor: string;
}

export default function WorkspaceReader({
  workspace,
  coverPageHtml,
  primaryColor,
  accentColor,
}: WorkspaceReaderProps) {
  const { slug, config, files } = workspace;
  const [fileViewMode, setFileViewMode] = useState<FileViewMode>("combined");
  const [selectedFile, setSelectedFile] = useState<string | "all">("all");

  const handleSelectFile = (filename: string | "all") => {
    setSelectedFile(filename);
    if (filename !== "all") {
      setFileViewMode("single");
    }
  };

  const handleChangeViewMode = (mode: FileViewMode) => {
    setFileViewMode(mode);
    if (mode === "combined") {
      setSelectedFile("all");
    } else if (files.length > 0) {
      setSelectedFile(files[0].filename);
    }
  };

  const activeFileName =
    selectedFile !== "all"
      ? selectedFile
      : `ทั้งหมด (${files.length} ไฟล์)`;

  const fileQueryParam =
    selectedFile !== "all" ? `?file=${encodeURIComponent(selectedFile)}` : "";

  return (
    <div
      className="min-h-screen bg-theme-bg bg-retro-dots flex flex-col"
      style={
        {
          "--primary-color": primaryColor,
          "--accent-color": accentColor,
        } as React.CSSProperties
      }
    >
      {/* Top Header Navbar */}
      <header className="bg-theme-surface border-b-2 border-theme-border sticky top-0 z-40 shadow-retro-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-theme-text hover:text-theme-primary bg-theme-surface hover:bg-theme-surface-hover border border-theme-border shadow-retro-sm px-2.5 py-1.5 rounded-retro active:translate-x-[1px] active:translate-y-[1px] transition-all flex-shrink-0"
              title="กลับหน้าหลัก"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Back</span>
            </Link>
            <div className="h-4 w-px bg-theme-border-subtle flex-shrink-0" />
            <div className="min-w-0 truncate">
              <span className="font-bold text-theme-text text-xs sm:text-sm truncate inline-block max-w-[120px] sm:max-w-[200px] md:max-w-none align-middle font-sans">
                {config.name}
              </span>
              <span className="mx-1.5 text-theme-border-subtle">/</span>
              <span className="text-[11px] sm:text-xs text-theme-text-muted font-mono">
                v{config.version}
              </span>
              {selectedFile !== "all" && (
                <span className="hidden md:inline-flex items-center ml-2 px-1.5 py-0.5 rounded-retro bg-theme-accent-light text-theme-accent-text border border-theme-accent/40 text-[10px] font-mono">
                  {selectedFile}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
            <Link
              href={`/${slug}/edit`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-accent-text bg-theme-accent-light hover:bg-theme-accent/20 border border-theme-accent/60 shadow-retro-sm px-2.5 sm:px-3 py-1.5 rounded-retro active:translate-x-[1px] active:translate-y-[1px] transition-all"
              title="แก้ไขใน Studio"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit in Studio</span>
            </Link>

            <Link
              href={`/${slug}/print${fileQueryParam}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-theme-text hover:text-theme-primary bg-theme-surface hover:bg-theme-surface-hover border border-theme-border shadow-retro-sm px-2 sm:px-3 py-1.5 rounded-retro active:translate-x-[1px] active:translate-y-[1px] transition-all"
              title="พิมพ์เอกสาร A4"
            >
              <Printer className="w-3.5 h-3.5 text-theme-text-muted" />
              <span className="hidden md:inline">Print A4</span>
            </Link>

            <ExportDropdown workspaceSlug={slug} variant="primary" />
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 w-full flex-1 flex gap-8">
        {/* Left Sticky Sidebar: Table of Contents & Metadata */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* Meta Summary Card */}
            <div className="bg-theme-surface rounded-retro border-2 border-theme-border p-5 shadow-retro-sm space-y-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-theme-text-muted block mb-1">
                  Document Info
                </span>
                <h3 className="font-bold text-theme-text text-sm leading-snug">
                  {config.title}
                </h3>
              </div>

              <div className="space-y-2.5 text-xs border-t border-theme-border-subtle pt-3">
                <div className="flex items-center gap-2 text-theme-text-muted">
                  <Calendar className="w-3.5 h-3.5 text-theme-text-faint" />
                  <span>{config.date}</span>
                </div>
                <div className="flex items-center gap-2 text-theme-text-muted">
                  <User className="w-3.5 h-3.5 text-theme-text-faint" />
                  <span className="truncate">{config.author}</span>
                </div>
                {config.client && (
                  <div className="flex items-center gap-2 text-theme-text-muted">
                    <Building className="w-3.5 h-3.5 text-theme-text-faint" />
                    <span className="truncate">{config.client}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-retro text-[11px] font-mono font-semibold border ${
                      config.status === "Approved"
                        ? "bg-theme-success-light text-theme-success border-theme-success/40"
                        : "bg-theme-warning-light text-theme-warning border-theme-warning/40"
                    }`}
                  >
                    {config.status === "Approved" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {config.status || "Draft"}
                  </span>
                  <span className="text-theme-border-subtle">&bull;</span>
                  <span className="text-theme-text-muted font-mono text-[11px]">
                    {config.documentNumber || `v${config.version}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Sections / Files Selector */}
            <div className="bg-theme-surface rounded-retro border-2 border-theme-border p-4 sm:p-5 shadow-retro-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-theme-text-muted block">
                  Sections & Files
                </span>
                <span className="text-[10px] font-mono text-theme-text-faint">
                  {files.length} Files
                </span>
              </div>
              <DocSectionsNav
                files={files}
                selectedFile={selectedFile}
                viewMode={fileViewMode}
                onSelectFile={handleSelectFile}
                onChangeViewMode={handleChangeViewMode}
              />
            </div>
          </div>
        </aside>

        {/* Main Content Area - Rendered via DocumentViewer */}
        <main className="flex-1 min-w-0">
          <DocumentViewer
            key={`${slug}-${selectedFile}`}
            workspaceSlug={slug}
            config={config}
            coverPageHtml={coverPageHtml}
            files={files}
            selectedFile={selectedFile}
            primaryColor={primaryColor}
            accentColor={accentColor}
            initialMode="paged"
          />
        </main>
      </div>
    </div>
  );
}
