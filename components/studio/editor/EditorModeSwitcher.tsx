"use client";

import React from "react";
import { Eye, Code } from "lucide-react";
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
      icon: <Eye className="w-3.5 h-3.5" />,
      title: "โหมดพิมพ์เสมือนจริง (WYSIWYG เหมือน Word/Notion ไม่มีเครื่องหมาย syntax)",
    },
    {
      value: "markdown",
      label: "Markdown (โค้ดดิบ)",
      icon: <Code className="w-3.5 h-3.5" />,
      title: "โหมดโค้ดดิบ Markdown (แสดงสัญลักษณ์ syntax สำหรับใส่โค้ด ไดอะแกรม)",
    },
  ];

  return (
    <div className="h-10 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between flex-shrink-0 z-10 shadow-2xs select-none">
      <div className="flex items-center space-x-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
          โหมดแก้ไข:
        </span>
        <SegmentedControl
          options={options}
          value={inputMode}
          onChange={onChange}
          size="sm"
        />
      </div>

      <div className="hidden md:flex items-center text-xs text-slate-500 font-mono">
        {inputMode === "visual" ? (
          <span className="text-[11px] text-slate-500">
            ✨ ซ่อนสัญลักษณ์ Syntax อัตโนมัติ (WYSIWYG)
          </span>
        ) : (
          <span className="text-[11px] text-slate-500">
            💻 โค้ดดิบ Markdown สำหรับใส่โค้ด/ไดอะแกรม
          </span>
        )}
      </div>
    </div>
  );
}
