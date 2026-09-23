"use client";

import React, { useState, useMemo } from "react";
import { DocsConfig, MarkdownFileItem } from "@/lib/types";
import { useDocumentViewMode, DocumentViewMode } from "@/hooks/useDocumentViewMode";
import {
  FileText,
  FileCode2,
  ScrollText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Printer,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Smartphone,
} from "lucide-react";

export interface DocumentViewerHandle {
  scrollToPercentage: (percentage: number) => void;
  scrollToHeading: (headingText: string) => void;
}

export interface DocumentViewerProps {
  workspaceSlug: string;
  config: DocsConfig;
  coverPageHtml?: string;
  files?: MarkdownFileItem[];
  selectedFile?: string | "all";
  liveHtml?: string;
  primaryColor?: string;
  accentColor?: string;
  initialMode?: DocumentViewMode;
  showToolbar?: boolean;
  stickyClassName?: string;
  contentClassName?: string;
  className?: string;
}

interface PageItem {
  pageNumber: number;
  type: "cover" | "content";
  filename?: string;
  fileIndex?: number;
  isFirstPageOfFile?: boolean;
  html: string;
}

const DocumentViewer = React.forwardRef<DocumentViewerHandle, DocumentViewerProps>(
  (
    {
      workspaceSlug,
      config,
      coverPageHtml,
      files = [],
      selectedFile = "all",
      liveHtml,
      primaryColor = "#0f3b6c",
      accentColor = "#1d4ed8",
      initialMode = "paged",
      showToolbar = true,
      stickyClassName = "sticky top-14 sm:top-16 z-30",
      contentClassName = "",
      className = "",
    },
    ref
  ) => {
    const {
      viewMode,
      setViewMode,
      zoom,
      zoomIn,
      zoomOut,
      resetZoom,
    } = useDocumentViewMode({ defaultMode: initialMode });

    const [pdfKey, setPdfKey] = useState<number>(0);
    const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
    const [activePage, setActivePage] = useState<number>(1);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Expose scrolling methods to parent
    React.useImperativeHandle(ref, () => ({
      scrollToPercentage: (percentage: number) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const maxScroll = container.scrollHeight - container.clientHeight;
        if (maxScroll > 0) {
          container.scrollTop = percentage * maxScroll;
        }
      },
      scrollToHeading: (headingText: string) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cleanTarget = headingText.toLowerCase().trim();
        const headings = container.querySelectorAll("h1, h2, h3, h4");
        for (let i = 0; i < headings.length; i++) {
          const h = headings[i] as HTMLElement;
          const text = h.textContent?.toLowerCase().trim() || "";
          if (text.includes(cleanTarget) || cleanTarget.includes(text)) {
            h.scrollIntoView({ behavior: "smooth", block: "start" });
            h.classList.add("bg-blue-100", "transition-colors");
            setTimeout(() => h.classList.remove("bg-blue-100"), 1500);
            break;
          }
        }
      },
    }));

  // Filter active files based on selectedFile
  const activeFiles = useMemo(() => {
    if (!selectedFile || selectedFile === "all") {
      return files;
    }
    const matched = files.filter((f) => f.filename === selectedFile);
    return matched.length > 0 ? matched : files;
  }, [files, selectedFile]);

  // Divide document into distinct A4 pages based on cover and page-break tags
  const pages = useMemo<PageItem[]>(() => {
    const list: PageItem[] = [];
    let pageCounter = 1;

    // Page 1: Cover Page (if present)
    if (coverPageHtml && coverPageHtml.trim().length > 0) {
      list.push({
        pageNumber: pageCounter++,
        type: "cover",
        html: coverPageHtml,
      });
    }

    // If liveHtml is provided (e.g. from real-time Studio editing)
    if (liveHtml !== undefined) {
      const parts = liveHtml.split(/<div class="page-break"><\/div>/gi);
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.length > 0) {
          list.push({
            pageNumber: pageCounter++,
            type: "content",
            html: trimmed,
          });
        }
      }
      return list;
    }

    // Subsequent Pages: Markdown files split by <div class="page-break"></div>
    for (let fIdx = 0; fIdx < activeFiles.length; fIdx++) {
      const file = activeFiles[fIdx];
      const parts = file.html.split(/<div class="page-break"><\/div>/gi);
      let isFirstPageOfFile = true;
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.length > 0) {
          list.push({
            pageNumber: pageCounter++,
            type: "content",
            filename: file.filename,
            fileIndex: fIdx,
            isFirstPageOfFile,
            html: trimmed,
          });
          isFirstPageOfFile = false;
        }
      }
    }

    return list;
  }, [coverPageHtml, activeFiles, liveHtml]);

  const totalPages = pages.length;

  const handleRefreshPdf = () => {
    setIsPdfLoading(true);
    setPdfKey((prev) => prev + 1);
  };

  const fileParam = selectedFile && selectedFile !== "all" ? `&file=${encodeURIComponent(selectedFile)}` : "";
  const fileQueryParam = selectedFile && selectedFile !== "all" ? `?file=${encodeURIComponent(selectedFile)}` : "";
  const pdfUrl = `/api/pdf?workspace=${workspaceSlug}${fileParam}&inline=true`;
  const printUrl = `/${workspaceSlug}/print${fileQueryParam}`;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Viewer Floating/Sticky Toolbar matching Light Clean Retro Theme */}
      {showToolbar && (
        <div className={`${stickyClassName} bg-theme-surface/95 backdrop-blur-sm text-theme-text border border-theme-border px-2.5 sm:px-4 py-1.5 sm:py-2 shadow-retro-sm flex items-center justify-between gap-1.5 sm:gap-2.5 rounded-retro select-none transition-colors overflow-x-auto scrollbar-none`}>
          {/* View Mode Switcher Pills */}
          <div className="flex items-center bg-theme-surface-sunken p-0.5 rounded-retro border border-theme-border flex-shrink-0">
            <button
              onClick={() => setViewMode("paged")}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-retro text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                viewMode === "paged"
                  ? "bg-theme-accent-light text-theme-accent-text shadow-retro-sm border border-theme-accent font-bold"
                  : "text-theme-text-muted hover:text-theme-text hover:bg-theme-surface border border-transparent"
              }`}
              title="A4 Paged View (แบ่งหน้า 1, 2, 3...)"
            >
              <FileText className="w-3.5 h-3.5 text-theme-accent" />
              <span>A4<span className="hidden md:inline"> แยกหน้า</span></span>
              <span className="ml-0.5 px-1 py-0.2 text-[9px] sm:text-[10px] rounded-retro bg-theme-surface text-theme-accent-text border border-theme-accent/40 font-mono font-bold">
                {totalPages}
              </span>
            </button>

            <button
              onClick={() => setViewMode("pdf")}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-retro text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                viewMode === "pdf"
                  ? "bg-theme-accent-light text-theme-accent-text shadow-retro-sm border border-theme-accent font-bold"
                  : "text-theme-text-muted hover:text-theme-text hover:bg-theme-surface border border-transparent"
              }`}
              title="PDF ตัวจริง (Puppeteer Engine Preview)"
            >
              <FileCode2 className="w-3.5 h-3.5 text-theme-accent" />
              <span>PDF<span className="hidden md:inline"> ตัวจริง</span></span>
            </button>

            <button
              onClick={() => setViewMode("continuous")}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-retro text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                viewMode === "continuous"
                  ? "bg-theme-accent-light text-theme-accent-text shadow-retro-sm border border-theme-accent font-bold"
                  : "text-theme-text-muted hover:text-theme-text hover:bg-theme-surface border border-transparent"
              }`}
              title="เว็บต่อเนื่อง (Continuous Web View)"
            >
              <ScrollText className="w-3.5 h-3.5 text-theme-accent" />
              <span>เว็บ<span className="hidden md:inline">ต่อเนื่อง</span></span>
            </button>
          </div>

          {/* Quick Page Jump (Only in Paged Mode) */}
          {viewMode === "paged" && totalPages > 1 && (
            <div className="flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs text-theme-text bg-theme-surface-sunken px-1.5 sm:px-2 py-1 rounded-retro border border-theme-border shadow-retro-sm flex-shrink-0">
              <button
                disabled={activePage <= 1}
                onClick={() => {
                  const target = Math.max(1, activePage - 1);
                  setActivePage(target);
                  document.getElementById(`page-${target}`)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="p-0.5 sm:p-1 hover:bg-theme-surface hover:text-theme-text disabled:opacity-30 rounded-retro transition-colors"
                title="หน้าก่อนหน้า"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-theme-text px-0.5 whitespace-nowrap">
                {activePage}/{totalPages}
              </span>
              <button
                disabled={activePage >= totalPages}
                onClick={() => {
                  const target = Math.min(totalPages, activePage + 1);
                  setActivePage(target);
                  document.getElementById(`page-${target}`)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="p-0.5 sm:p-1 hover:bg-theme-surface hover:text-theme-text disabled:opacity-30 rounded-retro transition-colors"
                title="หน้าถัดไป"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Zoom and Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto flex-shrink-0">
            {viewMode !== "pdf" && (
              <div className="hidden sm:flex items-center bg-theme-surface-sunken rounded-retro border border-theme-border p-0.5 shadow-retro-sm">
                <button
                  onClick={zoomOut}
                  className="p-1 sm:p-1.5 text-theme-text-muted hover:text-theme-text hover:bg-theme-surface rounded-retro transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={resetZoom}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-mono font-semibold text-theme-text hover:text-theme-primary"
                  title="Reset Zoom"
                >
                  {zoom}%
                </button>
                <button
                  onClick={zoomIn}
                  className="p-1 sm:p-1.5 text-theme-text-muted hover:text-theme-text hover:bg-theme-surface rounded-retro transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {viewMode === "pdf" && (
              <button
                onClick={handleRefreshPdf}
                className="inline-flex items-center gap-1 text-xs text-theme-text hover:text-theme-primary bg-theme-surface hover:bg-theme-surface-hover border border-theme-border px-2 sm:px-2.5 py-1.5 rounded-retro shadow-retro-sm transition-colors active:translate-x-[0.5px] active:translate-y-[0.5px]"
                title="รีเฟรช PDF"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPdfLoading ? "animate-spin text-theme-accent" : ""}`} />
                <span className="hidden lg:inline font-medium">รีเฟรช</span>
              </button>
            )}

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-theme-text hover:text-theme-primary bg-theme-surface hover:bg-theme-surface-hover border border-theme-border px-2 sm:px-2.5 py-1.5 rounded-retro shadow-retro-sm transition-colors active:translate-x-[0.5px] active:translate-y-[0.5px]"
              title="เปิด PDF ในแท็บใหม่เต็มจอ"
            >
              <ExternalLink className="w-3.5 h-3.5 text-theme-text-muted" />
              <span className="hidden lg:inline font-medium">เต็มจอ</span>
            </a>

            <a
              href={printUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-theme-text hover:text-theme-primary bg-theme-surface hover:bg-theme-surface-hover border border-theme-border px-2 sm:px-2.5 py-1.5 rounded-retro shadow-retro-sm transition-colors active:translate-x-[0.5px] active:translate-y-[0.5px]"
              title="พิมพ์เอกสาร (Print Window)"
            >
              <Printer className="w-3.5 h-3.5 text-theme-text-muted" />
              <span className="hidden lg:inline font-medium">พิมพ์</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Document Content Area */}
      <div className={`w-full ${contentClassName}`}>

      {/* VIEW MODE 1: A4 PAGED VIEW (แยกหน้า 1, 2, 3...) */}
      {viewMode === "paged" && (
        <div
          className="flex flex-col items-center gap-6 sm:gap-10 py-2 sm:py-4 transition-transform duration-200 origin-top w-full"
          style={{ transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined }}
        >
          {pages.map((page) => (
            <div
              key={`paged-${page.pageNumber}`}
              id={`page-${page.pageNumber}`}
              className="relative group w-full max-w-[210mm] scroll-mt-20 sm:scroll-mt-24"
              onMouseEnter={() => setActivePage(page.pageNumber)}
            >
              {/* Anchor for Section/File navigation */}
              {page.isFirstPageOfFile && page.fileIndex !== undefined && (
                <span
                  id={`section-${page.fileIndex}`}
                  className="absolute -top-20 sm:-top-24 left-0 block pointer-events-none"
                  aria-hidden="true"
                />
              )}

              {/* Floating Page Badge on top right of sheet */}
              <div className="absolute -top-3 right-3 sm:right-6 z-10 flex items-center gap-1.5 bg-theme-surface text-theme-text text-[10px] sm:text-[11px] font-mono px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-retro shadow-retro-sm border border-theme-border">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500"></span>
                <span>
                  หน้า {page.pageNumber} / {totalPages}
                </span>
                {page.type === "cover" && (
                  <span className="text-[9px] sm:text-[10px] bg-theme-accent-light text-theme-accent-text border border-theme-accent/40 px-1 py-0.2 rounded-retro font-sans">
                    หน้าปก
                  </span>
                )}
              </div>

              {/* Physical A4 Sheet Container */}
              <div
                className="bg-white rounded-md border border-slate-300/80 shadow-xl sm:shadow-2xl p-5 sm:p-10 md:p-14 lg:p-16 min-h-[auto] sm:min-h-[297mm] flex flex-col justify-between text-slate-900 relative overflow-hidden"
                style={
                  {
                    "--primary-color": primaryColor,
                    "--accent-color": accentColor,
                  } as React.CSSProperties
                }
              >
                {/* Running Header on Content Pages */}
                {page.type === "content" && (
                  <div className="pb-3 sm:pb-4 mb-5 sm:mb-8 border-b border-slate-200 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono">
                    <span className="truncate max-w-[65%] sm:max-w-[70%] text-slate-600 font-sans font-medium">
                      {config.title}
                    </span>
                    <span>{config.documentNumber || `v${config.version}`}</span>
                  </div>
                )}

                {/* Main Page Body */}
                <div className="doc-content flex-1 overflow-x-auto">
                  <div
                    dangerouslySetInnerHTML={{ __html: page.html }}
                    className="markdown-rendered-body"
                  />
                </div>

                {/* Running Footer on All Pages */}
                <div className="pt-4 sm:pt-6 mt-8 sm:mt-12 border-t border-slate-200 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono">
                  <span className="truncate max-w-[60%]">
                    {config.organization || "TAN TECHNOLOGY SOLUTIONS"} &bull; {config.date}
                  </span>
                  <span className="font-bold text-slate-600">
                    หน้า {page.pageNumber} / {totalPages}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 2: REAL EMBEDDED PDF VIEWER */}
      {viewMode === "pdf" && (
        <div className="w-full bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-300 p-1.5 sm:p-2 shadow-xl relative min-h-[70vh] sm:min-h-[85vh] flex flex-col">
          {/* Mobile Notice Bar */}
          <div className="sm:hidden mb-2 bg-blue-500/10 border border-blue-400/30 rounded-lg p-2.5 flex items-center justify-between text-xs text-blue-200">
            <span className="text-[11px] flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              <span>เพื่อการอ่านที่ราบรื่นบนมือถือ:</span>
            </span>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-medium px-2 py-1 rounded text-[11px] shadow"
            >
              <ExternalLink className="w-3 h-3" />
              <span>เปิดเต็มจอ</span>
            </a>
          </div>

          {isPdfLoading && (
            <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center gap-3 rounded-xl backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <div className="text-center px-4">
                <p className="text-sm font-semibold text-slate-800">กำลังเรนเดอร์ PDF ตัวจริง...</p>
                <p className="text-xs text-slate-500 mt-1">
                  ประมวลผลผ่าน Puppeteer Engine (แม่นยำตามสเปก A4 100%)
                </p>
              </div>
            </div>
          )}

          <iframe
            key={pdfKey}
            src={`${pdfUrl}#toolbar=1&navpanes=1`}
            className="w-full h-[68vh] sm:h-[85vh] rounded-lg sm:rounded-xl bg-white border-0"
            onLoad={() => setIsPdfLoading(false)}
            title="PDF Preview Viewer"
          />
        </div>
      )}

      {/* VIEW MODE 3: CONTINUOUS WEB VIEW (แบบต่อเนื่องเดิม) */}
      {viewMode === "continuous" && (
        <div
          ref={scrollContainerRef}
          className="w-full max-w-[210mm] mx-auto bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-md p-5 sm:p-10 md:p-14 transition-transform duration-200 origin-top overflow-x-auto"
          style={{
            transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
            "--primary-color": primaryColor,
            "--accent-color": accentColor,
          } as React.CSSProperties}
        >
          {coverPageHtml && (
            <div dangerouslySetInnerHTML={{ __html: coverPageHtml }} />
          )}

          <div className="doc-content">
            {liveHtml !== undefined ? (
              <article className="relative">
                <div
                  dangerouslySetInnerHTML={{ __html: liveHtml }}
                  className="markdown-rendered-body"
                />
              </article>
            ) : (
              activeFiles.map((file, idx) => (
                <article
                  key={file.filename}
                  id={`section-${idx}`}
                  className="relative scroll-mt-20 sm:scroll-mt-24"
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: file.html }}
                    className="markdown-rendered-body"
                  />
                  {idx < activeFiles.length - 1 && (
                    <div className="my-10 border-t border-dashed border-slate-200 flex items-center justify-center">
                      <span className="bg-white px-3 text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                        Page Break / Next Section
                      </span>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
});

DocumentViewer.displayName = "DocumentViewer";

export default DocumentViewer;
