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
}

export default function EditorStatusBar({
  filename,
  cursorLine,
  cursorCol,
  lineCount,
  words,
  chars,
  isLight = true,
}: EditorStatusBarProps) {
  const statusBg = isLight
    ? "bg-slate-50 border-slate-200 text-slate-600"
    : "bg-slate-950 border-slate-800 text-slate-400";

  return (
    <div
      className={`border-t px-4 py-2 flex items-center justify-between text-xs font-mono select-none overflow-x-auto whitespace-nowrap gap-4 ${statusBg}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[160px] sm:max-w-[220px]">
          {filename}
        </span>
        <span className="text-slate-300 dark:text-slate-700">&bull;</span>
        <span className="font-medium">
          Ln {cursorLine}, Col {cursorCol}
        </span>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">&bull;</span>
        <span className="hidden sm:inline">{formatNumber(lineCount)} บรรทัด</span>
        <span className="text-slate-300 dark:text-slate-700 hidden md:inline">&bull;</span>
        <span className="hidden md:inline">{formatNumber(words)} คำ</span>
        <span className="text-slate-300 dark:text-slate-700 hidden md:inline">&bull;</span>
        <span className="hidden md:inline">{formatNumber(chars)} ตัวอักษร</span>
      </div>

      <div className="hidden lg:flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[11px]">
        <span>คีย์ลัด:</span>
        <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-sans shadow-xs">
          ⌘S บันทึก
        </kbd>
        <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-sans shadow-xs">
          ⌘F ค้นหา
        </kbd>
      </div>
    </div>
  );
}
