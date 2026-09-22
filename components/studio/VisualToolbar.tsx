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
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Plus,
  Trash2,
  Columns,
  Rows,
} from "lucide-react";

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
  };

  const isTableActive = editor.isActive("table");

  return (
    <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 flex flex-wrap items-center gap-1 text-slate-700 text-xs select-none">
      {/* Undo / Redo */}
      <div className="flex items-center space-x-0.5 pr-1.5 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600 transition-colors"
          title="Undo (⌘Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600 transition-colors"
          title="Redo (⌘⇧Z)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center space-x-0.5 pr-1.5 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors ${
            editor.isActive("paragraph")
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-200 text-slate-600"
          }`}
          title="Normal Text (Paragraph)"
        >
          P
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded font-bold transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-200 text-slate-600"
          }`}
          title="Heading 1 (หัวข้อใหญ่ระดับ 1)"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded font-bold transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-200 text-slate-600"
          }`}
          title="Heading 2 (หัวข้อระดับ 2)"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded font-bold transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-200 text-slate-600"
          }`}
          title="Heading 3 (หัวข้อย่อยระดับ 3)"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Formatting Marks */}
      <div className="flex items-center space-x-0.5 pr-1.5 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("bold")
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-200 text-slate-600"
          }`}
          title="Bold (ตัวหนา ⌘B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("italic")
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-200 text-slate-600"
          }`}
          title="Italic (ตัวเอียง ⌘I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("strike")
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-200 text-slate-600"
          }`}
          title="Strikethrough (ขีดฆ่า)"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Lists & Quote */}
      <div className="flex items-center space-x-0.5 pr-1.5 border-r border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("bulletList")
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-200 text-slate-600"
          }`}
          title="Bullet List (รายการลำดับจุด)"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("orderedList")
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-200 text-slate-600"
          }`}
          title="Numbered List (รายการตัวเลข)"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive("blockquote")
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-200 text-slate-600"
          }`}
          title="Blockquote (กล่องคำพูด/อ้างอิง)"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table Controls */}
      <div className="flex items-center space-x-0.5 pr-1.5 border-r border-slate-200">
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
            className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-medium text-[11px] transition-colors"
            title="สร้างตารางใหม่ (3x3)"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>ตาราง</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
            <span className="text-[10px] font-semibold text-emerald-800">ตาราง:</span>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-1 py-0.5 hover:bg-emerald-200 rounded text-[10px] text-emerald-800 font-medium"
              title="เพิ่มแถวด้านล่าง (+Row)"
            >
              +แถว
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-1 py-0.5 hover:bg-emerald-200 rounded text-[10px] text-emerald-800 font-medium"
              title="เพิ่มคอลัมน์ด้านขวา (+Col)"
            >
              +คอลัมน์
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-1 py-0.5 hover:bg-rose-100 rounded text-[10px] text-rose-700 font-medium"
              title="ลบแถวนี้"
            >
              -แถว
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="px-1 py-0.5 hover:bg-rose-100 rounded text-[10px] text-rose-700 font-medium"
              title="ลบคอลัมน์นี้"
            >
              -คอลัมน์
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="p-0.5 hover:bg-rose-200 rounded text-rose-700"
              title="ลบตารางทั้งหมด"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Image Upload */}
      {onUploadImage && (
        <div className="flex items-center">
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
            className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
            title="อัปโหลดรูปภาพ"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
