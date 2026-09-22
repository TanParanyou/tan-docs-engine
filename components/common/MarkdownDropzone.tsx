"use client";

import React, { useRef } from "react";
import { UploadCloud, FileText, Plus } from "lucide-react";

interface MarkdownDropzoneProps {
  isDragging: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export default function MarkdownDropzone({
  isDragging,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  disabled = false,
  className = "",
}: MarkdownDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={handleClick}
      className={`relative group cursor-pointer transition-all duration-200 rounded-xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center select-none ${
        isDragging
          ? "border-blue-500 bg-blue-50/80 scale-[1.01] shadow-md shadow-blue-500/10 ring-2 ring-blue-400/30"
          : "border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".md,text/markdown,text/plain"
        onChange={onFileInputChange}
        disabled={disabled}
        className="hidden"
      />

      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform duration-200 ${
          isDragging
            ? "bg-blue-600 text-white scale-110 shadow-md shadow-blue-500/30"
            : "bg-blue-100/80 group-hover:bg-blue-600 text-blue-600 group-hover:text-white"
        }`}
      >
        {isDragging ? (
          <FileText className="w-5 h-5 animate-bounce" />
        ) : (
          <UploadCloud className="w-5 h-5" />
        )}
      </div>

      <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
        {isDragging ? "ปล่อยไฟล์ที่นี่เพื่ออัปโหลด..." : "ลากไฟล์ .md มาวาง หรือคลิกเลือกไฟล์"}
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5">
        รองรับไฟล์ Markdown หลายไฟล์พร้อมกัน (.md)
      </p>
    </div>
  );
}
