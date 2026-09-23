"use client";

import React from "react";
import { Eye, Code, Sparkles } from "lucide-react";
import SegmentedControl, { SegmentOption } from "@/components/common/SegmentedControl";
import { InputMode } from "@/lib/store/useStudioStore";

interface EditorModeSwitcherProps {
  inputMode: InputMode;
  onChange: (mode: InputMode) => void;
}

export default function EditorModeSwitcher({
  inputMode,
  onChange,
}: EditorModeSwitcherProps) {
  const options: SegmentOption<InputMode>[] = [
    {
      value: "visual",
      label: "Visual (พิมพ์จริง)",
      icon: <Eye className="w-4 h-4" />,
      title: "โหมดพิมพ์เสมือนจริง (WYSIWYG แบบ Word/Notion ไม่มีเครื่องหมาย syntax กวนตา)",
    },
    {
      value: "markdown",
      label: "Markdown (โค้ดดิบ)",
      icon: <Code className="w-4 h-4" />,
      title: "โหมดโค้ดดิบ Markdown (แสดง syntax สำหรับใส่ตาราง ไดอะแกรม โค้ด)",
    },
  ];

  return (
    <div className="h-12 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between flex-shrink-0 z-10 select-none shadow-2xs">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
          โหมดแก้ไข:
        </span>
        <SegmentedControl
          options={options}
          value={inputMode}
          onChange={onChange}
          size="md"
        />
      </div>

      <div className="hidden md:flex items-center text-xs text-slate-500">
        {inputMode === "visual" ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium text-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>โหมดเสมือนจริง จัดหน้าและพิมพ์ได้ทันที</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono text-xs">
            <Code className="w-3.5 h-3.5 text-slate-500" />
            <span>โค้ดดิบ Markdown สำหรับใส่โค้ดและไดอะแกรม</span>
          </span>
        )}
      </div>
    </div>
  );
}
