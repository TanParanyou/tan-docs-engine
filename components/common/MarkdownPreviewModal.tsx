"use client";

import React, { useState, useEffect } from "react";
import { UploadedMarkdownFile, formatFileSize } from "@/hooks/useMarkdownDropzone";
import { renderMarkdown } from "@/lib/markdown";
import {
  FileText,
  Eye,
  Code,
  FileCheck,
  Maximize2,
  Minimize2,
} from "lucide-react";
import Modal from "./Modal";
import ActionButton from "./ActionButton";

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
      setRenderedHtml(`<p class="text-theme-danger">ไม่สามารถแปลงเนื้อหา Markdown ได้</p>`);
    }
  }, [file]);

  if (!file) return null;

  return (
    <Modal
      isOpen={Boolean(file)}
      onClose={onClose}
      maxWidth={isFullscreen ? "full" : "4xl"}
      className={isFullscreen ? "h-[94vh]" : "h-[85vh]"}
      bodyClassName="flex flex-col p-0 overflow-hidden bg-theme-bg"
      icon={<FileText className="w-4 h-4" />}
      title={file.filename}
      badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-retro bg-theme-surface border border-theme-border text-theme-text-muted">
          {formatFileSize(file.size)}
        </span>
      }
      subtitle={file.previewTitle || "พรีวิวเนื้อหาไฟล์ Markdown ก่อนนำเข้า"}
      headerActions={
        <div className="flex items-center gap-2 mr-1">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-theme-surface border border-theme-border rounded-retro p-0.5 shadow-retro-sm">
            <button
              type="button"
              onClick={() => setViewMode("rendered")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-retro text-xs font-mono font-medium transition-colors cursor-pointer ${
                viewMode === "rendered"
                  ? "bg-theme-primary text-theme-primary-text font-bold shadow-retro-sm"
                  : "text-theme-text-muted hover:text-theme-text"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Rendered</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-retro text-xs font-mono font-medium transition-colors cursor-pointer ${
                viewMode === "raw"
                  ? "bg-theme-primary text-theme-primary-text font-bold shadow-retro-sm"
                  : "text-theme-text-muted hover:text-theme-text"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Raw</span>
            </button>
          </div>

          {/* Toggle Fullscreen */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-retro hover:bg-theme-surface text-theme-text-muted hover:text-theme-text border border-theme-border transition-colors shadow-retro-sm cursor-pointer"
            title={isFullscreen ? "ย่อขนาด" : "ขยายเต็มจอ"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      }
      footer={
        <div className="flex items-center justify-between text-xs text-theme-text-muted">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <FileCheck className="w-4 h-4 text-theme-success" />
            <span>พร้อมนำเข้าเป็นส่วนหนึ่งของ Workspace เมื่อสร้าง</span>
          </div>
          <ActionButton
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            ปิดตัวอย่าง
          </ActionButton>
        </div>
      }
    >
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {viewMode === "rendered" ? (
          <div className="bg-theme-surface rounded-retro border-2 border-theme-border p-6 shadow-retro max-w-4xl mx-auto min-h-full">
            <div
              className="doc-content prose prose-stone max-w-none text-theme-text leading-relaxed text-xs"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <pre className="font-mono text-xs p-5 bg-theme-surface-sunken text-theme-text rounded-retro overflow-x-auto whitespace-pre-wrap leading-relaxed border-2 border-theme-border shadow-retro">
              {file.content || "(ไฟล์ว่างเปล่า)"}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
