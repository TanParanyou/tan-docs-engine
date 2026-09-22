"use client";

import React, { useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { WorkspaceData, DocsConfig } from "@/lib/types";
import { useStudioStore } from "@/lib/store/useStudioStore";
import MarkdownEditor, { MarkdownEditorHandle } from "./MarkdownEditor";
import LivePreview, { LivePreviewHandle } from "./LivePreview";
import FileManagementDrawer from "./FileManagementDrawer";
import WorkspaceSettingsDrawer from "./WorkspaceSettingsDrawer";
import DocumentOutline from "./DocumentOutline";
import DocumentSnippets from "./DocumentSnippets";
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
  ListTree,
  Boxes,
  Loader2,
  SlidersHorizontal,
  ChevronLeft,
} from "lucide-react";

interface StudioLayoutProps {
  initialWorkspace: WorkspaceData;
}

export default function StudioLayout({ initialWorkspace }: StudioLayoutProps) {
  // Access centralized Zustand store
  const {
    slug,
    config,
    files,
    selectedFile,
    fileContent,
    savedContent,
    viewMode,
    activeTab,
    splitRatio,
    syncScroll,
    isSaving,
    saveToast,
    lastSavedTime,
    isExportingPdf,
    initStudio,
    setFileContent,
    setSavedContent,
    setSelectedFile,
    setConfig,
    setFiles,
    setViewMode,
    setActiveTab,
    toggleActiveTab,
    setSplitRatio,
    toggleSyncScroll,
    setIsSaving,
    setSaveToast,
    setLastSavedTime,
    setIsExportingPdf,
  } = useStudioStore();

  const isDirty = fileContent !== savedContent;
  const isDraggingSplitterRef = useRef(false);

  // Component Refs for cross-component imperative actions (jump, scroll, insert)
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const previewRef = useRef<LivePreviewHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Zustand store on mount or workspace change
  useEffect(() => {
    initStudio(initialWorkspace);
  }, [initialWorkspace, initStudio]);

  // Refresh files list from server
  const refreshFiles = useCallback(async () => {
    const currentSlug = slug || initialWorkspace.slug;
    try {
      const res = await fetch(`/api/workspaces/${currentSlug}/files`);
      const json = await res.json();
      if (json.success && json.data) {
        setFiles(json.data.files);
      }
    } catch (err) {
      console.error("Failed to refresh files:", err);
    }
  }, [slug, initialWorkspace.slug, setFiles]);

  // Load content of selected file
  const loadFileContent = useCallback(
    async (filename: string) => {
      const currentSlug = slug || initialWorkspace.slug;
      try {
        const res = await fetch(`/api/workspaces/${currentSlug}/files/${filename}`);
        const json = await res.json();
        if (json.success && json.data) {
          setFileContent(json.data.content);
          setSavedContent(json.data.content);
        }
      } catch (err) {
        console.error("Failed to load file content:", err);
      }
    },
    [slug, initialWorkspace.slug, setFileContent, setSavedContent]
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
    const currentSlug = slug || initialWorkspace.slug;
    if (!selectedFile) return;

    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/workspaces/${currentSlug}/files/${selectedFile}`,
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
      const now = new Date();
      setLastSavedTime(
        `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
      );
      setSaveToast("บันทึกสำเร็จ!");
      setTimeout(() => setSaveToast(null), 2500);
      refreshFiles();
    } catch (err: any) {
      alert(`บันทึกไม่สำเร็จ: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Export PDF with actual progress and download handler
  const handleExportPdf = async () => {
    const currentSlug = slug || initialWorkspace.slug;
    setIsExportingPdf(true);
    try {
      const res = await fetch(`/api/pdf?workspace=${currentSlug}`);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const sanitizedTitle = (config.title || initialWorkspace.config.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      a.download = `${currentSlug}-${sanitizedTitle}-v${config.version || "1.0.0"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการสร้าง PDF: ${err.message}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // File CRUD operations
  const handleCreateFile = async (newFilename: string) => {
    const currentSlug = slug || initialWorkspace.slug;
    const res = await fetch(`/api/workspaces/${currentSlug}/files`, {
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

  const handleRenameFile = async (oldName: string, newName: string) => {
    const currentSlug = slug || initialWorkspace.slug;
    const res = await fetch(`/api/workspaces/${currentSlug}/files`, {
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

  const handleDeleteFile = async (filename: string) => {
    const currentSlug = slug || initialWorkspace.slug;
    const res = await fetch(`/api/workspaces/${currentSlug}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", filename }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Delete file failed");
    }
    await refreshFiles();

    const remaining = files.filter((f) => f.filename !== filename);
    if (remaining.length > 0 && selectedFile === filename) {
      const next = remaining[0].filename;
      setSelectedFile(next);
      await loadFileContent(next);
    }
  };

  const handleReorderFiles = async (newOrder: string[]) => {
    const currentSlug = slug || initialWorkspace.slug;
    const res = await fetch(`/api/workspaces/${currentSlug}/files`, {
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

  const handleUpdateConfig = async (partialConfig: Partial<DocsConfig>) => {
    const currentSlug = slug || initialWorkspace.slug;
    const res = await fetch(`/api/workspaces/${currentSlug}/config`, {
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

  // Jump from Outline to Editor and Preview
  const handleJumpToHeading = (heading: { text: string; lineNumber: number }) => {
    editorRef.current?.jumpToLine(heading.lineNumber);
    previewRef.current?.scrollToHeading(heading.text);
  };

  // Insert Snippet into Editor
  const handleInsertSnippet = (snippet: string) => {
    editorRef.current?.insertSnippet(snippet);
  };

  // Handle Sync Scroll from Editor to Preview
  const handleEditorScroll = (percentage: number) => {
    if (syncScroll) {
      previewRef.current?.scrollToPercentage(percentage);
    }
  };

  // Draggable Splitter mouse event handlers
  const handleMouseDownSplitter = () => {
    isDraggingSplitterRef.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplitterRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      if (newRatio >= 20 && newRatio <= 80) {
        setSplitRatio(Math.round(newRatio));
      }
    };

    const handleMouseUp = () => {
      isDraggingSplitterRef.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setSplitRatio]);

  const activeSlug = slug || initialWorkspace.slug;
  const activeName = config.name || initialWorkspace.config.name;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Application Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0 z-30 shadow-md">
        {/* Left: Brand, Navigation & File Info */}
        <div className="flex items-center space-x-3">
          <Link
            href={`/${activeSlug}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-700/60"
            title="Back to Document Reader"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Reader View</span>
          </Link>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-slate-100 truncate max-w-xs">
              {activeName}
            </span>
            <span className="text-slate-500 font-mono text-xs">/</span>
            <span className="text-xs font-mono text-blue-400 bg-blue-950/70 border border-blue-800/80 px-2 py-0.5 rounded-md font-semibold truncate max-w-[180px]">
              {selectedFile}
            </span>
          </div>

          {/* Dirty / Saved Status Badge */}
          {isDirty ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800 animate-pulse">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Unsaved Changes</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Saved {lastSavedTime ? `(${lastSavedTime})` : ""}</span>
            </span>
          )}

          {saveToast && (
            <span className="text-xs font-semibold text-emerald-400">
              {saveToast}
            </span>
          )}
        </div>

        {/* Center: View Mode & Split Presets */}
        <div className="hidden lg:flex items-center space-x-2">
          {/* View Modes */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
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
              title="Split View Mode"
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

          {/* Split Ratio Presets */}
          {viewMode === "split" && (
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setSplitRatio(35)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  splitRatio === 35
                    ? "bg-slate-800 text-blue-400 font-bold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                title="Preview Focus (35:65)"
              >
                35:65
              </button>
              <button
                type="button"
                onClick={() => setSplitRatio(50)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  splitRatio === 50
                    ? "bg-slate-800 text-blue-400 font-bold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                title="Balanced (50:50)"
              >
                50:50
              </button>
              <button
                type="button"
                onClick={() => setSplitRatio(65)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  splitRatio === 65
                    ? "bg-slate-800 text-blue-400 font-bold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
                title="Editor Focus (65:35)"
              >
                65:35
              </button>
            </div>
          )}

          {/* Sync Scroll Toggle */}
          {viewMode === "split" && (
            <button
              type="button"
              onClick={toggleSyncScroll}
              className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border transition-colors ${
                syncScroll
                  ? "bg-blue-950/60 border-blue-800 text-blue-300"
                  : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
              title="Synchronize scrolling between editor and preview"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Sync Scroll</span>
            </button>
          )}
        </div>

        {/* Right: Actions (Save, Print, Export) */}
        <div className="flex items-center space-x-2">
          {/* Quick Save */}
          <button
            type="button"
            onClick={handleSaveFile}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3.5 py-1.5 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save (⌘S)"}</span>
          </button>

          {/* Print A4 */}
          <Link
            href={`/${activeSlug}/print`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
            title="Open Print A4 View"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Print A4</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
          </Link>

          {/* Export PDF with real loading state */}
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            title="Download PDF via Puppeteer"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Export PDF</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Mini-Rail for Drawer Tabs */}
        <aside className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 space-y-3 flex-shrink-0 z-20">
          <button
            type="button"
            onClick={() => toggleActiveTab("outline")}
            className={`p-2.5 rounded-xl transition-all relative ${
              activeTab === "outline"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Document Outline / Table of Contents"
          >
            <ListTree className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => toggleActiveTab("snippets")}
            className={`p-2.5 rounded-xl transition-all relative ${
              activeTab === "snippets"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Requirement Confirmation Snippets"
          >
            <Boxes className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => toggleActiveTab("files")}
            className={`p-2.5 rounded-xl transition-all relative ${
              activeTab === "files"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Document Files & Sections"
          >
            <Files className="w-4 h-4" />
          </button>

          <div className="w-8 h-px bg-slate-800 my-1" />

          <button
            type="button"
            onClick={() => toggleActiveTab("settings")}
            className={`p-2.5 rounded-xl transition-all relative ${
              activeTab === "settings"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Workspace Settings (docs.config.json)"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="flex-1" />

          {/* Collapse Active Drawer Button */}
          {activeTab && (
            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close Sidebar Panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </aside>

        {/* Expanded Drawer Panel */}
        {activeTab && (
          <aside className="w-72 sm:w-80 flex-shrink-0 z-10 transition-all border-r border-slate-800">
            {activeTab === "outline" && (
              <DocumentOutline
                content={fileContent}
                onJumpToHeading={handleJumpToHeading}
              />
            )}
            {activeTab === "snippets" && (
              <DocumentSnippets onInsertSnippet={handleInsertSnippet} />
            )}
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
                slug={activeSlug}
                config={config}
                onUpdateConfig={handleUpdateConfig}
              />
            )}
          </aside>
        )}

        {/* Center Canvas: Split Editor & Preview */}
        <main
          ref={containerRef}
          className="flex-1 flex min-w-0 overflow-hidden relative"
        >
          {/* Markdown Editor Pane */}
          {(viewMode === "split" || viewMode === "editor") && (
            <div
              style={{
                width: viewMode === "split" ? `${splitRatio}%` : "100%",
              }}
              className="h-full flex flex-col flex-shrink-0 min-w-[280px]"
            >
              <MarkdownEditor
                ref={editorRef}
                content={fileContent}
                onChange={setFileContent}
                onSave={handleSaveFile}
                slug={activeSlug}
                filename={selectedFile}
                onScroll={handleEditorScroll}
                syncScroll={syncScroll}
              />
            </div>
          )}

          {/* Draggable Splitter Divider */}
          {viewMode === "split" && (
            <div
              onMouseDown={handleMouseDownSplitter}
              className="w-1.5 hover:w-2 bg-slate-300 dark:bg-slate-800 hover:bg-blue-500 cursor-col-resize transition-all z-20 flex items-center justify-center relative group select-none"
              title="Drag to resize Editor and Preview"
            >
              <div className="w-0.5 h-6 bg-slate-400 group-hover:bg-white rounded-full transition-colors" />
            </div>
          )}

          {/* Live Document Preview Pane */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div
              style={{
                width: viewMode === "split" ? `${100 - splitRatio}%` : "100%",
              }}
              className="h-full flex flex-col flex-1 min-w-[320px]"
            >
              <LivePreview
                ref={previewRef}
                content={fileContent}
                theme={config.theme}
                title={config.title}
                documentNumber={config.documentNumber}
                version={config.version}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
