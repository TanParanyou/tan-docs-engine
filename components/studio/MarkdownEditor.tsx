"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import EditorToolbar from "./EditorToolbar";
import EditorSearch from "./EditorSearch";
import VisualEditor, { VisualEditorHandle } from "./VisualEditor";
import { useStudioStore } from "@/lib/store/useStudioStore";
import EditorModeSwitcher from "./editor/EditorModeSwitcher";
import EditorStatusBar from "./editor/EditorStatusBar";
import { useMarkdownHistory } from "@/hooks/useMarkdownHistory";
import { formatMarkdownTables } from "@/lib/markdown-table-formatter";
import { AlertTriangle } from "lucide-react";

export interface MarkdownEditorHandle {
  jumpToLine: (lineNumber: number) => void;
  insertSnippet: (snippet: string) => void;
  scrollToPercentage?: (percentage: number) => void;
}

interface MarkdownEditorProps {
  content: string;
  onChange: (value: string) => void;
  onSave: () => void;
  slug: string;
  filename: string;
  onScroll?: (scrollPercentage: number) => void;
  syncScroll?: boolean;
  onSearchQueryChange?: (query: string) => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  (
    {
      content,
      onChange,
      onSave,
      slug,
      filename,
      onScroll,
      syncScroll,
      onSearchQueryChange,
    },
    ref
  ) => {
    const { inputMode, setInputMode, savedContent } = useStudioStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineGutterRef = useRef<HTMLDivElement>(null);
    const highlightBackdropRef = useRef<HTMLDivElement>(null);
    const visualEditorRef = useRef<VisualEditorHandle>(null);
    const [editorTheme, setEditorTheme] = useState<"light" | "dark">("light");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

    // Safety Confirmation Modal สำหรับการ Revert to Saved
    const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);

