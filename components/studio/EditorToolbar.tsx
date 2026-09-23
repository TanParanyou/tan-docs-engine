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
  Undo2,
  Redo2,
  RotateCcw,
  AlignJustify,
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
  // History Undo / Redo controls
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  // Formatting & Safety controls
  onPrettifyTables?: () => void;
  isDirty?: boolean;
  onRevert?: () => void;
}

export default function EditorToolbar({
  onInsertText,
  onUploadImage,
  isUploading,
  onOpenSearch,
  editorTheme,
  onToggleTheme,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onPrettifyTables,
  isDirty = false,
  onRevert,
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

  // Retro Sharp Industrial Design Button Tokens
  const btnBase =
    "h-8 min-w-[32px] px-2 flex items-center justify-center rounded-retro text-theme-text transition-all cursor-pointer font-medium text-xs select-none";
  const btnNormal =
    "hover:bg-theme-surface-sunken text-theme-text hover:text-theme-text border border-transparent active:translate-x-[0.5px] active:translate-y-[0.5px]";
  const btnDisabled = "opacity-30 cursor-not-allowed hover:bg-transparent pointer-events-none";

  return (
    <div className="bg-theme-surface border-b border-theme-border px-3 py-1.5 flex items-center justify-between gap-2 text-xs select-none shadow-retro-sm transition-colors overflow-x-auto scrollbar-none">
      {/* Left: Tools Group */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Group 1: Undo / Redo / Revert */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            title="ย้อนกลับ Undo (⌘Z)"
            disabled={!canUndo}
            onClick={onUndo}
            className={cn(btnBase, "flex-shrink-0", !canUndo ? btnDisabled : btnNormal)}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="ทำซ้ำ Redo (⌘⇧Z หรือ ⌘Y)"
            disabled={!canRedo}
            onClick={onRedo}
            className={cn(btnBase, "flex-shrink-0", !canRedo ? btnDisabled : btnNormal)}
          >
            <Redo2 className="w-4 h-4" />
          </button>
          {isDirty && onRevert && (
            <button
              type="button"
              title="คืนค่าต้นฉบับล่าสุด (Revert to Saved)"
              onClick={onRevert}
              className={cn(
                btnBase,
                "flex-shrink-0 whitespace-nowrap text-theme-warning hover:bg-theme-warning/10 border border-theme-warning/40 shadow-retro-sm"
              )}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">คืนค่าเดิม</span>
            </button>
          )}
        </div>

        <div className="h-5 w-px bg-theme-border-subtle mx-1 flex-shrink-0" />

        {/* Group 2: Headings */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            title="Heading 1 (#)"
            onClick={() => onInsertText("# ", "", "หัวข้อระดับ 1")}
            className={cn(btnBase, "flex-shrink-0", btnNormal)}
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Heading 2 (##)"
            onClick={() => onInsertText("## ", "", "หัวข้อระดับ 2")}
            className={cn(btnBase, "flex-shrink-0", btnNormal)}
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Heading 3 (###)"
            onClick={() => onInsertText("### ", "", "หัวข้อระดับ 3")}
            className={cn(btnBase, "flex-shrink-0", btnNormal)}
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-theme-border-subtle mx-1 flex-shrink-0" />

        {/* Group 3: Formatting */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            title="Bold (**text**) [⌘B]"
            onClick={() => onInsertText("**", "**", "ตัวหนา")}
            className={cn(btnBase, "flex-shrink-0", btnNormal)}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Italic (*text*) [⌘I]"
            onClick={() => onInsertText("*", "*", "ตัวเอียง")}
            className={cn(btnBase, "flex-shrink-0", btnNormal)}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Strikethrough (~~text~~)"
            onClick={() => onInsertText("~~", "~~", "ข้อความขีดฆ่า")}
            className={cn(btnBase, "flex-shrink-0", btnNormal)}
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Inline Code (`code`)"
            onClick={() => onInsertText("`", "`", "code")}
            className={cn(btnBase, "flex-shrink-0", btnNormal)}
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-theme-border-subtle mx-1 flex-shrink-0" />

        {/* Group 4: Lists & Quotes */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            title="Quote (> text)"
            onClick={() => onInsertText("> ", "", "ข้อความอ้างอิง")}
            className={cn(btnBase, "flex-shrink-0", btnNormal)}
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Bulleted List (- item)"
            onClick={() => onInsertText("- ", "", "รายการข้อ")}
            className={cn(btnBase, "flex-shrink-0", btnNormal)}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Task List (- [ ] item)"
            onClick={() => onInsertText("- [ ] ", "", "งานที่ต้องทำ")}
            className={cn(btnBase, "flex-shrink-0", btnNormal)}
          >
            <CheckSquare className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-theme-border-subtle mx-1 flex-shrink-0" />

        {/* Group 5: Structural Blocks & Formatting */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            title="สร้างตาราง Markdown"
            onClick={() =>
              onInsertText(
                "\n| คอลัมน์ที่ 1 | คอลัมน์ที่ 2 | คอลัมน์ที่ 3 |\n| :--- | :--- | :--- |\n| ข้อมูล 1 | ข้อมูล 2 | ข้อมูล 3 |\n| ข้อมูล 4 | ข้อมูล 5 | ข้อมูล 6 |\n"
              )
            }
            className="h-8 px-2.5 bg-theme-accent-light text-theme-accent-text hover:bg-theme-accent-hover hover:text-white border border-theme-accent rounded-retro transition-all flex items-center gap-1.5 font-medium text-xs shadow-retro-sm cursor-pointer active:translate-x-[0.5px] active:translate-y-[0.5px] whitespace-nowrap flex-shrink-0"
          >
            <Table className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">ตาราง</span>
          </button>

          {onPrettifyTables && (
            <button
              type="button"
              title="จัดระเบียบตาราง Markdown ให้คอลัมน์ตรงแนวกันสวยงาม (Prettify Tables)"
              onClick={onPrettifyTables}
              className={cn(
                btnBase,
                btnNormal,
                "border border-theme-border-subtle hover:border-theme-border whitespace-nowrap flex-shrink-0"
              )}
            >
              <AlignJustify className="w-3.5 h-3.5 mr-1 text-theme-accent flex-shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">จัดแนวตาราง</span>
            </button>
          )}

          <button
            type="button"
            title="แผนภาพ Mermaid Flowchart"
            onClick={() =>
              onInsertText(
                "\n```mermaid\ngraph TD\n  Start[เริ่มต้น] --> Action[ดำเนินการ]\n  Action --> End[เสร็จสิ้น]\n```\n"
              )
            }
            className="h-8 px-2.5 bg-theme-surface hover:bg-theme-surface-hover text-theme-text border border-theme-border rounded-retro transition-all flex items-center gap-1.5 font-medium text-xs shadow-retro-sm cursor-pointer active:translate-x-[0.5px] active:translate-y-[0.5px] whitespace-nowrap flex-shrink-0"
          >
            <Workflow className="w-4 h-4 text-theme-primary flex-shrink-0" />
            <span className="whitespace-nowrap">Mermaid</span>
          </button>

          <button
            type="button"
            title="บล็อกยืนยันความต้องการ Requirement Confirmation Block"
            onClick={() =>
              onInsertText(
                "\n### 4.X REQ-POS-XXX — [ชื่อฟังก์ชัน]\n\n**Requirement จากการประชุม**  \nรายละเอียด...\n\n**พฤติกรรมที่คาดหวัง**\n1. เงื่อนไขแรก...\n\n**ผลการพิจารณา:**\n- [ ] ยืนยันตามข้อเสนอ\n- [ ] ขอแก้ไข\n- [ ] ไม่อยู่ในขอบเขต\n**หมายเหตุลูกค้า:** -\n\n---\n"
              )
            }
            className="h-8 px-2.5 bg-theme-surface hover:bg-theme-surface-hover text-theme-text border border-theme-border rounded-retro transition-all flex items-center gap-1.5 font-medium text-xs shadow-retro-sm cursor-pointer hidden md:flex active:translate-x-[0.5px] active:translate-y-[0.5px] whitespace-nowrap flex-shrink-0"
          >
            <FileCheck2 className="w-4 h-4 text-theme-accent flex-shrink-0" />
            <span className="whitespace-nowrap">Req Block</span>
          </button>

          <button
            type="button"
            title="คลังแม่แบบบล็อกเนื้อหาสำเร็จรูป (Snippet Templates)"
            onClick={() => setIsSnippetModalOpen(true)}
            className="h-8 px-3 bg-theme-primary text-theme-primary-text hover:bg-theme-primary-hover border border-theme-border rounded-retro transition-all flex items-center gap-1.5 font-semibold text-xs shadow-retro-sm cursor-pointer active:translate-x-[0.5px] active:translate-y-[0.5px] whitespace-nowrap flex-shrink-0"
          >
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">แม่แบบ</span>
            <Puzzle className="w-3.5 h-3.5 opacity-80 flex-shrink-0" />
          </button>

          <button
            type="button"
            title="Page Break สำหรับการพิมพ์ PDF (<!-- pagebreak -->)"
            onClick={() => onInsertText("\n<!-- pagebreak -->\n")}
            className="h-8 px-2.5 bg-theme-surface-sunken hover:bg-theme-surface-hover text-theme-text border border-theme-border rounded-retro transition-all flex items-center gap-1.5 font-medium text-xs shadow-retro-sm cursor-pointer hidden lg:flex active:translate-x-[0.5px] active:translate-y-[0.5px] whitespace-nowrap flex-shrink-0"
          >
            <Scissors className="w-4 h-4 text-theme-warning flex-shrink-0" />
            <span className="whitespace-nowrap">PageBreak</span>
          </button>

          <button
            type="button"
            title="กล่องข้อควรระวัง Notice / Alert Callout"
            onClick={() =>
              onInsertText(
                "\n> **ข้อควรระวัง (Important):**  \n> รายละเอียดข้อควรระวัง...\n"
              )
            }
            className={cn(btnBase, "flex-shrink-0", btnNormal)}
          >
            <AlertCircle className="w-4 h-4 text-theme-danger flex-shrink-0" />
          </button>
        </div>

        <div className="h-5 w-px bg-theme-border-subtle mx-1 flex-shrink-0" />

        {/* Group 6: Media: Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          title="อัปโหลดหรือวางรูปภาพ (หรือกด ⌘V วางรูปได้เลย)"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-8 px-2.5 bg-theme-success/10 text-theme-success hover:bg-theme-success/20 border border-theme-success/40 rounded-retro transition-all flex items-center gap-1.5 font-medium text-xs shadow-retro-sm cursor-pointer disabled:opacity-50 active:translate-x-[0.5px] active:translate-y-[0.5px] whitespace-nowrap flex-shrink-0"
        >
          <ImageIcon className="w-4 h-4 text-theme-success flex-shrink-0" />
          <span className="whitespace-nowrap">{isUploading ? "Uploading..." : "รูปภาพ"}</span>
        </button>
      </div>

      {/* Right: Search & Snippet Modal */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className="h-8 px-2.5 rounded-retro border border-theme-border bg-theme-surface hover:bg-theme-surface-hover text-theme-text transition-all flex items-center gap-1.5 text-xs shadow-retro-sm cursor-pointer font-medium active:translate-x-[0.5px] active:translate-y-[0.5px] whitespace-nowrap flex-shrink-0"
            title="ค้นหาข้อความในเอกสาร (⌘F)"
          >
            <Search className="w-3.5 h-3.5 text-theme-text-muted flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap font-mono">ค้นหา</span>
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
