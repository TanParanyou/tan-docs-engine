"use client";

import React, { useRef, useState, useCallback } from "react";
import EditorToolbar from "./EditorToolbar";

interface MarkdownEditorProps {
  content: string;
  onChange: (value: string) => void;
  onSave: () => void;
  slug: string;
  filename: string;
}

export default function MarkdownEditor({
  content,
  onChange,
  onSave,
  slug,
  filename,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Helper to insert markdown text at current cursor selection
  const insertTextAtCursor = useCallback(
    (before: string, after: string = "", defaultText: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end);
      const textToInsert = selected || defaultText;
      const replacement = `${before}${textToInsert}${after}`;

      const newContent =
        textarea.value.substring(0, start) +
        replacement +
        textarea.value.substring(end);

      onChange(newContent);

      setTimeout(() => {
        textarea.focus();
        const cursorPosition = start + before.length + textToInsert.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    },
    [onChange]
  );

  // Image upload handler
  const handleUploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadStatus("กำลังอัปโหลดรูปภาพ...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/workspaces/${slug}/upload`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Upload failed");
      }

      const markdownImage = `\n![${file.name.replace(/\.[^/.]+$/, "")}](${json.data.url})\n`;
      insertTextAtCursor(markdownImage);
      setUploadStatus("อัปโหลดรูปภาพสำเร็จ!");
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadStatus(`อัปโหลดล้มเหลว: ${err.message}`);
      setTimeout(() => setUploadStatus(null), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  // Keyboard shortcut listener (Cmd+S, Tab)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Save shortcut: Cmd+S or Ctrl+S
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      onSave();
      return;
    }

    // Tab key: Insert 2 spaces
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        textarea.value.substring(0, start) +
        "  " +
        textarea.value.substring(end);

      onChange(newContent);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Paste image handler (Ctrl+V / Cmd+V)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          handleUploadImage(file);
        }
        break;
      }
    }
  };

  // Drag & drop image handler
  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        e.preventDefault();
        handleUploadImage(file);
      }
    }
  };

  // Line and word counter
  const lines = content ? content.split("\n").length : 1;
  const words = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = content.length;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-700">
      {/* Formatting Toolbar */}
      <EditorToolbar
        onInsertText={insertTextAtCursor}
        onUploadImage={handleUploadImage}
        isUploading={isUploading}
      />

      {uploadStatus && (
        <div className="bg-blue-900/60 border-b border-blue-700 px-4 py-1.5 text-xs text-blue-200 flex items-center justify-between">
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Editor Main Textarea */}
      <div className="relative flex-1 flex flex-col">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onDrop={handleDrop}
          placeholder="เริ่มเขียนเอกสาร Markdown ที่นี่... (รองรับการลากรูปภาพมาวาง หรือกด Ctrl+V วางรูปได้ทันที)"
          className="w-full flex-1 p-5 bg-slate-900 text-slate-100 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-0 selection:bg-blue-600 selection:text-white"
          spellCheck={false}
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-semibold">{filename}</span>
          <span>&bull;</span>
          <span>{lines} lines</span>
          <span>&bull;</span>
          <span>{words} words</span>
          <span>&bull;</span>
          <span>{chars} chars</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
            Ctrl/Cmd + S
          </kbd>
          <span>to Save</span>
        </div>
      </div>
    </div>
  );
}
