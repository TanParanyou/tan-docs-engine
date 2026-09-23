"use client";

import React, { useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Markdown } from "tiptap-markdown";
import VisualToolbar from "./VisualToolbar";

export interface VisualEditorHandle {
  insertSnippet: (snippet: string) => void;
  jumpToHeading: (text: string) => void;
  scrollToPercentage: (percentage: number) => void;
}

interface VisualEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onSave: () => void;
  onUploadImage?: (file: File) => void;
  isUploading?: boolean;
  onScroll?: (scrollPercentage: number) => void;
}

const VisualEditor = forwardRef<VisualEditorHandle, VisualEditorProps>(
  ({ content, onChange, onSave, onUploadImage, isUploading, onScroll }, ref) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isExternalScrollingRef = useRef(false);

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3, 4],
          },
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        Markdown.configure({
          html: true,
          tightLists: true,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: content,
      editorProps: {
        attributes: {
          class:
            "focus:outline-none min-h-[600px] font-sans text-theme-text leading-relaxed max-w-none doc-visual-canvas",
        },
        handleKeyDown: (view, event) => {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            onSave();
            return true;
          }
          return false;
        },
      },
      onUpdate: ({ editor }) => {
        // @ts-expect-error - storage injected by tiptap-markdown
        const markdown = editor.storage.markdown?.getMarkdown();
        if (typeof markdown === "string") {
          onChange(markdown);
        }
      },
    });

    // Synchronize external content changes ONLY when editor is not currently focused by user
    // This prevents cursor resetting, caret bouncing, and scroll locking while actively typing
    useEffect(() => {
      if (!editor) return;
      if (editor.isFocused) return;

      // @ts-expect-error - storage injected by tiptap-markdown
      const currentMarkdown = editor.storage.markdown?.getMarkdown();
      if (content !== currentMarkdown) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }, [content, editor]);

    // Handle user scrolling inside the visual editor
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      if (isExternalScrollingRef.current) return;
      const container = e.currentTarget;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const percentage = maxScroll > 0 ? container.scrollTop / maxScroll : 0;
      if (onScroll) {
        onScroll(percentage);
      }
    };

    // Expose handle methods to parent
    useImperativeHandle(ref, () => ({
      insertSnippet: (snippet: string) => {
        if (!editor) return;
        editor.chain().focus().insertContent(snippet).run();
      },
      jumpToHeading: (text: string) => {
        if (!editor || !scrollContainerRef.current) return;
        editor.commands.focus();
        // Find heading element inside ProseMirror
        const headings = scrollContainerRef.current.querySelectorAll("h1, h2, h3, h4");
        for (const h of Array.from(headings)) {
          if (h.textContent?.trim().toLowerCase().includes(text.trim().toLowerCase())) {
            h.scrollIntoView({ behavior: "smooth", block: "start" });
            break;
          }
        }
      },
      scrollToPercentage: (percentage: number) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        isExternalScrollingRef.current = true;
        const maxScroll = container.scrollHeight - container.clientHeight;
        container.scrollTop = percentage * maxScroll;
        setTimeout(() => {
          isExternalScrollingRef.current = false;
        }, 100);
      },
    }));

    return (
      <div className="flex flex-col h-full bg-theme-surface relative overflow-hidden select-text">
        {/* Visual Formatting Toolbar */}
        <VisualToolbar
          editor={editor}
          onUploadImage={onUploadImage}
          isUploading={isUploading}
        />

        {/* Scrollable Canvas for ProseMirror - Seamless continuous document surface */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-auto bg-theme-surface flex justify-center select-text"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="w-full max-w-4xl min-h-full px-6 sm:px-12 py-8 sm:py-12 pb-64">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    );
  }
);

VisualEditor.displayName = "VisualEditor";

export default VisualEditor;
