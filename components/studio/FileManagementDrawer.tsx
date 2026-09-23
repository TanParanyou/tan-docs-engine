"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Check,
  X,
  Layers,
  BookOpen,
  UploadCloud,
  ClipboardPaste,
  Loader2,
} from "lucide-react";
import {
  SECTION_TEMPLATES,
  SectionTemplate,
  getSectionTemplateById,
} from "@/lib/document-templates";

interface FileItem {
  filename: string;
  title: string;
}

interface FileManagementDrawerProps {
  files: FileItem[];
  selectedFile: string;
  onSelectFile: (filename: string) => void;
  onCreateFile: (filename: string, initialContent?: string) => Promise<void>;
  onUploadFiles?: (files: { filename: string; content: string }[]) => Promise<void>;
  onRenameFile: (oldName: string, newName: string) => Promise<void>;
  onDeleteFile: (filename: string) => Promise<void>;
  onReorderFiles: (files: string[]) => Promise<void>;
}

export default function FileManagementDrawer({
  files,
  selectedFile,
  onSelectFile,
  onCreateFile,
  onUploadFiles,
  onRenameFile,
  onDeleteFile,
  onReorderFiles,
}: FileManagementDrawerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [creationMode, setCreationMode] = useState<"template" | "blank" | "upload" | "paste">("template");
  const [selectedSectionTemplateId, setSelectedSectionTemplateId] = useState<string>(
    SECTION_TEMPLATES[0]?.id || ""
  );
  const [newFilename, setNewFilename] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartCreate = () => {
    setIsCreating(true);
    setCreationMode("template");
    const tpl = SECTION_TEMPLATES[0];
    if (tpl) {
      setSelectedSectionTemplateId(tpl.id);
      const prefix = String(files.length + 1).padStart(2, "0");
      setNewFilename(`${prefix}-${tpl.filename}`);
    } else {
      setNewFilename(`0${files.length + 1}-section.md`);
    }
    setPasteContent("");
    setErrorMessage(null);
  };

  const handleTemplateChange = (tplId: string) => {
    setSelectedSectionTemplateId(tplId);
    const tpl = getSectionTemplateById(tplId);
    if (tpl) {
      const prefix = String(files.length + 1).padStart(2, "0");
      setNewFilename(`${prefix}-${tpl.filename}`);
    }
  };

  const handlePasteChange = (text: string) => {
    setPasteContent(text);
    // If filename has not been customized or is blank, auto-extract heading
    const match = text.match(/^#\s+(.+)$/m);
    if (match && match[1]) {
      const titleSlug = match[1]
        .replace(/[*_`]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      const prefix = String(files.length + 1).padStart(2, "0");
      setNewFilename(`${prefix}-${titleSlug || "notes"}.md`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const incoming = Array.from(e.target.files);
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const readFiles: { filename: string; content: string }[] = [];
      for (const file of incoming) {
        if (!file.name.toLowerCase().endsWith(".md")) continue;
        const text = await file.text();
        readFiles.push({ filename: file.name, content: text });
      }
      if (readFiles.length === 0) {
        setErrorMessage("กรุณาเลือกไฟล์ที่มีนามสกุล .md เท่านั้น");
        return;
      }
      if (onUploadFiles) {
        await onUploadFiles(readFiles);
      } else {
        for (const item of readFiles) {
          await onCreateFile(item.filename, item.content);
        }
      }
      setIsCreating(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload files");
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilename.trim()) return;

    let filename = newFilename.trim();
    if (!filename.endsWith(".md")) {
      filename += ".md";
    }

    let initialContent: string | undefined = undefined;
    if (creationMode === "template") {
      const tpl = getSectionTemplateById(selectedSectionTemplateId);
      if (tpl) {
        initialContent = tpl.content;
      }
    } else if (creationMode === "paste") {
      initialContent = pasteContent || `# ${filename.replace(/\.md$/, "")}\n\n`;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onCreateFile(filename, initialContent);
      setNewFilename("");
      setPasteContent("");
      setIsCreating(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameSubmit = async (oldName: string) => {
    if (!renameValue.trim() || renameValue.trim() === oldName) {
      setEditingFile(null);
      return;
    }

    let targetName = renameValue.trim();
    if (!targetName.endsWith(".md")) {
      targetName += ".md";
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onRenameFile(oldName, targetName);
      setEditingFile(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to rename file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubmit = async (filename: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onDeleteFile(filename);
      setDeletingFile(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= files.length) return;

    const list = files.map((f) => f.filename);
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onReorderFiles(list);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reorder files");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-theme-surface border-r-2 border-theme-border text-theme-text select-none">
      {/* Drawer Header */}
      <div className="px-4 py-3 border-b-2 border-theme-border bg-theme-surface flex items-center justify-between shadow-retro-sm">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-theme-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-theme-text font-mono">
            Document Sections ({files.length})
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (isCreating) {
              setIsCreating(false);
            } else {
              handleStartCreate();
            }
          }}
          className="h-8 w-8 flex items-center justify-center rounded-retro hover:bg-theme-surface-hover text-theme-text border border-theme-border shadow-retro-sm transition-colors cursor-pointer"
          title="Add new Markdown file"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {errorMessage && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-xs flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* New File Inline Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-3 bg-theme-surface-sunken border-b-2 border-theme-border space-y-2.5 shadow-inner"
        >
          {/* 4-Way Mode Switcher */}
          <div className="grid grid-cols-4 gap-1 bg-theme-surface p-1 rounded-retro border border-theme-border text-[10px]">
            <button
              type="button"
              onClick={() => {
                setCreationMode("template");
                handleTemplateChange(selectedSectionTemplateId || SECTION_TEMPLATES[0].id);
              }}
              className={`py-1 px-1 rounded-retro font-medium flex items-center justify-center gap-1 transition-all ${
                creationMode === "template"
                  ? "bg-theme-primary text-theme-primary-text font-bold shadow-retro-sm"
                  : "text-theme-text-muted hover:text-theme-text"
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>แม่แบบ</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCreationMode("blank");
                setNewFilename(`0${files.length + 1}-custom.md`);
              }}
              className={`py-1 px-1 rounded-retro font-medium flex items-center justify-center gap-1 transition-all ${
                creationMode === "blank"
                  ? "bg-theme-primary text-theme-primary-text font-bold shadow-retro-sm"
                  : "text-theme-text-muted hover:text-theme-text"
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>ไฟล์เปล่า</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCreationMode("upload");
              }}
              className={`py-1 px-1 rounded-retro font-medium flex items-center justify-center gap-1 transition-all ${
                creationMode === "upload"
                  ? "bg-theme-primary text-theme-primary-text font-bold shadow-retro-sm"
                  : "text-theme-text-muted hover:text-theme-text"
              }`}
            >
              <UploadCloud className="w-3 h-3" />
              <span>อัปโหลด</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCreationMode("paste");
                setNewFilename(`0${files.length + 1}-notes.md`);
              }}
              className={`py-1 px-1 rounded-retro font-medium flex items-center justify-center gap-1 transition-all ${
                creationMode === "paste"
                  ? "bg-theme-primary text-theme-primary-text font-bold shadow-retro-sm"
                  : "text-theme-text-muted hover:text-theme-text"
              }`}
            >
              <ClipboardPaste className="w-3 h-3" />
              <span>วาง MD</span>
            </button>
          </div>

          {/* Mode 1: Section Template Select */}
          {creationMode === "template" && (
            <div>
              <label className="text-[10px] font-semibold text-theme-text-muted uppercase tracking-wider block mb-1">
                เลือกแม่แบบส่วนงาน (Section Template)
              </label>
              <select
                value={selectedSectionTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-2 py-1.5 bg-theme-surface border border-theme-border rounded-retro text-xs text-theme-text focus:outline-none focus:border-theme-primary shadow-retro-sm"
              >
                {SECTION_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    [{tpl.category}] {tpl.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mode 3: Direct File Upload */}
          {creationMode === "upload" && (
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-theme-text-muted uppercase tracking-wider block">
                เลือกไฟล์ Markdown (.md) จาก NotebookLM:
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-theme-border hover:border-theme-primary bg-theme-surface p-3 rounded-retro cursor-pointer text-center group transition-colors shadow-retro-sm">
                <UploadCloud className="w-6 h-6 text-theme-text-muted group-hover:text-theme-primary mb-1 transition-colors" />
                <span className="text-xs font-medium text-theme-text">คลิกเพื่อเลือกไฟล์ .md</span>
                <span className="text-[10px] text-theme-text-muted">รองรับหลายไฟล์พร้อมกัน</span>
                <input
                  type="file"
                  multiple
                  accept=".md,text/markdown"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Mode 4: Paste Markdown directly */}
          {creationMode === "paste" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-theme-text-muted uppercase tracking-wider block">
                วางข้อความ Markdown จาก NotebookLM:
              </label>
              <textarea
                value={pasteContent}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder="# วางเนื้อหา Markdown จาก NotebookLM ที่นี่..."
                rows={4}
                className="w-full px-2 py-1.5 bg-theme-surface border border-theme-border rounded-retro text-xs font-mono text-theme-text focus:outline-none focus:border-theme-primary resize-y shadow-retro-sm"
              />
            </div>
          )}

          {/* Filename & Submit (for template, blank, and paste) */}
          {creationMode !== "upload" && (
            <div>
              <label className="text-[10.5px] font-semibold text-theme-text-muted block mb-1">
                ชื่อไฟล์ (Filename):
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  placeholder="02-specifications.md"
                  autoFocus
                  className="flex-1 px-2.5 py-1.5 bg-theme-surface border border-theme-border rounded-retro text-xs text-theme-text focus:outline-none focus:border-theme-primary font-mono shadow-retro-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading || !newFilename.trim()}
                  className="p-1.5 bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-theme-primary-text rounded-retro text-xs flex items-center justify-center border border-theme-border shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                  title="สร้างไฟล์"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="p-1.5 hover:bg-theme-surface-hover text-theme-text-muted rounded-retro text-xs border border-theme-border shadow-retro-sm cursor-pointer"
                  title="ยกเลิก"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {files.map((file, idx) => {
          const isSelected = file.filename === selectedFile;
          const isEditing = editingFile === file.filename;
          const isDeleting = deletingFile === file.filename;

          return (
            <div
              key={file.filename}
              className={`group rounded-retro transition-all text-xs border ${
                isSelected
                  ? "bg-theme-accent-light border-theme-accent text-theme-accent-text font-bold shadow-retro-sm"
                  : "border-transparent hover:bg-theme-surface-hover text-theme-text"
              }`}
            >
              {isEditing ? (
                <div className="p-2 flex items-center gap-1">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    autoFocus
                    className="flex-1 px-2 py-1 bg-theme-surface border border-theme-border rounded-retro text-xs text-theme-text focus:outline-none focus:border-theme-primary font-mono shadow-retro-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRenameSubmit(file.filename)}
                    className="p-1 text-theme-success hover:bg-theme-success-light rounded-retro border border-theme-border"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingFile(null)}
                    className="p-1 text-theme-text-muted hover:bg-theme-surface-hover rounded-retro border border-theme-border"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : isDeleting ? (
                <div className="p-2 bg-theme-danger-light border border-theme-danger rounded-retro text-[11px] space-y-1.5 shadow-retro-sm">
                  <span className="text-theme-danger block font-medium">
                    ยืนยันลบไฟล์ {file.filename}?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteSubmit(file.filename)}
                      className="px-2.5 py-0.5 bg-theme-danger hover:bg-theme-danger/90 text-white rounded-retro font-medium shadow-retro-sm border border-theme-border"
                    >
                      ลบ
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingFile(null)}
                      className="px-2.5 py-0.5 bg-theme-surface hover:bg-theme-surface-hover text-theme-text rounded-retro border border-theme-border"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 flex items-center justify-between min-h-[44px]">
                  <button
                    type="button"
                    onClick={() => onSelectFile(file.filename)}
                    className="flex-1 flex items-center gap-2.5 text-left min-w-0 cursor-pointer"
                  >
                    <FileText
                      className={`w-4 h-4 flex-shrink-0 ${
                        isSelected ? "text-theme-accent" : "text-theme-text-muted"
                      }`}
                    />
                    <div className="truncate">
                      <span className="font-mono block truncate font-medium text-xs">
                        {file.filename}
                      </span>
                      {file.title && file.title !== file.filename && (
                        <span className="text-[11px] text-theme-text-muted truncate block">
                          {file.title}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Actions (Move, Rename, Delete) */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      type="button"
                      title="Move Up (เลื่อนขึ้น)"
                      disabled={idx === 0 || isLoading}
                      onClick={() => handleMove(idx, "up")}
                      className="h-7 w-7 flex items-center justify-center hover:bg-theme-surface-sunken rounded-retro text-theme-text-muted hover:text-theme-text disabled:opacity-20 cursor-pointer border border-transparent hover:border-theme-border"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Move Down (เลื่อนลง)"
                      disabled={idx === files.length - 1 || isLoading}
                      onClick={() => handleMove(idx, "down")}
                      className="h-7 w-7 flex items-center justify-center hover:bg-theme-surface-sunken rounded-retro text-theme-text-muted hover:text-theme-text disabled:opacity-20 cursor-pointer border border-transparent hover:border-theme-border"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Rename (เปลี่ยนชื่อ)"
                      onClick={() => {
                        setEditingFile(file.filename);
                        setRenameValue(file.filename);
                      }}
                      className="h-7 w-7 flex items-center justify-center hover:bg-theme-surface-sunken rounded-retro text-theme-text-muted hover:text-theme-text cursor-pointer border border-transparent hover:border-theme-border"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete (ลบไฟล์)"
                      disabled={files.length <= 1}
                      onClick={() => setDeletingFile(file.filename)}
                      className="h-7 w-7 flex items-center justify-center hover:bg-theme-danger-light rounded-retro text-theme-text-muted hover:text-theme-danger disabled:opacity-20 cursor-pointer border border-transparent hover:border-theme-border"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
