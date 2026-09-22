"use client";

import React from "react";
import { UploadedMarkdownFile, formatFileSize } from "@/hooks/useMarkdownDropzone";
import {
  FileText,
  Eye,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";

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
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-semibold text-slate-800">
            ไฟล์เอกสารที่จะนำเข้า ({files.length} ไฟล์)
          </span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-medium">
            แทนที่ Overview เดิม
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] text-red-500 hover:text-red-700 hover:underline transition-colors"
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
              className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-mono font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-800 truncate font-mono">
                      {item.filename}
                    </p>
                    {isFirst && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.2 rounded font-medium">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                        หน้าแรก
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{formatFileSize(item.size)}</span>
                    {item.previewTitle && (
                      <>
                        <span>•</span>
                        <span className="truncate text-slate-500 max-w-[200px]" title={item.previewTitle}>
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
                <div className="flex items-center border border-slate-200 rounded bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => onMove(item.id, "up")}
                    disabled={isFirst}
                    title="เลื่อนขึ้น"
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 rounded-l transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(item.id, "down")}
                    disabled={isLast}
                    title="เลื่อนลง"
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 rounded-r border-l border-slate-200 transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Preview Button */}
                <button
                  type="button"
                  onClick={() => onPreview(item)}
                  title="ดูตัวอย่างเนื้อหา"
                  className="p-1.5 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-100/60 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  title="ลบไฟล์"
                  className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-400 flex items-center gap-1">
        <Info className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <span>ลำดับของไฟล์จะถูกนำไปจัดเรียงเป็นสารบัญใน Workspace อัตโนมัติ</span>
      </p>
    </div>
  );
}
