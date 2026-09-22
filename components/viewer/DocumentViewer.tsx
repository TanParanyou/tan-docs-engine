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
  Download,
  Printer,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface DocumentViewerProps {
  workspaceSlug: string;
  config: DocsConfig;
  coverPageHtml?: string;
  files: MarkdownFileItem[];
  primaryColor?: string;
  accentColor?: string;
  initialMode?: DocumentViewMode;
  showToolbar?: boolean;
  className?: string;
}

interface PageItem {
  pageNumber: number;
  type: "cover" | "content";
  filename?: string;
  html: string;
}

export default function DocumentViewer({
  workspaceSlug,
  config,
  coverPageHtml,
  files,
  primaryColor = "#0f3b6c",
  accentColor = "#1d4ed8",
  initialMode = "paged",
  showToolbar = true,
  className = "",
}: DocumentViewerProps) {
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

    // Subsequent Pages: Markdown files split by <div class="page-break"></div>
    for (const file of files) {
      const parts = file.html.split(/<div class="page-break"><\/div>/gi);
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.length > 0) {
          list.push({
            pageNumber: pageCounter++,
            type: "content",
            filename: file.filename,
            html: trimmed,
          });
        }
      }
    }

    return list;
  }, [coverPageHtml, files]);

  const totalPages = pages.length;

  const handleRefreshPdf = () => {
    setIsPdfLoading(true);
    setPdfKey((prev) => prev + 1);
  };

  const pdfUrl = `/api/pdf?workspace=${workspaceSlug}&inline=true`;
  const pdfDownloadUrl = `/api/pdf?workspace=${workspaceSlug}`;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Viewer Floating/Sticky Toolbar */}
      {showToolbar && (
        <div className="sticky top-14 sm:top-16 z-30 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-700/80 px-2.5 sm:px-4 py-2 sm:py-2.5 shadow-md flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6 rounded-xl">
          {/* View Mode Switcher Pills */}
          <div className="flex items-center bg-slate-800 p-0.5 sm:p-1 rounded-lg border border-slate-700 max-w-full overflow-x-auto">
            <button
              onClick={() => setViewMode("paged")}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                viewMode === "paged"
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
              title="A4 Paged View (แบ่งหน้า 1, 2, 3...)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4<span className="hidden sm:inline"> แยกหน้า</span></span>
              <span className="ml-0.5 sm:ml-1 px-1 sm:px-1.5 py-0.2 text-[9px] sm:text-[10px] rounded bg-white/20 font-mono">
                {totalPages}
              </span>
            </button>

            <button
              onClick={() => setViewMode("pdf")}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                viewMode === "pdf"
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
              title="PDF ตัวจริง (Puppeteer Engine Preview)"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>PDF<span className="hidden sm:inline"> ตัวจริง</span></span>
            </button>

            <button
              onClick={() => setViewMode("continuous")}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                viewMode === "continuous"
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
              title="เว็บต่อเนื่อง (Continuous Web View)"
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>เว็บ<span className="hidden sm:inline">ต่อเนื่อง</span></span>
            </button>
          </div>

          {/* Quick Page Jump (Only in Paged Mode) */}
          {viewMode === "paged" && totalPages > 1 && (
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
              <span className="hidden xs:inline">หน้า</span>
              <button
                disabled={activePage <= 1}
                onClick={() => {
                  const target = Math.max(1, activePage - 1);
                  setActivePage(target);
                  document.getElementById(`page-${target}`)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-white px-0.5">
                {activePage} / {totalPages}
              </span>
              <button
                disabled={activePage >= totalPages}
                onClick={() => {
                  const target = Math.min(totalPages, activePage + 1);
                  setActivePage(target);
                  document.getElementById(`page-${target}`)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Zoom and Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            {viewMode !== "pdf" && (
              <div className="hidden md:flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
                <button
                  onClick={zoomOut}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={resetZoom}
                  className="px-2 py-1 text-[11px] font-mono font-medium text-slate-300 hover:text-white"
                  title="Reset Zoom"
                >
                  {zoom}%
                </button>
                <button
                  onClick={zoomIn}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {viewMode === "pdf" && (
              <button
                onClick={handleRefreshPdf}
                className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors"
                title="รีเฟรช PDF"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPdfLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">รีเฟรช</span>
              </button>
            )}

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors"
              title="เปิด PDF ในแท็บใหม่เต็มจอ"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">เต็มจอ</span>
            </a>

            <a
              href={`/${workspaceSlug}/print`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors"
              title="พิมพ์เอกสาร (Print Window)"
            >
              <Printer className="w-3.5 h-3.5" />
            </a>

            <a
              href={pdfDownloadUrl}
              className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-2.5 sm:px-3 py-1.5 rounded-lg shadow-sm transition-colors"
              title="ดาวน์โหลดไฟล์ PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">ดาวน์โหลด</span>
            </a>
          </div>
        </div>
      )}

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
              className="relative group w-full max-w-[210mm]"
              onMouseEnter={() => setActivePage(page.pageNumber)}
            >
              {/* Floating Page Badge on top right of sheet */}
              <div className="absolute -top-3 right-3 sm:right-6 z-10 flex items-center gap-1.5 bg-slate-800 text-white text-[10px] sm:text-[11px] font-mono px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md border border-slate-700/80">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400"></span>
                <span>
                  หน้า {page.pageNumber} / {totalPages}
                </span>
                {page.type === "cover" && (
                  <span className="text-[9px] sm:text-[10px] bg-blue-500/30 text-blue-300 px-1 py-0.2 rounded font-sans">
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
            <span className="text-[11px]">📱 เพื่อการอ่านที่ราบรื่นบนมือถือ:</span>
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
            {files.map((file, idx) => (
              <article key={file.filename} id={`section-${idx}`} className="relative">
                <div
                  dangerouslySetInnerHTML={{ __html: file.html }}
                  className="markdown-rendered-body"
                />
                {idx < files.length - 1 && (
                  <div className="my-10 border-t border-dashed border-slate-200 flex items-center justify-center">
                    <span className="bg-white px-3 text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                      Page Break / Next Section
                    </span>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
