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
  AlertCircle,
  FileCheck2,
  BookOpen,
  Puzzle,
} from "lucide-react";
import TemplateSnippetModal from "./TemplateSnippetModal";
import { cn } from "@/lib/utils";

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
  const bgClass = isLight ? "bg-slate-50/90 border-slate-200 text-slate-700" : "bg-slate-900 border-slate-800 text-slate-300";
  const btnHover = isLight ? "hover:bg-slate-200/80 hover:text-slate-900" : "hover:bg-slate-800 hover:text-white";
  const dividerClass = isLight ? "bg-slate-300" : "bg-slate-700";

  const btnBase = "h-8 min-w-[32px] px-2 flex items-center justify-center rounded-lg transition-all cursor-pointer font-medium text-xs select-none";

  return (
    <div className={`${bgClass} border-b px-3 py-2 flex flex-wrap items-center justify-between gap-1.5 text-xs select-none transition-colors`}>
      {/* Left: Tools Group */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Headings */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Heading 1 (#)"
            onClick={() => onInsertText("# ", "", "หัวข้อระดับ 1")}
            className={cn(btnBase, btnHover)}
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Heading 2 (##)"
            onClick={() => onInsertText("## ", "", "หัวข้อระดับ 2")}
            className={cn(btnBase, btnHover)}
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Heading 3 (###)"
            onClick={() => onInsertText("### ", "", "หัวข้อระดับ 3")}
            className={cn(btnBase, btnHover)}
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        <div className={`h-5 w-px ${dividerClass} mx-1 flex-shrink-0`} />

        {/* Text Formats */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Bold (**text**) [⌘B]"
            onClick={() => onInsertText("**", "**", "ตัวหนา")}
            className={cn(btnBase, btnHover)}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Italic (*text*) [⌘I]"
            onClick={() => onInsertText("*", "*", "ตัวเอียง")}
            className={cn(btnBase, btnHover)}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Strikethrough (~~text~~)"
            onClick={() => onInsertText("~~", "~~", "ข้อความขีดฆ่า")}
            className={cn(btnBase, btnHover)}
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Inline Code (`code`)"
            onClick={() => onInsertText("`", "`", "code")}
            className={cn(btnBase, btnHover)}
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        <div className={`h-5 w-px ${dividerClass} mx-1 flex-shrink-0`} />

        {/* Lists & Quotes */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Quote (> text)"
            onClick={() => onInsertText("> ", "", "ข้อความอ้างอิง")}
            className={cn(btnBase, btnHover)}
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Bulleted List (- item)"
            onClick={() => onInsertText("- ", "", "รายการข้อ")}
            className={cn(btnBase, btnHover)}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Task List (- [ ] item)"
            onClick={() => onInsertText("- [ ] ", "", "งานที่ต้องทำ")}
            className={cn(btnBase, btnHover)}
          >
            <CheckSquare className="w-4 h-4" />
          </button>
        </div>

        <div className={`h-5 w-px ${dividerClass} mx-1 flex-shrink-0`} />

        {/* Structural Blocks */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Table Template"
            onClick={() =>
              onInsertText(
                "\n| คอลัมน์ที่ 1 | คอลัมน์ที่ 2 | คอลัมน์ที่ 3 |\n| :--- | :--- | :--- |\n| ข้อมูล 1 | ข้อมูล 2 | ข้อมูล 3 |\n| ข้อมูล 4 | ข้อมูล 5 | ข้อมูล 6 |\n"
              )
            }
            className="h-8 px-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 font-medium text-xs shadow-2xs cursor-pointer"
          >
            <Table className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">ตาราง</span>
          </button>

          <button
            type="button"
            title="Mermaid Flowchart Diagram"
            onClick={() =>
              onInsertText(
                "\n```mermaid\ngraph TD\n  Start[เริ่มต้น] --> Action[ดำเนินการ]\n  Action --> End[เสร็จสิ้น]\n```\n"
              )
            }
            className="h-8 px-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1.5 font-medium text-xs shadow-2xs cursor-pointer"
          >
            <Workflow className="w-4 h-4 text-purple-600" />
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
            className="h-8 px-2.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors flex items-center gap-1.5 font-medium text-xs shadow-2xs cursor-pointer hidden md:flex"
          >
            <FileCheck2 className="w-4 h-4 text-sky-600" />
            <span>Req Block</span>
          </button>

          <button
            type="button"
            title="คลังแม่แบบบล็อกเนื้อหาสำเร็จรูป (Snippet Templates)"
            onClick={() => setIsSnippetModalOpen(true)}
            className="h-8 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 font-semibold text-xs shadow-2xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>แม่แบบ</span>
            <Puzzle className="w-3.5 h-3.5 text-indigo-500" />
          </button>

          <button
            type="button"
            title="Page Break สำหรับการพิมพ์ PDF (<!-- pagebreak -->)"
            onClick={() => onInsertText("\n<!-- pagebreak -->\n")}
            className="h-8 px-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5 font-medium text-xs shadow-2xs cursor-pointer hidden lg:flex"
          >
            <Scissors className="w-4 h-4 text-amber-600" />
            <span>PageBreak</span>
          </button>

          <button
            type="button"
            title="Notice / Alert Callout"
            onClick={() =>
              onInsertText(
                "\n> **ข้อควรระวัง (Important):**  \n> รายละเอียดข้อควรระวัง...\n"
              )
            }
            className={cn(btnBase, btnHover)}
          >
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </button>
        </div>

        <div className={`h-5 w-px ${dividerClass} mx-1 flex-shrink-0`} />

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
          className="h-8 px-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 font-medium text-xs shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          <span>{isUploading ? "Uploading..." : "รูปภาพ"}</span>
        </button>
      </div>

      {/* Right: Search & Snippet Modal */}
      <div className="flex items-center gap-1.5">
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className="h-8 px-2.5 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs shadow-2xs cursor-pointer font-medium"
            title="Find in document (⌘F)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">ค้นหา</span>
          </button>
        )}
      </div>

      {/* Template Snippet Modal */}
      <TemplateSnippetModal
        isOpen={isSnippetModalOpen}
        onClose={() => setIsSnippetModalOpen(false)}
        onInsertSnippet={(markdown) => onInsertText(markdown)}
      />
    </div>
  );
}