    // Search state
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeSearchQuery, setActiveSearchQuery] = useState("");
    const [activeMatchCase, setActiveMatchCase] = useState(false);
    const [searchMatches, setSearchMatches] = useState<number[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

    // Cursor position
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

    // History Manager (Undo / Redo with per-file cache and coalescing)
    const history = useMarkdownHistory({
      filename,
      initialContent: content,
      onChange: (newContent) => {
        onChange(newContent);
      },
    });

    const isDirty = content !== savedContent;

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

          // Scroll to line smoothly
          const totalLines = Math.max(1, lines.length);
          const percentage = Math.max(0, (lineNumber - 2) / totalLines);
          textarea.scrollTop =
            percentage * (textarea.scrollHeight - textarea.clientHeight);

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
      scrollToPercentage: (percentage: number) => {
        if (inputMode === "visual") {
          visualEditorRef.current?.scrollToPercentage(percentage);
        } else {
          const textarea = textareaRef.current;
          if (textarea) {
            const maxScroll = textarea.scrollHeight - textarea.clientHeight;
            textarea.scrollTop = percentage * maxScroll;
          }
        }
      },
    }));

    // Update cursor position
    const handleSelectOrClick = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const textBefore = textarea.value.substring(0, textarea.selectionStart);
      const lines = textBefore.split("\n");
      const currentLine = lines.length;
      const currentCol = lines[lines.length - 1].length + 1;
      setCursorPos({ line: currentLine, col: currentCol });
    }, []);

    // Helper to insert markdown text at current cursor selection with immediate history snapshot
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

        const newCursorPosition = start + before.length + textToInsert.length;

        // Push immediate snapshot to history
        history.pushChange(
          newContent,
          { start: newCursorPosition, end: newCursorPosition },
          true
        );

        onChange(newContent);

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(
              newCursorPosition,
              newCursorPosition
            );
            handleSelectOrClick();
          }
        }, 0);
      },
      [history, onChange, handleSelectOrClick]
    );

    // จัดแนวตาราง Markdown อัตโนมัติ (Prettify Tables)
    const handlePrettifyTables = useCallback(() => {
      const formatted = formatMarkdownTables(content);
      if (formatted !== content) {
        const textarea = textareaRef.current;
        const start = textarea?.selectionStart || 0;
        const end = textarea?.selectionEnd || 0;

        history.pushChange(formatted, { start, end }, true);
        onChange(formatted);
      }
    }, [content, history, onChange]);

    // จัดการ Undo พร้อมคืนค่า Selection Range
    const handleUndo = useCallback(() => {
      const restored = history.undo();
      if (restored) {
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(
              restored.selectionStart,
              restored.selectionEnd
            );
            handleSelectOrClick();
          }
        }, 0);
      }
    }, [history, handleSelectOrClick]);

    // จัดการ Redo พร้อมคืนค่า Selection Range
    const handleRedo = useCallback(() => {
      const restored = history.redo();
      if (restored) {
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(
              restored.selectionStart,
              restored.selectionEnd
            );
            handleSelectOrClick();
          }
        }, 0);
      }
    }, [history, handleSelectOrClick]);

    // คืนค่าสู่เวอร์ชันที่บันทึกไว้ (Revert to Saved)
    const handleConfirmRevert = useCallback(() => {
      history.resetHistory(savedContent);
      onChange(savedContent);
      setIsRevertModalOpen(false);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(0, 0);
          handleSelectOrClick();
        }
      }, 0);
    }, [history, onChange, savedContent, handleSelectOrClick]);

    // Textarea Content Change Listener พร้อม Debounced History Push
    const handleTextareaChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      const newText = e.target.value;
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;

      history.pushChange(newText, { start, end }, false);
      onChange(newText);
      handleSelectOrClick();
    };

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
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        console.error("Upload error:", errorMessage);
        setUploadStatus(`อัปโหลดล้มเหลว: ${errorMessage}`);
        setTimeout(() => setUploadStatus(null), 4000);
      } finally {
        setIsUploading(false);
      }
    };

    // Keyboard shortcut listener
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Undo / Redo Shortcuts: Cmd+Z, Cmd+Shift+Z, Cmd+Y
      if (isCmdOrCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }

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
            history.pushChange(
              newContent,
              { start: start - 2, end: start - 2 },
              true
            );
            onChange(newContent);
            setTimeout(() => {
              if (textareaRef.current) {
                textareaRef.current.selectionStart =
                  textareaRef.current.selectionEnd = start - 2;
                handleSelectOrClick();
              }
            }, 0);
          }
        } else {
          // Indent 2 spaces
          const newContent =
            textarea.value.substring(0, start) +
            "  " +
            textarea.value.substring(end);
          history.pushChange(
            newContent,
            { start: start + 2, end: start + 2 },
            true
          );
          onChange(newContent);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart =
                textareaRef.current.selectionEnd = start + 2;
              handleSelectOrClick();
            }
          }, 0);
        }
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

    // Synchronize scrolling with preview, line numbers gutter, and highlight backdrop
    const handleScroll = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Sync gutter scroll
      if (lineGutterRef.current) {
        lineGutterRef.current.scrollTop = textarea.scrollTop;
      }

      // Sync highlight backdrop scroll
      if (highlightBackdropRef.current) {
        highlightBackdropRef.current.scrollTop = textarea.scrollTop;
      }

      if (syncScroll && onScroll) {
        const maxScroll = textarea.scrollHeight - textarea.clientHeight;
        if (maxScroll > 0) {
          const percentage = textarea.scrollTop / maxScroll;
          onScroll(percentage);
        }
      }
    };

    // Render Search Match Highlights inside Backdrop Layer
    const renderHighlightedContent = () => {
      if (!activeSearchQuery || !isSearchOpen) {
        return content;
      }

      try {
        const escaped = activeSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escaped})`, activeMatchCase ? "g" : "gi");
        const parts = content.split(regex);
        let matchCount = 0;

        return parts.map((part, index) => {
          const isMatch = activeMatchCase
            ? part === activeSearchQuery
            : part.toLowerCase() === activeSearchQuery.toLowerCase();

          if (isMatch) {
            const isCurrent = matchCount === currentMatchIndex;
            matchCount++;
            return (
              <mark
                key={index}
                className={`rounded-xs text-transparent font-mono inline ${
                  isCurrent
                    ? "bg-amber-400 dark:bg-amber-400 ring-2 ring-amber-600 shadow-sm"
                    : "bg-yellow-300/60 dark:bg-yellow-400/50"
                }`}
              >
                {part}
              </mark>
            );
          }
          return <span key={index}>{part}</span>;
        });
      } catch {
        return content;
      }
    };

    // Global Key Listener for Cmd+F / Ctrl+F across entire editor
    useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        const isCmdOrCtrl = e.metaKey || e.ctrlKey;
        if (isCmdOrCtrl && e.key.toLowerCase() === "f") {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      };

      window.addEventListener("keydown", handleGlobalKeyDown);
      return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, []);

    // Search Operations: Calculate matches without stealing focus from input
    const handleSearchChange = (query: string, matchCase: boolean) => {
      setActiveSearchQuery(query);
      setActiveMatchCase(matchCase);
      onSearchQueryChange?.(query);

      if (!query.trim()) {
        setSearchMatches([]);
        setCurrentMatchIndex(0);
        return;
      }

      const text = content;
      const flags = matchCase ? "g" : "gi";
      try {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escapedQuery, flags);
        const matches: number[] = [];
        let m: RegExpExecArray | null;

        while ((m = regex.exec(text)) !== null) {
          matches.push(m.index);
        }

        setSearchMatches(matches);
        setCurrentMatchIndex(0);
      } catch {
        setSearchMatches([]);
      }
    };

    const scrollTextareaToMatch = (
      textarea: HTMLTextAreaElement,
      matchPos: number,
      queryLength: number
    ) => {
      const text = textarea.value;
      const textBefore = text.substring(0, matchPos);
      const lines = textBefore.split("\n");
      const lineNumber = lines.length;
      const totalLines = Math.max(1, text.split("\n").length);
      const lineHeight = textarea.scrollHeight / totalLines;
      const targetScrollTop = (lineNumber - 1) * lineHeight;
      const viewportHeight = textarea.clientHeight;

      if (
        targetScrollTop < textarea.scrollTop + 40 ||
        targetScrollTop > textarea.scrollTop + viewportHeight - 80
      ) {
        textarea.scrollTop = Math.max(0, targetScrollTop - viewportHeight / 3);
      }

      textarea.setSelectionRange(matchPos, matchPos + queryLength);
      setCursorPos({
        line: lineNumber,
        col: lines[lines.length - 1].length + 1,
      });

      if (syncScroll && onScroll) {
        const maxScroll = textarea.scrollHeight - textarea.clientHeight;
        if (maxScroll > 0) {
          onScroll(textarea.scrollTop / maxScroll);
        }
      }
    };

    const handleFindNext = (query: string, matchCase: boolean) => {
      if (!query) return;

      if (inputMode === "visual") {
        const found = visualEditorRef.current?.findText(query, matchCase, "next");
        if (found && searchMatches.length > 0) {
          setCurrentMatchIndex((prev) => (prev + 1) % searchMatches.length);
        }
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
        scrollTextareaToMatch(textarea, matchPos, query.length);
      }
    };

    const handleFindPrev = (query: string, matchCase: boolean) => {
      if (!query) return;

      if (inputMode === "visual") {
        const found = visualEditorRef.current?.findText(query, matchCase, "prev");
        if (found && searchMatches.length > 0) {
          setCurrentMatchIndex(
            (prev) => (prev - 1 + searchMatches.length) % searchMatches.length
          );
        }
        return;
      }

      const textarea = textareaRef.current;
      if (!textarea || searchMatches.length === 0) return;

      const prevIndex =
        (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
      setCurrentMatchIndex(prevIndex);

      const matchPos = searchMatches[prevIndex];
      scrollTextareaToMatch(textarea, matchPos, query.length);
    };

    const handleReplace = (
      query: string,
      replacement: string,
      matchCase: boolean
    ) => {
      if (!query) return;
      const textarea = textareaRef.current;

      if (inputMode === "markdown" && textarea) {
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
          history.pushChange(
            newContent,
            {
              start: start + replacement.length,
              end: start + replacement.length,
            },
            true
          );
          onChange(newContent);
          setTimeout(() => {
            handleFindNext(query, matchCase);
          }, 0);
        } else {
          handleFindNext(query, matchCase);
        }
      } else {
        // Visual or direct content replace
        const flags = matchCase ? "" : "i";
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escapedQuery, flags);
        const newContent = content.replace(regex, replacement);
        onChange(newContent);
        setTimeout(() => {
          handleSearchChange(query, matchCase);
        }, 50);
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
      if (inputMode === "markdown") {
        history.pushChange(newContent, { start: 0, end: 0 }, true);
      }
      onChange(newContent);
      setSearchMatches([]);
      setCurrentMatchIndex(0);
    };

    // Calculate document statistics
    const lineCount = content ? content.split("\n").length : 1;
    const words = content
      ? content.trim().split(/\s+/).filter(Boolean).length
      : 0;
    const chars = content.length;

    const isLight = editorTheme === "light";
    const editorBg = isLight
      ? "bg-theme-surface text-theme-text"
      : "bg-slate-900 text-slate-100";

    return (
      <div
        className={`flex flex-col h-full ${editorBg} border-r border-theme-border relative transition-colors`}
      >
        {/* Editor Mode Header */}
        <EditorModeSwitcher inputMode={inputMode} onChange={setInputMode} />

        {/* In-Editor Search Overlay (Works across both Visual and Markdown modes) */}
        <EditorSearch
          isOpen={isSearchOpen}
          onClose={() => {
            setIsSearchOpen(false);
            setActiveSearchQuery("");
            onSearchQueryChange?.("");
          }}
          content={content}
          onSearchChange={handleSearchChange}
          onFindNext={handleFindNext}
          onFindPrev={handleFindPrev}
          onReplace={handleReplace}
          onReplaceAll={handleReplaceAll}
          currentMatchIndex={currentMatchIndex}
          totalMatches={searchMatches.length}
        />

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
              onScroll={(pct) => {
                if (syncScroll && onScroll) {
                  onScroll(pct);
                }
              }}
              onOpenSearch={() => setIsSearchOpen(true)}
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
              canUndo={history.canUndo}
              canRedo={history.canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onPrettifyTables={handlePrettifyTables}
              isDirty={isDirty}
              onRevert={() => setIsRevertModalOpen(true)}
            />

            {uploadStatus && (
              <div className="bg-theme-accent-light border-b border-theme-accent/40 px-4 py-1 text-xs text-theme-accent-text flex items-center justify-between">
                <span>{uploadStatus}</span>
              </div>
            )}

            {/* Main Editor Textarea with Synchronized Line Numbers Gutter */}
            <div className="relative flex-1 flex overflow-hidden bg-theme-surface">
              {/* Line Numbers Gutter */}
              <div
                ref={lineGutterRef}
                className="w-11 sm:w-13 border-r border-theme-border-subtle bg-theme-surface-sunken/40 select-none py-6 sm:py-8 font-mono text-[12px] leading-relaxed text-right pr-2 text-theme-text-muted/60 overflow-hidden flex-shrink-0"
              >
                {Array.from({ length: lineCount }).map((_, i) => {
                  const lineNum = i + 1;
                  const isCurrent = lineNum === cursorPos.line;
                  return (
                    <div
                      key={lineNum}
                      className={
                        isCurrent
                          ? "text-theme-primary font-bold bg-theme-primary/10 -mr-2 pr-2"
                          : ""
                      }
                    >
                      {lineNum}
                    </div>
                  );
                })}
              </div>

              {/* Editor Workspace with Synchronized Highlight Backdrop */}
              <div className="relative flex-1 h-full overflow-hidden bg-theme-surface">
                {/* Search Matches Highlight Backdrop */}
                {activeSearchQuery && isSearchOpen && (
                  <div
                    ref={highlightBackdropRef}
                    aria-hidden="true"
                    className="absolute inset-0 p-6 sm:p-8 font-mono text-[13.5px] leading-relaxed whitespace-pre-wrap break-words pointer-events-none overflow-hidden select-none z-0"
                    style={{
                      wordBreak: "break-word",
                      color: "transparent",
                    }}
                  >
                    {renderHighlightedContent()}
                  </div>
                )}

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleSelectOrClick}
                  onClick={handleSelectOrClick}
                  onScroll={handleScroll}
                  onPaste={handlePaste}
                  onDrop={handleDrop}
                  placeholder="เริ่มเขียนเอกสาร Markdown ที่นี่..."
                  className={`w-full h-full p-6 sm:p-8 font-mono text-[13.5px] leading-relaxed resize-none overflow-y-auto focus:outline-none selection:bg-theme-primary/30 selection:text-current ${
                    activeSearchQuery && isSearchOpen
                      ? "bg-transparent relative z-10"
                      : "bg-theme-surface"
                  } text-theme-text`}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Status Bar */}
        <EditorStatusBar
          filename={filename}
          cursorLine={cursorPos.line}
          cursorCol={cursorPos.col}
          lineCount={lineCount}
          words={words}
          chars={chars}
          isLight={isLight}
          undoCount={history.undoCount}
          redoCount={history.redoCount}
        />

        {/* Safety Confirmation Modal: Revert to Saved */}
        {isRevertModalOpen && (
          <div className="fixed inset-0 z-50 bg-theme-text/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-theme-surface border-2 border-theme-border shadow-retro p-6 rounded-retro">
              <div className="flex items-center gap-3 text-theme-warning mb-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <h3 className="font-bold text-base text-theme-text font-sans">
                  ยืนยันการคืนค่าต้นฉบับ (Revert Changes)?
                </h3>
              </div>
              <p className="text-sm text-theme-text-muted mb-6 leading-relaxed">
                การกระทำนี้จะย้อนกลับเนื้อหาทั้งหมดของไฟล์{" "}
                <span className="font-mono font-bold text-theme-text">
                  {filename}
                </span>{" "}
                สู่เวอร์ชันล่าสุดที่เคยบันทึกไว้ การเปลี่ยนแปลงที่ยังไม่ได้บันทึกจะสูญหาย
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRevertModalOpen(false)}
                  className="px-4 py-2 bg-theme-surface hover:bg-theme-surface-hover text-theme-text border border-theme-border rounded-retro text-xs font-semibold shadow-retro-sm transition-all cursor-pointer active:translate-x-[0.5px] active:translate-y-[0.5px]"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRevert}
                  className="px-4 py-2 bg-theme-danger text-white hover:bg-theme-danger/90 border border-theme-border rounded-retro text-xs font-bold shadow-retro-sm transition-all cursor-pointer active:translate-x-[0.5px] active:translate-y-[0.5px]"
                >
                  ยืนยันคืนค่าเดิม
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

MarkdownEditor.displayName = "MarkdownEditor";

export default MarkdownEditor;
