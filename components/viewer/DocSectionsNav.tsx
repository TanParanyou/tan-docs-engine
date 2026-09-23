"use client";

import React, { useEffect, useState } from "react";
import { FileText, Layers, ChevronRight, BookOpen, FileCheck } from "lucide-react";
import { MarkdownFileItem } from "@/lib/types";

export type FileViewMode = "combined" | "single";

interface DocSectionsNavProps {
  files: MarkdownFileItem[];
  selectedFile: string | "all";
  viewMode: FileViewMode;
  onSelectFile: (filename: string | "all") => void;
  onChangeViewMode: (mode: FileViewMode) => void;
}

export default function DocSectionsNav({
  files,
  selectedFile,
  viewMode,
  onSelectFile,
  onChangeViewMode,
}: DocSectionsNavProps) {
  const [activeSection, setActiveSection] = useState<number>(0);

  // Smooth scroll handler when in combined mode
  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, idx: number) => {
    e.preventDefault();
    setActiveSection(idx);

    const targetEl = document.getElementById(`section-${idx}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#section-${idx}`);
    }
  };

  // Scrollspy to detect active section in view (only in combined mode)
  useEffect(() => {
    if (viewMode !== "combined") return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      for (let i = files.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${i}`);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            setActiveSection(i);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [files, viewMode]);

  if (!files || files.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Mode Switcher Tabs */}
      {files.length > 1 && (
        <div className="grid grid-cols-2 p-1 bg-theme-surface-sunken rounded-retro border border-theme-border text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => {
              onChangeViewMode("combined");
              onSelectFile("all");
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-retro transition-all ${
              viewMode === "combined"
                ? "bg-theme-surface text-theme-text shadow-retro-sm border border-theme-border font-bold"
                : "text-theme-text-muted hover:text-theme-text border border-transparent"
            }`}
            title="รวมทุกไฟล์ต่อกันเป็นเล่มเดียว (ขึ้นหน้า A4 ใหม่ทุกไฟล์)"
          >
            <Layers className="w-3.5 h-3.5 text-theme-primary" />
            <span>รวมเล่ม</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeViewMode("single");
              if (selectedFile === "all") {
                onSelectFile(files[0].filename);
              }
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-retro transition-all ${
              viewMode === "single"
                ? "bg-theme-surface text-theme-text shadow-retro-sm border border-theme-border font-bold"
                : "text-theme-text-muted hover:text-theme-text border border-transparent"
            }`}
            title="เลือกอ่านทีละไฟล์เป็นอิสระ"
          >
            <FileText className="w-3.5 h-3.5 text-theme-accent" />
            <span>แยกไฟล์</span>
          </button>
        </div>
      )}

      {/* In Combined Mode: "All in One" option + Sections anchors */}
      {viewMode === "combined" && (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              onSelectFile("all");
            }}
            className="w-full flex items-center justify-between text-left text-xs font-semibold px-2.5 py-2 rounded-retro border bg-theme-accent-light text-theme-accent-text border-theme-accent/60 shadow-retro-sm transition-all"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-theme-accent" />
              <span>รวมทุกไฟล์ ({files.length} ไฟล์)</span>
            </div>
            <span className="text-[10px] font-mono bg-theme-surface px-1.5 py-0.5 rounded-retro border border-theme-accent/40 font-bold">
              All
            </span>
          </button>

          {/* Sub-sections links to jump inside booklet */}
          <div className="pt-1.5 pl-2 space-y-1 border-l-2 border-theme-border-subtle ml-2">
            {files.map((file, idx) => {
              const isAnchorActive = activeSection === idx;
              return (
                <a
                  key={file.filename}
                  href={`#section-${idx}`}
                  onClick={(e) => handleScrollToSection(e, idx)}
                  className={`group flex items-center justify-between text-xs px-2 py-1.5 rounded-retro border transition-all ${
                    isAnchorActive
                      ? "text-theme-primary font-bold bg-theme-surface-hover border-theme-border-subtle"
                      : "text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-hover border-transparent"
                  }`}
                  title={`เลื่อนไปที่ ${file.filename}`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-mono text-theme-text-faint w-3.5 text-center">
                      {idx + 1}.
                    </span>
                    <span className="truncate font-mono text-[11px]">
                      {file.filename}
                    </span>
                  </div>
                  {isAnchorActive && (
                    <ChevronRight className="w-3 h-3 text-theme-primary flex-shrink-0 animate-pulse" />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* In Single Mode: File Selector List */}
      {viewMode === "single" && (
        <nav className="space-y-1" aria-label="Single file selector">
          {files.map((file, idx) => {
            const isCurrentFile = selectedFile === file.filename;
            return (
              <button
                key={file.filename}
                type="button"
                onClick={() => {
                  onSelectFile(file.filename);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-full group flex items-center justify-between gap-2 text-xs font-medium px-2.5 py-2 rounded-retro border transition-all text-left select-none ${
                  isCurrentFile
                    ? "bg-theme-accent-light text-theme-accent-text border-theme-accent/60 shadow-retro-sm font-semibold"
                    : "text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-hover border-transparent hover:border-theme-border-subtle"
                }`}
                title={`อ่านเฉพาะ ${file.filename}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isCurrentFile ? (
                    <FileCheck className="w-3.5 h-3.5 text-theme-accent flex-shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-theme-text-faint group-hover:text-theme-text-muted flex-shrink-0" />
                  )}
                  <span className="truncate font-mono text-[11px] sm:text-xs">
                    {file.filename}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded-retro bg-theme-surface-sunken text-theme-text-muted">
                    #{idx + 1}
                  </span>
                  {isCurrentFile && (
                    <ChevronRight className="w-3.5 h-3.5 text-theme-accent" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
