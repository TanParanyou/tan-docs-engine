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
} from "lucide-react";

interface FileItem {
  filename: string;
  title: string;
}

interface FileManagementDrawerProps {
  files: FileItem[];
  selectedFile: string;
  onSelectFile: (filename: string) => void;
  onCreateFile: (filename: string) => Promise<void>;
  onRenameFile: (oldName: string, newName: string) => Promise<void>;
  onDeleteFile: (filename: string) => Promise<void>;
  onReorderFiles: (files: string[]) => Promise<void>;
}

export default function FileManagementDrawer({
  files,
  selectedFile,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onReorderFiles,
}: FileManagementDrawerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFilename, setNewFilename] = useState("");
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilename.trim()) return;

    let filename = newFilename.trim();
    if (!filename.endsWith(".md")) {
      filename += ".md";
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onCreateFile(filename);
      setNewFilename("");
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
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200">
      {/* Drawer Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Document Sections ({files.length})
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsCreating(!isCreating);
            setNewFilename("");
            setErrorMessage(null);
          }}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Add new Markdown file"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {errorMessage && (
        <div className="px-4 py-2 bg-red-950/80 border-b border-red-800 text-red-200 text-xs flex justify-between items-center">
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
          className="p-3 bg-slate-800/80 border-b border-slate-700 space-y-2"
        >
          <label className="text-[11px] font-medium text-slate-400 block">
            ชื่อไฟล์ใหม่ (e.g. 03-api-endpoints.md)
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={newFilename}
              onChange={(e) => setNewFilename(e.target.value)}
              placeholder="02-specifications.md"
              autoFocus
              className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              type="submit"
              disabled={isLoading || !newFilename.trim()}
              className="p-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1.5 hover:bg-slate-700 text-slate-400 rounded text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
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
              className={`group rounded-lg transition-all text-xs border ${
                isSelected
                  ? "bg-slate-800 border-blue-500/50 text-white"
                  : "border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
              }`}
            >
              {isEditing ? (
                <div className="p-2 flex items-center gap-1">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    autoFocus
                    className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRenameSubmit(file.filename)}
                    className="p-1 text-emerald-400 hover:bg-slate-700 rounded"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingFile(null)}
                    className="p-1 text-slate-400 hover:bg-slate-700 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : isDeleting ? (
                <div className="p-2 bg-red-950/50 border border-red-800 rounded text-[11px] space-y-1.5">
                  <span className="text-red-200 block">
                    ยืนยันลบไฟล์ {file.filename}?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteSubmit(file.filename)}
                      className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded font-medium"
                    >
                      ลบ
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingFile(null)}
                      className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onSelectFile(file.filename)}
                    className="flex-1 flex items-center gap-2 text-left min-w-0"
                  >
                    <FileText
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        isSelected ? "text-blue-400" : "text-slate-500"
                      }`}
                    />
                    <div className="truncate">
                      <span className="font-mono block truncate">
                        {file.filename}
                      </span>
                      {file.title && file.title !== file.filename && (
                        <span className="text-[10px] text-slate-500 truncate block">
                          {file.title}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Actions (Move, Rename, Delete) */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                    <button
                      type="button"
                      title="Move Up"
                      disabled={idx === 0 || isLoading}
                      onClick={() => handleMove(idx, "up")}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Move Down"
                      disabled={idx === files.length - 1 || isLoading}
                      onClick={() => handleMove(idx, "down")}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Rename"
                      onClick={() => {
                        setEditingFile(file.filename);
                        setRenameValue(file.filename);
                      }}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      disabled={files.length <= 1}
                      onClick={() => setDeletingFile(file.filename)}
                      className="p-1 hover:bg-red-900/50 rounded text-slate-400 hover:text-red-400 disabled:opacity-20"
                    >
                      <Trash2 className="w-3 h-3" />
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
