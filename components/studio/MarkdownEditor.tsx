"use client";

import React, { useRef, useState, useCallback, useEffect, useImperativeHandle, forwardRef } from "react";
import EditorToolbar from "./EditorToolbar";
import EditorSearch from "./EditorSearch";

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
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
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
        const textarea = textareaRef.current;
        if (!textarea) return;

        const lines = textarea.value.split("\n");
        let charIndex = 0;
        for (let i = 0; i < Math.min(lineNumber - 1, lines.length); i++) {
          charIndex += lines[i].length + 1; // +1 for \n
        }

        textarea.focus();
        textarea.setSelectionRange(charIndex, charIndex);

        // Approximate scroll to line
        const lineHeight = 21; // font-size 13px + line-height ~21px
        textarea.scrollTop = Math.max(0, (lineNumber - 5) * lineHeight);
      },
      insertSnippet: (snippet: string) => {
        insertTextAtCursor(snippet);
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

    // Synchronize scrolling with line numbers and preview
    const handleScroll = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textarea.scrollTop;
      }

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
        // Find match after current cursor or loop to first
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

    // Calculate lines
    const lineCount = content ? content.split("\n").length : 1;
    const words = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
    const chars = content.length;

    const isLight = editorTheme === "light";
    const editorBg = isLight ? "bg-white text-slate-800" : "bg-slate-900 text-slate-100";
    const gutterBg = isLight ? "bg-slate-50 text-slate-400 border-slate-200" : "bg-slate-950 text-slate-600 border-slate-800";
    const statusBg = isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-slate-950 border-slate-800 text-slate-400";

    return (
      <div className={`flex flex-col h-full ${editorBg} border-r border-slate-200 dark:border-slate-800 relative transition-colors`}>
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

        {/* Editor Main Canvas with Line Numbers */}
        <div className="relative flex-1 flex overflow-hidden">
          {/* Line Numbers Gutter */}
          <div
            ref={lineNumbersRef}
            className={`w-12 flex-shrink-0 select-none text-right pr-3 pt-4 font-mono text-xs leading-[21px] overflow-hidden border-r ${gutterBg}`}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1} className={i + 1 === cursorPos.line ? "font-bold text-blue-600 dark:text-blue-400" : ""}>
                {i + 1}
              </div>
            ))}
          </div>

          {/* Markdown Textarea */}
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
            placeholder="เริ่มเขียนเอกสาร Markdown ที่นี่... (พิมพ์ตามปกติ, วางรูปภาพได้เลย, หรือใช้ Snippets ทางซ้าย)"
            className={`flex-1 p-4 font-mono text-[13px] leading-[21px] resize-none focus:outline-none selection:bg-blue-500 selection:text-white ${editorBg}`}
            spellCheck={false}
          />
        </div>

        {/* Bottom Status Bar */}
        <div className={`border-t px-4 py-1.5 flex items-center justify-between text-[11px] font-mono ${statusBg}`}>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[200px]">
              {filename}
            </span>
            <span>&bull;</span>
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            <span>&bull;</span>
            <span>{lineCount} lines</span>
            <span>&bull;</span>
            <span>{words} words</span>
            <span>&bull;</span>
            <span>{chars} chars</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-500">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px]">
              ⌘S Save
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px]">
              ⌘F Find
            </kbd>
          </div>
        </div>
      </div>
    );
  }
);

MarkdownEditor.displayName = "MarkdownEditor";

export default MarkdownEditor;
