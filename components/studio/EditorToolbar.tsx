"use client";

import React, { useRef, useState } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Table,
  Workflow,
  Scissors,
  Code,
  Image as ImageIcon,
  CheckSquare,
  Quote,
  List,
  Search,
  Sparkles,
  AlertCircle,
  FileCheck2,
  BookOpen,
} from "lucide-react";
import TemplateSnippetModal from "./TemplateSnippetModal";

interface EditorToolbarProps {
  onInsertText: (before: string, after?: string, defaultText?: string) => void;
  onUploadImage?: (file: File) => void;
  isUploading?: boolean;
  onOpenSearch?: () => void;
  editorTheme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function EditorToolbar({
  onInsertText,
  onUploadImage,
  isUploading,
  onOpenSearch,
  editorTheme,
  onToggleTheme,
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUploadImage) {
      onUploadImage(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isLight = editorTheme === "light";
  const bgClass = isLight ? "bg-slate-100/90 border-slate-200 text-slate-700" : "bg-slate-900 border-slate-800 text-slate-300";
  const btnHover = isLight ? "hover:bg-slate-200/80 hover:text-slate-900" : "hover:bg-slate-800 hover:text-white";
  const dividerClass = isLight ? "bg-slate-300" : "bg-slate-800";

  return (
    <div className={`${bgClass} border-b px-3 py-1.5 flex flex-wrap items-center justify-between gap-1 text-xs select-none transition-colors`}>
      {/* Left: Tools Group */}
      <div className="flex flex-wrap items-center gap-0.5">
        {/* Headings */}
        <div className="flex items-center">
          <button
            type="button"
            title="Heading 1 (#)"
            onClick={() => onInsertText("# ", "", "หัวข้อระดับ 1")}
            className={`p-1.5 rounded transition-colors ${btnHover}`}
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Heading 2 (##)"
            onClick={() => onInsertText("## ", "", "หัวข้อระดับ 2")}
            className={`p-1.5 rounded transition-colors ${btnHover}`}
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Heading 3 (###)"
            onClick={() => onInsertText("### ", "", "หัวข้อระดับ 3")}
            className={`p-1.5 rounded transition-colors ${btnHover}`}
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={`h-4 w-px ${dividerClass} mx-1`} />

        {/* Text Formats */}
        <div className="flex items-center">
          <button
            type="button"
            title="Bold (**text**) [⌘B]"
            onClick={() => onInsertText("**", "**", "ตัวหนา")}
            className={`p-1.5 rounded transition-colors ${btnHover}`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Italic (*text*) [⌘I]"
            onClick={() => onInsertText("*", "*", "ตัวเอียง")}
            className={`p-1.5 rounded transition-colors ${btnHover}`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Strikethrough (~~text~~)"
            onClick={() => onInsertText("~~", "~~", "ข้อความขีดฆ่า")}
            className={`p-1.5 rounded transition-colors ${btnHover}`}
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Inline Code (`code`)"
            onClick={() => onInsertText("`", "`", "code")}
            className={`p-1.5 rounded transition-colors ${btnHover}`}
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={`h-4 w-px ${dividerClass} mx-1`} />

        {/* Lists & Quotes */}
        <div className="flex items-center">
          <button
            type="button"
            title="Quote (> text)"
            onClick={() => onInsertText("> ", "", "ข้อความอ้างอิง")}
            className={`p-1.5 rounded transition-colors ${btnHover}`}
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Bulleted List (- item)"
            onClick={() => onInsertText("- ", "", "รายการข้อ")}
            className={`p-1.5 rounded transition-colors ${btnHover}`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Task List (- [ ] item)"
            onClick={() => onInsertText("- [ ] ", "", "งานที่ต้องทำ")}
            className={`p-1.5 rounded transition-colors ${btnHover}`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={`h-4 w-px ${dividerClass} mx-1`} />

        {/* Structural Blocks */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title="Table Template"
            onClick={() =>
              onInsertText(
                "\n| คอลัมน์ที่ 1 | คอลัมน์ที่ 2 | คอลัมน์ที่ 3 |\n| :--- | :--- | :--- |\n| ข้อมูล 1 | ข้อมูล 2 | ข้อมูล 3 |\n| ข้อมูล 4 | ข้อมูล 5 | ข้อมูล 6 |\n"
              )
            }
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 font-medium ${btnHover}`}
          >
            <Table className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline text-[11px]">Table</span>
          </button>

          <button
            type="button"
            title="Mermaid Flowchart Diagram"
            onClick={() =>
              onInsertText(
                "\n```mermaid\ngraph TD\n  Start[เริ่มต้น] --> Action[ดำเนินการ]\n  Action --> End[เสร็จสิ้น]\n```\n"
              )
            }
            className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 rounded transition-colors flex items-center gap-1 font-medium text-[11px]"
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Mermaid</span>
          </button>

          <button
            type="button"
            title="Requirement Confirmation Block"
            onClick={() =>
              onInsertText(
                "\n### 4.X REQ-POS-XXX — [ชื่อฟังก์ชัน]\n\n**Requirement จากการประชุม**  \nรายละเอียด...\n\n**พฤติกรรมที่คาดหวัง**\n1. เงื่อนไขแรก...\n\n**ผลการพิจารณา:**\n- [ ] ยืนยันตามข้อเสนอ\n- [ ] ขอแก้ไข\n- [ ] ไม่อยู่ในขอบเขต\n**หมายเหตุลูกค้า:** -\n\n---\n"
              )
            }
            className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded transition-colors flex items-center gap-1 font-medium text-[11px]"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Req Block</span>
          </button>

          <button
            type="button"
            title="คลังแม่แบบบล็อกเนื้อหาสำเร็จรูป (Snippet Templates)"
            onClick={() => setIsSnippetModalOpen(true)}
            className="px-2 py-1 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/25 rounded transition-colors flex items-center gap-1 font-semibold text-[11px]"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>แม่แบบ 🧩</span>
          </button>

          <button
            type="button"
            title="Page Break สำหรับการพิมพ์ PDF (<!-- pagebreak -->)"
            onClick={() => onInsertText("\n<!-- pagebreak -->\n")}
            className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded transition-colors flex items-center gap-1 font-medium text-[11px]"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">PageBreak</span>
          </button>

          <button
            type="button"
            title="Notice / Alert Callout"
            onClick={() =>
              onInsertText(
                "\n> **ข้อควรระวัง (Important):**  \n> รายละเอียดข้อควรระวัง...\n"
              )
            }
            className={`p-1.5 rounded transition-colors ${btnHover}`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          </button>
        </div>

        <div className={`h-4 w-px ${dividerClass} mx-1`} />

        {/* Media: Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          title="Upload or Paste Image (หรือกด Ctrl+V วางรูปได้เลย)"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors flex items-center gap-1 font-medium text-[11px] disabled:opacity-50"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{isUploading ? "Uploading..." : "Image"}</span>
        </button>
      </div>

      {/* Right: Search & Theme Toggle */}
      <div className="flex items-center gap-1">
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white ${btnHover}`}
            title="Find in document (⌘F)"
          >
            <Search className="w-3.5 h-3.5" />
            <kbd className="hidden sm:inline px-1 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-mono">
              ⌘F
            </kbd>
          </button>
        )}

        <button
          type="button"
          onClick={onToggleTheme}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white ${btnHover}`}
          title="Toggle Editor Color Theme (Light / Dark)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="capitalize">{editorTheme}</span>
        </button>
      </div>

      {/* Snippet Template Modal */}
      <TemplateSnippetModal
        isOpen={isSnippetModalOpen}
        onClose={() => setIsSnippetModalOpen(false)}
        onInsertSnippet={(snippet) => onInsertText(snippet)}
      />
    </div>
  );
}
