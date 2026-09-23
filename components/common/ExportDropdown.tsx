"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  Loader2,
  Check,
} from "lucide-react";

export type ExportFormat = "pdf" | "docx" | "excel" | "md" | "current-md";

interface ExportDropdownProps {
  workspaceSlug: string;
  currentFilename?: string;
  variant?: "primary" | "secondary" | "toolbar";
  className?: string;
  buttonSize?: "sm" | "md";
  onCustomExport?: (format: ExportFormat) => Promise<void> | void;
}

export default function ExportDropdown({
  workspaceSlug,
  currentFilename,
  variant = "primary",
  className = "",
  buttonSize = "md",
  onCustomExport,
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLoading, setActiveLoading] = useState<ExportFormat | null>(null);
  const [lastSuccess, setLastSuccess] = useState<ExportFormat | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const handleExport = async (format: ExportFormat) => {
    setActiveLoading(format);
    setIsOpen(false);

    try {
      if (onCustomExport) {
        await onCustomExport(format);
      } else {
        // Default download handler via API
        let endpoint = "";
        let fallbackName = `${workspaceSlug}-export`;

        switch (format) {
          case "pdf":
            endpoint = `/api/pdf?workspace=${workspaceSlug}`;
            fallbackName += ".pdf";
            break;
          case "docx":
            endpoint = `/api/docx?workspace=${workspaceSlug}`;
            fallbackName += ".docx";
            break;
          case "excel":
            endpoint = `/api/excel?workspace=${workspaceSlug}`;
            fallbackName += ".xlsx";
            break;
          case "md":
            endpoint = `/api/md?workspace=${workspaceSlug}`;
            fallbackName += ".md";
            break;
          case "current-md":
            endpoint = `/api/md?workspace=${workspaceSlug}&file=${encodeURIComponent(
              currentFilename || ""
            )}`;
            fallbackName = `${workspaceSlug}-${currentFilename || "document.md"}`;
            break;
        }

        const res = await fetch(endpoint);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Export failed with status ${res.status}`);
        }

        // Extract filename from header if available
        let downloadName = fallbackName;
        const disposition = res.headers.get("Content-Disposition");
        if (disposition) {
          const match = disposition.match(/filename="?([^";]+)"?/i);
          if (match && match[1]) {
            downloadName = match[1];
          }
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      setLastSuccess(format);
      setTimeout(() => setLastSuccess(null), 3000);
    } catch (err: any) {
      console.error("Export error:", err);
      alert(`การดาวน์โหลดไม่สำเร็จ: ${err.message || String(err)}`);
    } finally {
      setActiveLoading(null);
    }
  };

  // Button styles based on variant
  const sizeClasses =
    buttonSize === "sm"
      ? "px-2.5 py-1.5 text-xs gap-1.5"
      : "px-3 py-1.5 text-xs sm:text-sm gap-1.5";

  let buttonStyle = "";
  if (variant === "primary") {
    buttonStyle =
      "bg-theme-primary hover:bg-theme-primary-hover text-theme-primary-text font-semibold border border-theme-border shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px]";
  } else if (variant === "toolbar") {
    buttonStyle =
      "bg-theme-surface hover:bg-theme-surface-hover text-theme-text border border-theme-border font-medium shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px]";
  } else {
    buttonStyle =
      "bg-theme-surface hover:bg-theme-surface-hover text-theme-text border border-theme-border font-medium shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px]";
  }

  return (
    <div className={`relative inline-block text-left ${isOpen ? "z-[9999]" : "z-10"} ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={activeLoading !== null}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center rounded-retro transition-all select-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${buttonStyle}`}
        title="เลือกรูปแบบการดาวน์โหลดเอกสาร (Export)"
      >
        {activeLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
            <span>กำลังส่งออก...</span>
          </>
        ) : lastSuccess ? (
          <>
            <Check className="w-3.5 h-3.5 text-theme-success" />
            <span>เสร็จสิ้น!</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 text-current" />
            <span>Export</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-retro bg-theme-surface border-2 border-theme-border shadow-retro z-[9999] py-1.5 text-xs divide-y divide-theme-border-subtle animate-in fade-in zoom-in-95 duration-100">
          {/* Main Document Formats */}
          <div className="py-1">
            <div className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-theme-text-muted">
              รูปแบบเอกสารหลัก (Main Formats)
            </div>

            {/* PDF */}
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              className="w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
            >
              <div className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Export PDF</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    .pdf
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  เอกสารจัดหน้า A4 สวยงาม พร้อมสารบัญและแผนภาพ
                </div>
              </div>
            </button>

            {/* DOCX Word */}
            <button
              type="button"
              onClick={() => handleExport("docx")}
              className="w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
            >
              <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform mt-0.5">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Export Word (DOCX)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    .docx
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  ไฟล์ Microsoft Word แก้ไขต่อได้ ฟอนต์สารบรรณ
                </div>
              </div>
            </button>

            {/* Excel XLSX */}
            <button
              type="button"
              onClick={() => handleExport("excel")}
              className="w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
            >
              <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform mt-0.5">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Export Excel (XLSX)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    .xlsx
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  สมุดงานตารางข้อมูล สเปก และเช็กลิสต์แยกชีต
                </div>
              </div>
            </button>
          </div>

          {/* Markdown Section */}
          <div className="py-1">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              ข้อมูลดิบ Markdown (Raw)
            </div>

            {/* Full Markdown */}
            <button
              type="button"
              onClick={() => handleExport("md")}
              className="w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
            >
              <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform mt-0.5">
                <File className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Export Markdown (รวม)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    .md
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  รวมเนื้อหาทุกไฟล์พร้อม Frontmatter และ Metadata
                </div>
              </div>
            </button>

            {/* Current File (Only shown if currentFilename is passed) */}
            {currentFilename && (
              <button
                type="button"
                onClick={() => handleExport("current-md")}
                className="w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
              >
                <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>เฉพาะไฟล์ปัจจุบัน</span>
                    <span className="text-[9px] font-mono px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 truncate max-w-[70px]">
                      {currentFilename}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    ดาวน์โหลดเฉพาะไฟล์ที่กำลังเปิดแก้ไขในขณะนี้
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
