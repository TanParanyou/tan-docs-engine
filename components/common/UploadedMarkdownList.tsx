"use client";

import React, { useState } from "react";
import { UploadedMarkdownFile, formatFileSize } from "@/hooks/useMarkdownDropzone";
import {
  FileText,
  Eye,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
} from "lucide-react";
import SafetyConfirmationModal from "./SafetyConfirmationModal";

interface UploadedMarkdownListProps {
  files: UploadedMarkdownFile[];
  onPreview: (file: UploadedMarkdownFile) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onClear: () => void;
}

export default function UploadedMarkdownList({
  files,
  onPreview,
  onRemove,
  onMove,
  onClear,
}: UploadedMarkdownListProps) {
  const [fileToDelete, setFileToDelete] = useState<UploadedMarkdownFile | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);

  if (files.length === 0) return null;

  const handleConfirmDeleteFile = () => {
    if (fileToDelete) {
      onRemove(fileToDelete.id);
      setFileToDelete(null);
    }
  };

  const handleConfirmClearAll = () => {
    onClear();
    setIsConfirmingClearAll(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-theme-primary" />
          <span className="text-xs font-bold text-theme-text">
            ไฟล์เอกสารที่จะนำเข้า ({files.length} ไฟล์)
          </span>
          <span className="text-[10px] bg-theme-accent-light text-theme-accent-text border border-theme-accent/40 px-1.5 py-0.5 rounded-retro font-mono font-medium">
            แทนที่ Overview เดิม
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsConfirmingClearAll(true)}
          className="text-[11px] text-theme-danger hover:underline transition-colors cursor-pointer font-mono"
        >
          ล้างทั้งหมด
        </button>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {files.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === files.length - 1;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-retro border border-theme-border bg-theme-surface hover:bg-theme-surface-hover transition-colors group shadow-retro-sm"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-retro bg-theme-surface-sunken text-theme-text text-[10px] font-mono font-bold flex items-center justify-center border border-theme-border">
                  {index + 1}
                </span>
                <FileText className="w-4 h-4 text-theme-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-theme-text truncate font-mono">
                      {item.filename}
                    </p>
                    {isFirst && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] bg-theme-success-light text-theme-success border border-theme-success/40 px-1 py-0.2 rounded-retro font-mono font-bold">
                        <Sparkles className="w-2.5 h-2.5" />
                        หน้าแรก
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-theme-text-muted font-mono">
                    <span>{formatFileSize(item.size)}</span>
                    {item.previewTitle && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[200px]" title={item.previewTitle}>
                          {item.previewTitle}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Reorder Buttons */}
                <div className="flex items-center border border-theme-border rounded-retro bg-theme-surface shadow-retro-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onMove(item.id, "up")}
                    disabled={isFirst}
                    title="เลื่อนขึ้น"
                    className="p-1 text-theme-text-muted hover:text-theme-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-theme-surface-hover transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(item.id, "down")}
                    disabled={isLast}
                    title="เลื่อนลง"
                    className="p-1 text-theme-text-muted hover:text-theme-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-theme-surface-hover border-l border-theme-border transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Preview Button */}
                <button
                  type="button"
                  onClick={() => onPreview(item)}
                  title="ดูตัวอย่างเนื้อหา"
                  className="p-1.5 rounded-retro text-theme-accent-text hover:bg-theme-accent-light border border-transparent hover:border-theme-accent/40 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setFileToDelete(item)}
                  title="ลบไฟล์"
                  className="p-1.5 rounded-retro text-theme-text-muted hover:text-theme-danger hover:bg-theme-danger-light transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-theme-text-muted flex items-center gap-1 font-mono">
        <span>* ไฟล์ลำดับที่ 1 จะกลายเป็นหน้าเนื้อหาหลัก (01-overview.md) ของเล่มเอกสาร</span>
      </p>

      {/* Safety Confirmation for single file delete */}
      <SafetyConfirmationModal
        isOpen={Boolean(fileToDelete)}
        onClose={() => setFileToDelete(null)}
        onConfirm={handleConfirmDeleteFile}
        title="นำไฟล์ออกจากรายการ?"
        description={
          <span>
            คุณต้องการนำไฟล์{" "}
            <strong className="text-theme-text font-mono">
              {fileToDelete?.filename}
            </strong>{" "}
            ออกจากรายการที่จะนำเข้าใช่หรือไม่?
          </span>
        }
        confirmText="ลบออกจากรายการ"
        variant="warning"
        icon="trash"
      />

      {/* Safety Confirmation for Clear All */}
      <SafetyConfirmationModal
        isOpen={isConfirmingClearAll}
        onClose={() => setIsConfirmingClearAll(false)}
        onConfirm={handleConfirmClearAll}
        title="ล้างรายการไฟล์ทั้งหมด?"
        description={
          <span>
            คุณกำลังจะลบไฟล์ Markdown ทั้งหมด ({files.length} ไฟล์)
            ออกจากคิวการนำเข้า หากดำเนินการ เล่มเอกสารจะใช้ไฟล์ตั้งต้นของแม่แบบแทน
          </span>
        }
        confirmText="ยืนยันล้างทั้งหมด"
        variant="danger"
        icon="trash"
      />
    </div>
  );
}
