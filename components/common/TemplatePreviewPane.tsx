"use client";

import React, { useState } from "react";
import {
  FileCode2,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { DocumentTemplate, interpolateTemplateContent } from "@/lib/document-templates";
import { renderMarkdown } from "@/lib/markdown";
import ActionButton from "./ActionButton";

export interface TemplatePreviewPaneProps {
  template: DocumentTemplate | null;
  onUseTemplate?: (template: DocumentTemplate) => void;
  projectName?: string;
  useButtonText?: string;
  showUseButton?: boolean;
}

export default function TemplatePreviewPane({
  template,
  onUseTemplate,
  projectName = "ตัวอย่างระบบ",
  useButtonText = "ใช้แม่แบบนี้",
  showUseButton = true,
}: TemplatePreviewPaneProps) {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-theme-text-muted text-xs font-mono">
        <FileCode2 className="w-8 h-8 text-theme-text-faint mb-2" />
        <span>เลือกแม่แบบจากรายการด้านซ้ายเพื่อดูตัวอย่างโครงสร้าง</span>
      </div>
    );
  }

  // Ensure selected index is valid
  const currentFileIdx =
    selectedFileIdx >= template.files.length ? 0 : selectedFileIdx;
  const currentFile = template.files[currentFileIdx];

  const interpolatedPreview = currentFile
    ? interpolateTemplateContent(currentFile.content, {
        projectName: projectName || "ตัวอย่างระบบ",
        title: `${projectName || "โครงการ"} ${template.title}`,
        author: "Tan System Architecture Team",
        organization: "TAN TECHNOLOGY SOLUTIONS",
        client: "บริษัท รีเทล อินเตอร์เนชั่นแนล จำกัด",
        date: new Date().toLocaleDateString("th-TH"),
      })
    : "";

  let renderedHtml = "";
  try {
    renderedHtml = renderMarkdown(interpolatedPreview);
  } catch {
    renderedHtml = `<pre class="text-theme-danger">${currentFile?.content || ""}</pre>`;
  }

  return (
    <div className="flex flex-col h-full bg-theme-surface overflow-hidden">
      {/* Top Header of Preview */}
      <div className="p-4 border-b-2 border-theme-border bg-theme-surface-sunken flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold text-theme-accent-text bg-theme-accent-light px-2 py-0.5 rounded-retro border border-theme-accent/40">
                {template.categoryLabel}
              </span>
              {template.badge && (
                <span className="text-[10px] font-mono font-medium text-theme-text-muted bg-theme-surface px-2 py-0.5 rounded-retro border border-theme-border-subtle">
                  {template.badge}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-theme-text leading-snug font-sans truncate">
              {template.name}
            </h3>
            <p className="text-xs text-theme-text-muted mt-0.5 line-clamp-2">
              {template.description}
            </p>
          </div>

          {showUseButton && onUseTemplate && (
            <ActionButton
              variant="primary"
              size="md"
              onClick={() => onUseTemplate(template)}
              icon={<Check className="w-3.5 h-3.5" />}
              className="flex-shrink-0"
            >
              <span>{useButtonText}</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </ActionButton>
          )}
        </div>

        {/* File Tabs Switcher */}
        {template.files.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-theme-border-subtle">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-theme-text-muted flex items-center gap-1 font-semibold">
                <FileCode2 className="w-3 h-3 text-theme-primary" />
                <span>ไฟล์ในแม่แบบ ({template.files.length} ไฟล์):</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {template.files.map((file, idx) => {
                const isActive = currentFileIdx === idx;
                return (
                  <button
                    key={file.filename}
                    type="button"
                    onClick={() => setSelectedFileIdx(idx)}
                    className={`px-2.5 py-1 rounded-retro text-xs font-mono transition-all flex items-center gap-1.5 border cursor-pointer ${
                      isActive
                        ? "bg-theme-primary text-theme-primary-text border-theme-border font-bold shadow-retro-sm"
                        : "bg-theme-surface text-theme-text hover:bg-theme-surface-hover border-theme-border-subtle hover:border-theme-border"
                    }`}
                  >
                    <FileCode2 className="w-3 h-3 opacity-70" />
                    <span>{file.filename}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Markdown Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-theme-bg font-sans text-xs leading-relaxed text-theme-text">
        {currentFile ? (
          <div className="bg-theme-surface rounded-retro border-2 border-theme-border p-5 shadow-retro-sm max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-theme-border-subtle text-theme-text-muted text-[11px] font-mono">
              <span className="font-semibold text-theme-text truncate">
                {currentFile.title} ({currentFile.filename})
              </span>
              <span className="flex-shrink-0 ml-2">Preview</span>
            </div>
            <div
              className="doc-content prose prose-stone max-w-none text-theme-text text-xs leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        ) : (
          <div className="text-center py-12 text-theme-text-muted font-mono text-xs">
            แม่แบบนี้ไม่มีไฟล์เริ่มต้น
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-theme-surface-sunken border-t border-theme-border flex items-center justify-between text-xs text-theme-text-muted flex-shrink-0 font-mono">
        <span className="text-[11px] truncate">
          ไฟล์: <strong className="text-theme-text">{currentFile?.filename || "-"}</strong>
        </span>
        <span className="text-[11px] text-theme-text-muted">
          สถาปัตยกรรมเอกสาร TAN DOCS
        </span>
      </div>
    </div>
  );
}
