"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { WorkspaceData, DocsConfig } from "@/lib/types";
import MarkdownEditor from "./MarkdownEditor";
import LivePreview from "./LivePreview";
import FileManagementDrawer from "./FileManagementDrawer";
import WorkspaceSettingsDrawer from "./WorkspaceSettingsDrawer";
import {
  ArrowLeft,
  Save,
  Printer,
  Download,
  Files,
  Settings,
  Columns,
  Maximize2,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

interface StudioLayoutProps {
  initialWorkspace: WorkspaceData;
}

type ViewMode = "split" | "editor" | "preview";
type ActiveTab = "files" | "settings" | null;

export default function StudioLayout({ initialWorkspace }: StudioLayoutProps) {
  const { slug } = initialWorkspace;
  const [config, setConfig] = useState<DocsConfig>(initialWorkspace.config);
  const [files, setFiles] = useState<{ filename: string; title: string }[]>(
    initialWorkspace.files.map((f) => ({ filename: f.filename, title: "" }))
  );
  const [selectedFile, setSelectedFile] = useState<string>(
    initialWorkspace.files[0]?.filename || "01-system-overview.md"
  );
  const [fileContent, setFileContent] = useState<string>(
    initialWorkspace.files[0]?.content || ""
  );
  const [savedContent, setSavedContent] = useState<string>(
    initialWorkspace.files[0]?.content || ""
  );

  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [activeTab, setActiveTab] = useState<ActiveTab>("files");
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const isDirty = fileContent !== savedContent;

  // Refresh files list from server
  const refreshFiles = useCallback(async () => {
    try {
      const res = await fetch(`/api/workspaces/${slug}/files`);
      const json = await res.json();
      if (json.success && json.data) {
        setFiles(json.data.files);
      }
    } catch (err) {
      console.error("Failed to refresh files:", err);
    }
  }, [slug]);

  // Load content of selected file
  const loadFileContent = useCallback(
    async (filename: string) => {
      try {
        const res = await fetch(`/api/workspaces/${slug}/files/${filename}`);
        const json = await res.json();
        if (json.success && json.data) {
          setFileContent(json.data.content);
          setSavedContent(json.data.content);
        }
      } catch (err) {
        console.error("Failed to load file content:", err);
      }
    },
    [slug]
  );

  // Switch selected file
  const handleSelectFile = async (filename: string) => {
    if (filename === selectedFile) return;

    if (isDirty) {
      const confirmSwitch = window.confirm(
        "คุณมีข้อความที่ยังไม่ได้บันทึก ต้องการสลับไฟล์โดยไม่บันทึกหรือไม่?"
      );
      if (!confirmSwitch) return;
    }

    setSelectedFile(filename);
    await loadFileContent(filename);
  };

  // Save current file content
  const handleSaveFile = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/workspaces/${slug}/files/${selectedFile}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: fileContent }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Save failed");
      }

      setSavedContent(fileContent);
      setSaveToast("บันทึกสำเร็จ!");
      setTimeout(() => setSaveToast(null), 2500);
      refreshFiles();
    } catch (err: any) {
      alert(`บันทึกไม่สำเร็จ: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Create file
  const handleCreateFile = async (newFilename: string) => {
    const res = await fetch(`/api/workspaces/${slug}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", filename: newFilename }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Create file failed");
    }
    await refreshFiles();
    setSelectedFile(newFilename);
    await loadFileContent(newFilename);
  };

  // Rename file
  const handleRenameFile = async (oldName: string, newName: string) => {
    const res = await fetch(`/api/workspaces/${slug}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "rename",
        oldFilename: oldName,
        newFilename: newName,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Rename file failed");
    }
    await refreshFiles();
    if (selectedFile === oldName) {
      setSelectedFile(newName);
    }
  };

  // Delete file
  const handleDeleteFile = async (filename: string) => {
    const res = await fetch(`/api/workspaces/${slug}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", filename }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Delete file failed");
    }
    await refreshFiles();

    // If deleted current file, select the first remaining file
    const remaining = files.filter((f) => f.filename !== filename);
    if (remaining.length > 0 && selectedFile === filename) {
      const next = remaining[0].filename;
      setSelectedFile(next);
      await loadFileContent(next);
    }
  };

  // Reorder files
  const handleReorderFiles = async (newOrder: string[]) => {
    const res = await fetch(`/api/workspaces/${slug}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", files: newOrder }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Reorder files failed");
    }
    await refreshFiles();
  };

  // Update Config
  const handleUpdateConfig = async (partialConfig: Partial<DocsConfig>) => {
    const res = await fetch(`/api/workspaces/${slug}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partialConfig),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Update config failed");
    }
    setConfig(json.data);
  };

  // Initial load
  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0 z-30 shadow-md">
        {/* Left: Navigation & Workspace Identity */}
        <div className="flex items-center space-x-3">
          <Link
            href={`/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-md transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Reader View</span>
          </Link>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-slate-100 truncate max-w-xs">
              {config.name}
            </span>
            <span className="text-slate-500 font-mono text-xs">/</span>
            <span className="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/80 px-2 py-0.5 rounded">
              {selectedFile}
            </span>
          </div>

          {/* Dirty / Saved Badge */}
          {isDirty ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800">
              <Clock className="w-3 h-3" />
              Unsaved Changes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800">
              <CheckCircle2 className="w-3 h-3" />
              Saved
            </span>
          )}

          {saveToast && (
            <span className="text-xs font-semibold text-emerald-400 animate-fade-in">
              {saveToast}
            </span>
          )}
        </div>

        {/* Center: View Mode Switcher */}
        <div className="hidden md:flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("editor")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === "editor"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Full Editor Mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === "split"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Split Mode (Editor + Preview)"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === "preview"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Full Preview Mode"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* Drawer Toggle Tabs */}
          <button
            type="button"
            onClick={() =>
              setActiveTab((prev) => (prev === "files" ? null : "files"))
            }
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "files"
                ? "bg-slate-800 text-blue-400 border border-slate-700"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Toggle Files List"
          >
            <Files className="w-4 h-4" />
            <span className="hidden lg:inline">Sections</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab((prev) => (prev === "settings" ? null : "settings"))
            }
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "settings"
                ? "bg-slate-800 text-blue-400 border border-slate-700"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Toggle Document Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden lg:inline">Settings</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveFile}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-1.5 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save (Ctrl+S)"}</span>
          </button>

          {/* Print A4 */}
          <Link
            href={`/${slug}/print`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg shadow-sm transition-colors"
            title="Print A4"
          >
            <Printer className="w-3.5 h-3.5" />
            <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
          </Link>

          {/* Export PDF */}
          <a
            href={`/api/pdf?workspace=${slug}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg shadow-sm transition-colors"
            title="Export PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Drawer (Files or Settings) */}
        {activeTab && (
          <aside className="w-72 flex-shrink-0 z-20 transition-all">
            {activeTab === "files" && (
              <FileManagementDrawer
                files={files}
                selectedFile={selectedFile}
                onSelectFile={handleSelectFile}
                onCreateFile={handleCreateFile}
                onRenameFile={handleRenameFile}
                onDeleteFile={handleDeleteFile}
                onReorderFiles={handleReorderFiles}
              />
            )}
            {activeTab === "settings" && (
              <WorkspaceSettingsDrawer
                slug={slug}
                config={config}
                onUpdateConfig={handleUpdateConfig}
              />
            )}
          </aside>
        )}

        {/* Center/Right: Editor & Live Preview */}
        <main className="flex-1 flex min-w-0 overflow-hidden">
          {/* Markdown Editor */}
          {(viewMode === "split" || viewMode === "editor") && (
            <div
              className={`h-full ${
                viewMode === "split" ? "w-1/2" : "w-full"
              }`}
            >
              <MarkdownEditor
                content={fileContent}
                onChange={setFileContent}
                onSave={handleSaveFile}
                slug={slug}
                filename={selectedFile}
              />
            </div>
          )}

          {/* Live Document Preview */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div
              className={`h-full ${
                viewMode === "split" ? "w-1/2" : "w-full"
              }`}
            >
              <LivePreview
                content={fileContent}
                theme={config.theme}
                title={config.title}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
