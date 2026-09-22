"use client";

import React, { useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import EditorToolbar from "./EditorToolbar";
import EditorSearch from "./EditorSearch";
import VisualEditor, { VisualEditorHandle } from "./VisualEditor";
import { useStudioStore } from "@/lib/store/useStudioStore";
import { Eye, Code } from "lucide-react";

export interface MarkdownEditorHandle {
  jumpToLine: (lineNumber: number) => void;
  insertSnippet: (snippet: string) => void;
}

interface MarkdownEditorProps {
  content: string;
  onChange: (value: string) => void;
  onSave: () => void;
  slug: string;
  filename: string;
  onScroll?: (scrollPercentage: number) => void;
  syncScroll?: boolean;
}

const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  (
    { content, onChange, onSave, slug, filename, onScroll, syncScroll },
    ref
  ) => {
    const { inputMode, setInputMode } = useStudioStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const visualEditorRef = useRef<VisualEditorHandle>(null);
    const [editorTheme, setEditorTheme] = useState<"light" | "dark">("light");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

    // Search state
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchMatches, setSearchMatches] = useState<number[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

    // Cursor position
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

    // Expose jumpToLine and insertSnippet to parent components
    useImperativeHandle(ref, () => ({
      jumpToLine: (lineNumber: number) => {
        if (inputMode === "markdown") {
          const textarea = textareaRef.current;
          if (!textarea) return;

          const lines = textarea.value.split("\n");
          let charIndex = 0;
          for (let i = 0; i < Math.min(lineNumber - 1, lines.length); i++) {
            charIndex += lines[i].length + 1; // +1 for \n
          }

          textarea.focus();
          textarea.setSelectionRange(charIndex, charIndex);

          // Approximate scroll to line smoothly
          const totalLines = Math.max(1, lines.length);
          const percentage = Math.max(0, (lineNumber - 2) / totalLines);
          textarea.scrollTop = percentage * (textarea.scrollHeight - textarea.clientHeight);

          // Update cursor
          setCursorPos({ line: lineNumber, col: 1 });
        }
      },
      insertSnippet: (snippet: string) => {
        if (inputMode === "visual") {
          visualEditorRef.current?.insertSnippet(snippet);
        } else {
          insertTextAtCursor(snippet);
        }
      },
    }));

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
          handleSelectOrClick();
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

        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        const markdownImage = `\n![${cleanName}](${json.data.url})\n`;
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

    // Keyboard shortcut listener
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Save shortcut: Cmd+S or Ctrl+S
      if (isCmdOrCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave();
        return;
      }

      // Find shortcut: Cmd+F or Ctrl+F
      if (isCmdOrCtrl && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      // Bold: Cmd+B
      if (isCmdOrCtrl && e.key.toLowerCase() === "b") {
        e.preventDefault();
        insertTextAtCursor("**", "**", "text");
        return;
      }

      // Italic: Cmd+I
      if (isCmdOrCtrl && e.key.toLowerCase() === "i") {
        e.preventDefault();
        insertTextAtCursor("*", "*", "text");
        return;
      }

      // Tab key: Indent 2 spaces (or Shift+Tab outdent)
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (e.shiftKey) {
          // Outdent
          const beforeCursor = textarea.value.substring(0, start);
          if (beforeCursor.endsWith("  ")) {
            const newContent =
              textarea.value.substring(0, start - 2) +
              textarea.value.substring(start);
            onChange(newContent);
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start - 2;
            }, 0);
          }
        } else {
          // Indent 2 spaces
          const newContent =
            textarea.value.substring(0, start) +
            "  " +
            textarea.value.substring(end);
          onChange(newContent);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
          }, 0);
        }
      }
    };

    // Update cursor position
    const handleSelectOrClick = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const textBefore = textarea.value.substring(0, textarea.selectionStart);
      const lines = textBefore.split("\n");
      const currentLine = lines.length;
      const currentCol = lines[lines.length - 1].length + 1;
      setCursorPos({ line: currentLine, col: currentCol });
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

    // Synchronize scrolling with preview
    const handleScroll = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (syncScroll && onScroll) {
        const maxScroll = textarea.scrollHeight - textarea.clientHeight;
        if (maxScroll > 0) {
          const percentage = textarea.scrollTop / maxScroll;
          onScroll(percentage);
        }
      }
    };

    // Search Operations
    const handleFindNext = (query: string, matchCase: boolean) => {
      if (!query) {
        setSearchMatches([]);
        return;
      }

      const textarea = textareaRef.current;
      if (!textarea) return;

      const text = textarea.value;
      const flags = matchCase ? "g" : "gi";
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedQuery, flags);
      const matches: number[] = [];
      let m: RegExpExecArray | null;

      while ((m = regex.exec(text)) !== null) {
        matches.push(m.index);
      }

      setSearchMatches(matches);

      if (matches.length > 0) {
        const currentCursor = textarea.selectionStart;
        let nextIndex = matches.findIndex((idx) => idx > currentCursor);
        if (nextIndex === -1) nextIndex = 0;

        setCurrentMatchIndex(nextIndex);
        const matchPos = matches[nextIndex];
        textarea.focus();
        textarea.setSelectionRange(matchPos, matchPos + query.length);
      }
    };

    const handleFindPrev = (query: string, matchCase: boolean) => {
      if (searchMatches.length === 0) return;
      const prevIndex =
        (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
      setCurrentMatchIndex(prevIndex);

      const textarea = textareaRef.current;
      if (!textarea) return;

      const matchPos = searchMatches[prevIndex];
      textarea.focus();
      textarea.setSelectionRange(matchPos, matchPos + query.length);
    };

    const handleReplace = (
      query: string,
      replacement: string,
      matchCase: boolean
    ) => {
      if (searchMatches.length === 0) return;
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);

      const isMatch = matchCase
        ? selectedText === query
        : selectedText.toLowerCase() === query.toLowerCase();

      if (isMatch) {
        const newContent =
          textarea.value.substring(0, start) +
          replacement +
          textarea.value.substring(end);
        onChange(newContent);
        setTimeout(() => {
          handleFindNext(query, matchCase);
        }, 0);
      } else {
        handleFindNext(query, matchCase);
      }
    };

    const handleReplaceAll = (
      query: string,
      replacement: string,
      matchCase: boolean
    ) => {
      if (!query) return;
      const flags = matchCase ? "g" : "gi";
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedQuery, flags);
      const newContent = content.replace(regex, replacement);
      onChange(newContent);
      setSearchMatches([]);
    };

    // Calculate document statistics
    const lineCount = content ? content.split("\n").length : 1;
    const words = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
    const chars = content.length;

    const isLight = editorTheme === "light";
    const editorBg = isLight ? "bg-white text-slate-800" : "bg-slate-900 text-slate-100";
    const statusBg = isLight ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-slate-950 border-slate-800 text-slate-400";

    return (
      <div className={`flex flex-col h-full ${editorBg} border-r border-slate-200 dark:border-slate-800 relative transition-colors`}>
        {/* Editor Mode Header */}
        <div className="h-10 bg-white border-b border-slate-200 px-4 flex items-center justify-between flex-shrink-0 z-10 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">โหมดแก้ไข:</span>
            {/* Mode Switcher Segmented Control */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setInputMode("visual")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                  inputMode === "visual"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="โหมดพิมพ์เสมือนจริง (เหมือน Word / Notion ไม่เห็นเครื่องหมาย # หรือ **)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visual (พิมพ์จริง)</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode("markdown")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                  inputMode === "markdown"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="โหมดโค้ดดิบ Markdown (แสดงสัญลักษณ์ syntax สำหรับใส่โค้ด ไดอะแกรม)"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Markdown (โค้ดดิบ)</span>
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center text-xs text-slate-500 font-mono">
            {inputMode === "visual" ? (
              <span className="text-[11px] text-slate-500">
                ✨ ซ่อนสัญลักษณ์ Syntax อัตโนมัติ (WYSIWYG)
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">
                💻 โค้ดดิบ Markdown สำหรับใส่โค้ด/ไดอะแกรม
              </span>
            )}
          </div>
        </div>

        {/* Visual Mode View */}
        {inputMode === "visual" ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <VisualEditor
              ref={visualEditorRef}
              content={content}
              onChange={onChange}
              onSave={onSave}
              onUploadImage={handleUploadImage}
              isUploading={isUploading}
            />
          </div>
        ) : (
          /* Raw Markdown Mode View */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Formatting Toolbar */}
            <EditorToolbar
              onInsertText={insertTextAtCursor}
              onUploadImage={handleUploadImage}
              isUploading={isUploading}
              onOpenSearch={() => setIsSearchOpen(true)}
              editorTheme={editorTheme}
              onToggleTheme={() =>
                setEditorTheme(editorTheme === "light" ? "dark" : "light")
              }
            />

            {/* In-Editor Search Overlay */}
            <EditorSearch
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              content={content}
              onFindNext={handleFindNext}
              onFindPrev={handleFindPrev}
              onReplace={handleReplace}
              onReplaceAll={handleReplaceAll}
              currentMatchIndex={currentMatchIndex}
              totalMatches={searchMatches.length}
            />

            {uploadStatus && (
              <div className="bg-blue-600/10 border-b border-blue-500/20 px-4 py-1 text-xs text-blue-600 dark:text-blue-300 flex items-center justify-between">
                <span>{uploadStatus}</span>
              </div>
            )}

            {/* Main Editor Textarea (Clean, comfortable, perfectly readable) */}
            <div className="relative flex-1 flex overflow-hidden">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleSelectOrClick}
                onClick={handleSelectOrClick}
                onScroll={handleScroll}
                onPaste={handlePaste}
                onDrop={handleDrop}
                placeholder="เริ่มเขียนเอกสาร Markdown ที่นี่..."
                className={`w-full h-full p-6 sm:p-8 font-mono text-[13.5px] leading-relaxed resize-none focus:outline-none selection:bg-blue-500 selection:text-white ${editorBg}`}
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Bottom Status Bar (Single line, no overlapping text, clean metrics) */}
        <div className={`border-t px-4 py-2 flex items-center justify-between text-xs font-mono select-none overflow-x-auto whitespace-nowrap gap-4 ${statusBg}`}>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[220px]">
              {filename}
            </span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="font-medium">
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span>{lineCount} บรรทัด</span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span>{words.toLocaleString()} คำ</span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span>{chars.toLocaleString()} ตัวอักษร</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[11px]">
            <span>คีย์ลัด:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-sans shadow-xs">
              ⌘S บันทึก
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-sans shadow-xs">
              ⌘F ค้นหา
            </kbd>
          </div>
        </div>
      </div>
    );
  }
);

MarkdownEditor.displayName = "MarkdownEditor";

export default MarkdownEditor;
