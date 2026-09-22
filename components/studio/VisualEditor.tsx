"use client";

import React, { useEffect, useImperativeHandle, forwardRef } from "react";
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
}

interface VisualEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onSave: () => void;
  onUploadImage?: (file: File) => void;
  isUploading?: boolean;
}

const VisualEditor = forwardRef<VisualEditorHandle, VisualEditorProps>(
  ({ content, onChange, onSave, onUploadImage, isUploading }, ref) => {
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
            "focus:outline-none min-h-[500px] p-6 sm:p-10 font-sans text-slate-800 leading-relaxed max-w-none doc-visual-canvas",
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

    // Synchronize external content changes (e.g., when switching file or switching from raw markdown)
    useEffect(() => {
      if (!editor) return;
      // @ts-expect-error - storage injected by tiptap-markdown
      const currentMarkdown = editor.storage.markdown?.getMarkdown();
      if (content !== currentMarkdown) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }, [content, editor]);

    // Expose handle methods to parent
    useImperativeHandle(ref, () => ({
      insertSnippet: (snippet: string) => {
        if (!editor) return;
        // Insert as markdown or raw text
        editor.chain().focus().insertContent(snippet).run();
      },
      jumpToHeading: (text: string) => {
        // Smoothly scroll or find text
        if (!editor) return;
        editor.commands.focus();
      },
    }));

    return (
      <div className="flex flex-col h-full bg-white relative overflow-hidden select-text">
        {/* Visual Formatting Toolbar */}
        <VisualToolbar
          editor={editor}
          onUploadImage={onUploadImage}
          isUploading={isUploading}
        />

        {/* Scrollable Canvas for ProseMirror */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 flex justify-center p-4 sm:p-8">
          <div className="w-full max-w-4xl bg-white border border-slate-200/90 shadow-sm rounded-xl min-h-[600px] overflow-hidden">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    );
  }
);

VisualEditor.displayName = "VisualEditor";

export default VisualEditor;
