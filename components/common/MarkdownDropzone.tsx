"use client";

import React, { useRef } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className={cn(
        "relative group cursor-pointer transition-all rounded-retro border-2 border-dashed p-4 flex flex-col items-center justify-center text-center select-none",
        isDragging
          ? "border-theme-primary bg-theme-primary/10 shadow-retro"
          : "border-theme-border hover:border-theme-primary bg-theme-surface hover:bg-theme-surface-hover shadow-retro-sm",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className
      )}
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
        className={cn(
          "w-9 h-9 rounded-retro flex items-center justify-center mb-2 transition-transform border border-theme-border",
          isDragging
            ? "bg-theme-primary text-theme-primary-text shadow-retro-sm"
            : "bg-theme-surface-sunken text-theme-text group-hover:bg-theme-primary group-hover:text-theme-primary-text"
        )}
      >
        <UploadCloud className="w-4 h-4" />
      </div>

      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-theme-text">
          ลากและวางไฟล์ <span className="font-mono text-theme-primary">.md</span> ลงที่นี่ หรือคลิกเพื่อเลือกไฟล์
        </p>
        <p className="text-[11px] text-theme-text-muted">
          รองรับไฟล์ Markdown หลายไฟล์พร้อมกัน ลำดับไฟล์ตามลำดับที่เลือก
        </p>
      </div>
    </div>
  );
}
