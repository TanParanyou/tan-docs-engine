"use client";

import React, { useState, useEffect } from "react";
import { UploadedMarkdownFile, formatFileSize } from "@/hooks/useMarkdownDropzone";
import { renderMarkdown } from "@/lib/markdown";
import {
  X,
  FileText,
  Eye,
  Code,
  FileCheck,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface MarkdownPreviewModalProps {
  file: UploadedMarkdownFile | null;
  onClose: () => void;
}

export default function MarkdownPreviewModal({
  file,
  onClose,
}: MarkdownPreviewModalProps) {
  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered");
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!file) return;

    try {
      const html = renderMarkdown(file.content);
      setRenderedHtml(html);
    } catch {
      setRenderedHtml(`<p class="text-red-500">ไม่สามารถแปลงเนื้อหา Markdown ได้</p>`);
    }
  }, [file]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full overflow-hidden flex flex-col transition-all duration-200 ${
          isFullscreen ? "max-w-[96vw] h-[94vh]" : "max-w-3xl h-[85vh]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600/90 flex items-center justify-center text-white font-bold flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate font-mono text-slate-100">
                  {file.filename}
                </h3>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  {formatFileSize(file.size)}
                </span>
              </div>
              {file.previewTitle && (
                <p className="text-xs text-slate-400 truncate">
                  {file.previewTitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode("rendered")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === "rendered"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>พรีวิว (Rendered)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("raw")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === "raw"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>ซอร์สโค้ด (Raw)</span>
              </button>
            </div>

            {/* Toggle Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title={isFullscreen ? "ย่อขนาด" : "ขยายเต็มจอ"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="ปิดหน้าต่าง (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {viewMode === "rendered" ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm max-w-4xl mx-auto min-h-full">
              <div
                className="doc-content prose prose-slate max-w-none text-slate-800 leading-relaxed text-sm"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <pre className="font-mono text-xs p-5 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-800">
                {file.content || "(ไฟล์ว่างเปล่า)"}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>พร้อมนำเข้าเป็นส่วนหนึ่งของ Workspace เมื่อสร้าง</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            ปิดตัวอย่าง
          </button>
        </div>
      </div>
    </div>
  );
}
