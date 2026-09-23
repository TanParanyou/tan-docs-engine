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
  Plus,
  Minus,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VisualToolbarProps {
  editor: Editor | null;
  onUploadImage?: (file: File) => void;
  isUploading?: boolean;
}

export default function VisualToolbar({
  editor,
  onUploadImage,
  isUploading,
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

  // Reusable button styles
  const btnBase =
    "h-8 min-w-[32px] px-2 flex items-center justify-center rounded-lg text-slate-700 transition-all cursor-pointer font-medium text-xs select-none";
  const btnNormal =
    "hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-transparent";
  const btnActive =
    "bg-blue-600 text-white font-semibold shadow-xs hover:bg-blue-700 border border-blue-600";
  const btnDisabled = "opacity-30 cursor-not-allowed hover:bg-transparent";

  return (
    <div className="border-b border-slate-200 bg-slate-50/90 px-3 py-2 flex flex-wrap items-center gap-1.5 text-slate-700 text-xs select-none">
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

      <div className="h-5 w-px bg-slate-300 mx-1 flex-shrink-0" />

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

      <div className="h-5 w-px bg-slate-300 mx-1 flex-shrink-0" />

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

      <div className="h-5 w-px bg-slate-300 mx-1 flex-shrink-0" />

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

      <div className="h-5 w-px bg-slate-300 mx-1 flex-shrink-0" />

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
            className="h-8 px-3 flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg font-medium text-xs transition-all shadow-2xs cursor-pointer active:scale-95"
            title="แทรกตารางใหม่ (3 แถว x 3 คอลัมน์)"
          >
            <TableIcon className="w-4 h-4 text-emerald-600" />
            <span>สร้างตาราง</span>
          </button>
        ) : (
          /* Table Sub-Toolbar when Table is active */
          <div className="flex items-center gap-1 bg-emerald-50/90 border border-emerald-300 rounded-lg p-1 text-emerald-900 shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-800 px-1 hidden sm:inline">
              ตาราง:
            </span>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="h-7 px-2 bg-white hover:bg-emerald-100 rounded text-xs text-emerald-800 font-medium border border-emerald-200 transition-colors"
              title="เพิ่มแถวด้านล่าง (+Row)"
            >
              + แถว
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="h-7 px-2 bg-white hover:bg-emerald-100 rounded text-xs text-emerald-800 font-medium border border-emerald-200 transition-colors"
              title="เพิ่มคอลัมน์ด้านขวา (+Col)"
            >
              + คอลัมน์
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="h-7 px-2 bg-white hover:bg-rose-50 rounded text-xs text-rose-700 font-medium border border-rose-200 transition-colors"
              title="ลบแถวที่เลือก"
            >
              - แถว
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="h-7 px-2 bg-white hover:bg-rose-50 rounded text-xs text-rose-700 font-medium border border-rose-200 transition-colors"
              title="ลบคอลัมน์ที่เลือก"
            >
              - คอลัมน์
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="h-7 w-7 flex items-center justify-center bg-white hover:bg-rose-100 rounded text-rose-700 border border-rose-200 transition-colors"
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
      </div>
    </div>
  );
}
