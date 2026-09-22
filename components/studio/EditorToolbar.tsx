"use client";

import React, { useRef } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Table,
  Workflow,
  Scissors,
  Code,
  Image as ImageIcon,
  CheckSquare,
  Quote,
  List,
} from "lucide-react";

interface EditorToolbarProps {
  onInsertText: (before: string, after?: string, defaultText?: string) => void;
  onUploadImage?: (file: File) => void;
  isUploading?: boolean;
}

export default function EditorToolbar({
  onInsertText,
  onUploadImage,
  isUploading,
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUploadImage) {
      onUploadImage(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex flex-wrap items-center gap-1 text-slate-700">
      {/* Headings */}
      <button
        type="button"
        title="Heading 1"
        onClick={() => onInsertText("# ", "", "หัวข้อระดับ 1")}
        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Heading 2"
        onClick={() => onInsertText("## ", "", "หัวข้อระดับ 2")}
        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Heading 3"
        onClick={() => onInsertText("### ", "", "หัวข้อระดับ 3")}
        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="h-4 w-px bg-slate-300 mx-1" />

      {/* Formatting */}
      <button
        type="button"
        title="Bold"
        onClick={() => onInsertText("**", "**", "ข้อความตัวหนา")}
        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Italic"
        onClick={() => onInsertText("*", "*", "ข้อความตัวเอียง")}
        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Quote"
        onClick={() => onInsertText("> ", "", "ข้อความอ้างอิง")}
        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Unordered List"
        onClick={() => onInsertText("- ", "", "รายการข้อ")}
        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Task List"
        onClick={() => onInsertText("- [ ] ", "", "สิ่งที่ต้องทำ")}
        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
      >
        <CheckSquare className="w-4 h-4" />
      </button>

      <div className="h-4 w-px bg-slate-300 mx-1" />

      {/* Structural & Code Blocks */}
      <button
        type="button"
        title="Table Template"
        onClick={() =>
          onInsertText(
            "\n| คอลัมน์ที่ 1 | คอลัมน์ที่ 2 | คอลัมน์ที่ 3 |\n| :--- | :--- | :--- |\n| ข้อมูล 1 | ข้อมูล 2 | ข้อมูล 3 |\n| ข้อมูล 4 | ข้อมูล 5 | ข้อมูล 6 |\n"
          )
        }
        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 text-xs font-medium"
      >
        <Table className="w-4 h-4" />
        <span className="hidden sm:inline">Table</span>
      </button>

      <button
        type="button"
        title="Mermaid Flowchart Block"
        onClick={() =>
          onInsertText(
            "\n```mermaid\ngraph TD\n  Start[เริ่มต้น] --> Action[ดำเนินการ]\n  Action --> End[เสร็จสิ้น]\n```\n"
          )
        }
        className="p-1.5 hover:bg-blue-100 hover:text-blue-700 rounded text-blue-600 transition-colors flex items-center gap-1 text-xs font-medium"
      >
        <Workflow className="w-4 h-4" />
        <span className="hidden sm:inline">Mermaid</span>
      </button>

      <button
        type="button"
        title="Code Block"
        onClick={() => onInsertText("\n```typescript\n// รหัสโปรแกรม\n", "\n```\n")}
        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Code className="w-4 h-4" />
      </button>

      <button
        type="button"
        title="Page Break (สำหรับพิมพ์ PDF)"
        onClick={() => onInsertText("\n<!-- pagebreak -->\n")}
        className="p-1.5 hover:bg-amber-100 hover:text-amber-700 rounded text-amber-600 transition-colors flex items-center gap-1 text-xs font-medium"
      >
        <Scissors className="w-4 h-4" />
        <span className="hidden sm:inline">PageBreak</span>
      </button>

      <div className="h-4 w-px bg-slate-300 mx-1" />

      {/* Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        title="Upload Image (หรือลากไฟล์ / วางรูปภาพได้เลย)"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="p-1.5 hover:bg-emerald-100 hover:text-emerald-700 rounded text-emerald-600 transition-colors flex items-center gap-1 text-xs font-medium disabled:opacity-50"
      >
        <ImageIcon className="w-4 h-4" />
        <span className="hidden sm:inline">
          {isUploading ? "Uploading..." : "Insert Image"}
        </span>
      </button>
    </div>
  );
}
