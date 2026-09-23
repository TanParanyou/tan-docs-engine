"use client";

import React, { useRef } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Trash2,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VisualToolbarProps {
  editor: Editor | null;
  onUploadImage?: (file: File) => void;
  isUploading?: boolean;
  onOpenSearch?: () => void;
}

export default function VisualToolbar({
  editor,
  onUploadImage,
  isUploading,
  onOpenSearch,
}: VisualToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUploadImage) {
      onUploadImage(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isTableActive = editor.isActive("table");

  // Retro Theme Button Styles
  const btnBase =
    "h-8 min-w-[32px] px-2 flex items-center justify-center rounded-retro text-theme-text transition-all cursor-pointer font-medium text-xs select-none";
  const btnNormal =
    "hover:bg-theme-surface-sunken text-theme-text hover:text-theme-text border border-transparent active:translate-x-[0.5px] active:translate-y-[0.5px]";
  const btnActive =
    "bg-theme-primary text-theme-primary-text font-bold shadow-retro-sm hover:bg-theme-primary-hover border border-theme-border";
  const btnDisabled = "opacity-30 cursor-not-allowed hover:bg-transparent";

  return (
    <div className="border-b border-theme-border bg-theme-surface px-3 py-1.5 flex items-center gap-1.5 text-theme-text text-xs select-none shadow-retro-sm overflow-x-auto scrollbar-none flex-shrink-0">
      {/* Group 1: Undo / Redo */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={cn(
            btnBase,
            !editor.can().undo() ? btnDisabled : btnNormal
          )}
          title="Undo ย้อนกลับ (⌘Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={cn(
            btnBase,
            !editor.can().redo() ? btnDisabled : btnNormal
          )}
          title="Redo ทำซ้ำ (⌘⇧Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="h-5 w-px bg-theme-border-subtle mx-1 flex-shrink-0" />

      {/* Group 2: Headings & Paragraph */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={cn(
            btnBase,
            "px-2.5 font-bold font-serif",
            editor.isActive("paragraph") ? btnActive : btnNormal
          )}
          title="ข้อความธรรมดา (Paragraph)"
        >
          P
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            btnBase,
            editor.isActive("heading", { level: 1 }) ? btnActive : btnNormal
          )}
          title="หัวข้อใหญ่ระดับ 1 (H1)"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            btnBase,
            editor.isActive("heading", { level: 2 }) ? btnActive : btnNormal
          )}
          title="หัวข้อระดับ 2 (H2)"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            btnBase,
            editor.isActive("heading", { level: 3 }) ? btnActive : btnNormal
          )}
          title="หัวข้อย่อยระดับ 3 (H3)"
        >
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      <div className="h-5 w-px bg-theme-border-subtle mx-1 flex-shrink-0" />

      {/* Group 3: Formatting */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            btnBase,
            editor.isActive("bold") ? btnActive : btnNormal
          )}
          title="ตัวหนา (⌘B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            btnBase,
            editor.isActive("italic") ? btnActive : btnNormal
          )}
          title="ตัวเอียง (⌘I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            btnBase,
            editor.isActive("strike") ? btnActive : btnNormal
          )}
          title="ขีดฆ่า (Strikethrough)"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      <div className="h-5 w-px bg-theme-border-subtle mx-1 flex-shrink-0" />

      {/* Group 4: Lists & Quotes */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            btnBase,
            editor.isActive("bulletList") ? btnActive : btnNormal
          )}
          title="รายการแบบจุด (Bullet List)"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            btnBase,
            editor.isActive("orderedList") ? btnActive : btnNormal
          )}
          title="รายการแบบตัวเลข (Numbered List)"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            btnBase,
            editor.isActive("blockquote") ? btnActive : btnNormal
          )}
          title="กล่องข้อความอ้างอิง (Quote)"
        >
          <Quote className="w-4 h-4" />
        </button>
      </div>

      <div className="h-5 w-px bg-theme-border-subtle mx-1 flex-shrink-0" />

      {/* Group 5: Table & Media */}
      <div className="flex items-center gap-1.5">
        {!isTableActive ? (
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            className="h-8 px-3 flex items-center gap-1.5 bg-theme-accent-light hover:bg-theme-accent-hover text-theme-accent-text hover:text-white border border-theme-accent rounded-retro font-medium text-xs transition-all shadow-retro-sm cursor-pointer active:translate-x-[0.5px] active:translate-y-[0.5px]"
            title="แทรกตารางใหม่ (3 แถว x 3 คอลัมน์)"
          >
            <TableIcon className="w-4 h-4" />
            <span>สร้างตาราง</span>
          </button>
        ) : (
          /* Table Sub-Toolbar when Table is active */
          <div className="flex items-center gap-1 bg-theme-surface-sunken border border-theme-border rounded-retro p-0.5 text-theme-text shadow-retro-sm">
            <span className="text-[11px] font-bold text-theme-text px-1 hidden sm:inline font-mono">
              ตาราง:
            </span>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="h-7 px-2 bg-theme-surface hover:bg-theme-surface-hover text-theme-text rounded-retro text-xs font-medium border border-theme-border shadow-retro-sm transition-colors cursor-pointer"
              title="เพิ่มแถวด้านล่าง (+Row)"
            >
              + แถว
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="h-7 px-2 bg-theme-surface hover:bg-theme-surface-hover text-theme-text rounded-retro text-xs font-medium border border-theme-border shadow-retro-sm transition-colors cursor-pointer"
              title="เพิ่มคอลัมน์ด้านขวา (+Col)"
            >
              + คอลัมน์
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="h-7 px-2 bg-theme-danger-light hover:bg-theme-danger/20 text-theme-danger rounded-retro text-xs font-medium border border-theme-danger/50 shadow-retro-sm transition-colors cursor-pointer"
              title="ลบแถวที่เลือก"
            >
              - แถว
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="h-7 px-2 bg-theme-danger-light hover:bg-theme-danger/20 text-theme-danger rounded-retro text-xs font-medium border border-theme-danger/50 shadow-retro-sm transition-colors cursor-pointer"
              title="ลบคอลัมน์ที่เลือก"
            >
              - คอลัมน์
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="h-7 w-7 flex items-center justify-center bg-theme-danger-light hover:bg-theme-danger/20 text-theme-danger border border-theme-danger/50 rounded-retro shadow-retro-sm transition-colors cursor-pointer"
              title="ลบตารางทั้งหมด"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Image Upload */}
        {onUploadImage && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(btnBase, btnNormal)}
              title="อัปโหลดรูปภาพ"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Search */}
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className="h-8 px-2 flex items-center gap-1.5 text-xs text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-sunken rounded-retro transition-colors border border-transparent hover:border-theme-border cursor-pointer select-none"
            title="ค้นหาและแทนที่ (⌘F)"
          >
            <Search className="w-3.5 h-3.5 text-theme-text-muted flex-shrink-0" />
            <span className="hidden sm:inline font-mono">ค้นหา</span>
            <kbd className="hidden md:inline text-[9px] bg-theme-surface border border-theme-border px-1 py-0.2 rounded text-theme-text-faint font-mono">
              ⌘F
            </kbd>
          </button>
        )}
      </div>
    </div>
  );
}
