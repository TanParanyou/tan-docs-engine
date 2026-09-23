"use client";

import React from "react";
import { formatNumber } from "@/lib/utils";

interface EditorStatusBarProps {
  filename: string;
  cursorLine: number;
  cursorCol: number;
  lineCount: number;
  words: number;
  chars: number;
  isLight?: boolean;
  undoCount?: number;
  redoCount?: number;
}

export default function EditorStatusBar({
  filename,
  cursorLine,
  cursorCol,
  lineCount,
  words,
  chars,
  undoCount = 0,
  redoCount = 0,
}: EditorStatusBarProps) {
  return (
    <div className="border-t border-theme-border px-4 py-2 flex items-center justify-between text-xs font-mono select-none overflow-x-auto whitespace-nowrap gap-4 bg-theme-surface-sunken text-theme-text-muted">
      <div className="flex items-center gap-2.5">
        <span className="font-bold text-theme-primary truncate max-w-[160px] sm:max-w-[220px]">
          {filename}
        </span>
        <span className="text-theme-border-subtle">&bull;</span>
        <span className="font-medium text-theme-text">
          Ln {cursorLine}, Col {cursorCol}
        </span>
        <span className="text-theme-border-subtle hidden sm:inline">&bull;</span>
        <span className="hidden sm:inline">{formatNumber(lineCount)} บรรทัด</span>
        <span className="text-theme-border-subtle hidden md:inline">&bull;</span>
        <span className="hidden md:inline">{formatNumber(words)} คำ</span>
        <span className="text-theme-border-subtle hidden md:inline">&bull;</span>
        <span className="hidden md:inline">{formatNumber(chars)} ตัวอักษร</span>

        {(undoCount > 0 || redoCount > 0) && (
          <>
            <span className="text-theme-border-subtle hidden lg:inline">&bull;</span>
            <span className="hidden lg:inline text-theme-text-muted text-[11px] bg-theme-surface px-2 py-0.5 border border-theme-border-subtle rounded-retro">
              Hist: {undoCount} undo{undoCount > 1 ? "s" : ""}{redoCount > 0 ? ` / ${redoCount} redo` : ""}
            </span>
          </>
        )}
      </div>

      <div className="hidden lg:flex items-center gap-2 text-theme-text-muted text-[11px]">
        <span>คีย์ลัด:</span>
        <kbd className="px-2 py-0.5 rounded-retro bg-theme-surface border border-theme-border text-theme-text font-mono shadow-retro-sm">
          ⌘Z ย้อนกลับ
        </kbd>
        <kbd className="px-2 py-0.5 rounded-retro bg-theme-surface border border-theme-border text-theme-text font-mono shadow-retro-sm">
          ⌘⇧Z ทำซ้ำ
        </kbd>
        <kbd className="px-2 py-0.5 rounded-retro bg-theme-surface border border-theme-border text-theme-text font-mono shadow-retro-sm">
          ⌘S บันทึก
        </kbd>
        <kbd className="px-2 py-0.5 rounded-retro bg-theme-surface border border-theme-border text-theme-text font-mono shadow-retro-sm">
          ⌘F ค้นหา
        </kbd>
      </div>
    </div>
  );
}
