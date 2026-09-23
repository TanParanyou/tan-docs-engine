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
      label: "Visual",
      icon: <Eye className="w-4 h-4" />,
      title: "Visual Mode (พิมพ์เสมือนจริงแบบ WYSIWYG)",
    },
    {
      value: "markdown",
      label: "Markdown",
      icon: <Code className="w-4 h-4" />,
      title: "Markdown Mode (โค้ดดิบสำหรับตาราง ไดอะแกรม และโค้ด)",
    },
  ];

  return (
    <div className="h-11 bg-theme-surface border-b border-theme-border px-3 sm:px-4 flex items-center justify-between flex-shrink-0 z-10 select-none shadow-retro-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-xs font-bold text-theme-text-muted uppercase tracking-wider hidden sm:inline font-mono whitespace-nowrap flex-shrink-0">
          โหมดแก้ไข:
        </span>
        <SegmentedControl
          options={options}
          value={inputMode}
          onChange={onChange}
          size="sm"
        />
      </div>

      <div className="hidden md:flex items-center text-xs flex-shrink-0">
        {inputMode === "visual" ? (
          <span className="h-8 inline-flex items-center gap-1.5 px-3 rounded-retro bg-theme-accent-light text-theme-accent-text border border-theme-accent/50 font-medium text-xs whitespace-nowrap">
            ✨ โหมดเสมือนจริง จัดหน้าและพิมพ์ได้ทันที
          </span>
        ) : (
          <span className="h-8 inline-flex items-center gap-1.5 px-3 rounded-retro bg-theme-surface-sunken text-theme-text border border-theme-border font-mono text-xs whitespace-nowrap">
            💻 โค้ดดิบ Markdown สำหรับใส่โค้ดและไดอะแกรม
          </span>
        )}
      </div>
    </div>
  );
}
