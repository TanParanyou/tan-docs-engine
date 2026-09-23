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
    <div className="h-11 bg-theme-surface border-b border-theme-border px-3 sm:px-4 flex items-center justify-between flex-shrink-0 z-10 select-none shadow-retro-sm">
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-bold text-theme-text-muted uppercase tracking-wider hidden sm:inline font-mono">
          โหมดแก้ไข:
        </span>
        <SegmentedControl
          options={options}
          value={inputMode}
          onChange={onChange}
          size="md"
        />
      </div>

      <div className="hidden md:flex items-center text-xs">
        {inputMode === "visual" ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-retro bg-theme-accent-light text-theme-accent-text border border-theme-accent/50 font-medium text-xs">
            ✨ โหมดเสมือนจริง จัดหน้าและพิมพ์ได้ทันที
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-retro bg-theme-surface-sunken text-theme-text border border-theme-border font-mono text-xs">
            💻 โค้ดดิบ Markdown สำหรับใส่โค้ดและไดอะแกรม
          </span>
        )}
      </div>
    </div>
  );
}
