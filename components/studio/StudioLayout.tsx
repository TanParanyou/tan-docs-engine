"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
import { WorkspaceData, DocsConfig } from "@/lib/types";
import { useStudioStore } from "@/lib/store/useStudioStore";
import { useResponsive } from "@/hooks/useResponsive";
import MarkdownEditor, { MarkdownEditorHandle } from "./MarkdownEditor";
import LivePreview, { LivePreviewHandle } from "./LivePreview";
import StudioHeader from "./header/StudioHeader";
import StudioRail from "./navigation/StudioRail";
import StudioDrawerHost from "./drawers/StudioDrawerHost";
import { ExportFormat } from "@/components/common/ExportDropdown";

interface StudioLayoutProps {
  initialWorkspace: WorkspaceData;
}

export default function StudioLayout({ initialWorkspace }: StudioLayoutProps) {
  const { isMobile, isTablet, isMounted } = useResponsive();

  // Centralized Zustand store
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
  const isScrollingFromEditorRef = useRef(false);
  const isScrollingFromPreviewRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active search query propagated across Editor and Preview
  const [searchQuery, setSearchQuery] = useState("");

  // Cross-component imperative handles
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const previewRef = useRef<LivePreviewHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-switch away from split view on mobile & tablet screens to prevent cramped UI
  useEffect(() => {
    if (isMounted && (isMobile || isTablet) && viewMode === "split") {
      setViewMode("editor");
    }
  }, [isMounted, isMobile, isTablet, viewMode, setViewMode]);

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

  // Unified Export Handler (PDF, DOCX, Excel, Markdown)
  const handleExport = async (format: ExportFormat) => {
    const currentSlug = slug || initialWorkspace.slug;
    setIsExportingPdf(true);
    try {
      if (format === "current-md") {
        // Direct download of current editor content
        const blob = new Blob([fileContent], { type: "text/markdown;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentSlug}-${selectedFile}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }

      let endpoint = `/api/${format}?workspace=${currentSlug}`;
      let fallbackExt = `.${format === "excel" ? "xlsx" : format}`;

      const res = await fetch(endpoint);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to generate ${format.toUpperCase()}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      let filename = "";
      const disposition = res.headers.get("Content-Disposition");
      if (disposition) {
        const utf8Match = disposition.match(/filename\*=(?:UTF-8''|utf-8'')([^;]+)/i);
        if (utf8Match && utf8Match[1]) {
          try {
            filename = decodeURIComponent(utf8Match[1].trim().replace(/^["']|["']$/g, ""));
          } catch {
            // fallback
          }
        } else {
          const match = disposition.match(/filename="?([^";]+)"?/i);
          if (match && match[1]) {
            filename = match[1].trim();
          }
        }
      }

      if (!filename) {
        const sanitizedTitle = (config.title || initialWorkspace.config.title)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
        filename = `${currentSlug}-${sanitizedTitle}-v${config.version || "1.0.0"}${fallbackExt}`;
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการส่งออกไฟล์: ${err.message}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // File CRUD operations
  const handleCreateFile = async (newFilename: string, initialContent?: string) => {
    const currentSlug = slug || initialWorkspace.slug;
    const res = await fetch(`/api/workspaces/${currentSlug}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", filename: newFilename, initialContent }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Create file failed");
    }
    await refreshFiles();
    const actualFilename = json.createdFilename || newFilename;
    setSelectedFile(actualFilename);
    await loadFileContent(actualFilename);
  };

  const handleUploadFiles = async (uploadedFiles: { filename: string; content: string }[]) => {
    const currentSlug = slug || initialWorkspace.slug;
    const res = await fetch(`/api/workspaces/${currentSlug}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upload", files: uploadedFiles }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Upload files failed");
    }
    await refreshFiles();
    if (json.createdFilename) {
      setSelectedFile(json.createdFilename);
      await loadFileContent(json.createdFilename);
    }
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
    if (!syncScroll || isScrollingFromPreviewRef.current) return;
    isScrollingFromEditorRef.current = true;
    previewRef.current?.scrollToPercentage(percentage);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingFromEditorRef.current = false;
    }, 150);
  };

  // Handle Sync Scroll from Preview to Editor
  const handlePreviewScroll = (percentage: number) => {
    if (!syncScroll || isScrollingFromEditorRef.current) return;
    isScrollingFromPreviewRef.current = true;
    editorRef.current?.scrollToPercentage?.(percentage);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingFromPreviewRef.current = false;
    }, 150);
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
  const primaryColor = config.theme?.primaryColor || initialWorkspace.config.theme?.primaryColor || "#0f2b48";
  const accentColor = config.theme?.accentColor || initialWorkspace.config.theme?.accentColor || "#2563eb";

  return (
    <div
      className="h-screen flex flex-col bg-theme-bg text-theme-text overflow-hidden font-sans"
      style={
        {
          "--primary-color": primaryColor,
          "--accent-color": accentColor,
        } as React.CSSProperties
      }
    >
      {/* Studio Global Header */}
      <StudioHeader
        slug={activeSlug}
        workspaceName={activeName}
        selectedFile={selectedFile}
        isDirty={isDirty}
        lastSavedTime={lastSavedTime}
        saveToast={saveToast}
        viewMode={viewMode}
        splitRatio={splitRatio}
        syncScroll={syncScroll}
        isSaving={isSaving}
        isExportingPdf={isExportingPdf}
        onSave={handleSaveFile}
        onExport={handleExport}
        onExportPdf={() => handleExport("pdf")}
        onViewModeChange={setViewMode}
        onSplitRatioChange={setSplitRatio}
        onToggleSyncScroll={toggleSyncScroll}
        onToggleMobileDrawer={() => toggleActiveTab("files")}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Mini-Rail Navigation */}
        <StudioRail
          activeTab={activeTab}
          onToggleTab={toggleActiveTab}
          onCollapse={() => setActiveTab(null)}
        />

        {/* Drawer Host (Inline on Desktop, Slide-out Overlay on Mobile) */}
        <StudioDrawerHost
          activeTab={activeTab}
          onClose={() => setActiveTab(null)}
          fileContent={fileContent}
          onJumpToHeading={handleJumpToHeading}
          onInsertSnippet={handleInsertSnippet}
          slug={activeSlug}
          files={files}
          selectedFile={selectedFile}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onUploadFiles={handleUploadFiles}
          onRenameFile={handleRenameFile}
          onDeleteFile={handleDeleteFile}
          onReorderFiles={handleReorderFiles}
          config={config}
          onUpdateConfig={handleUpdateConfig}
        />

        {/* Main Work Area: Dual Pane Canvas */}
        <main
          ref={containerRef}
          className="flex-1 flex min-w-0 overflow-hidden relative"
        >
          {/* Dual-Mode Editor Pane (Visual / Markdown) */}
          {(viewMode === "split" || viewMode === "editor") && (
            <div
              style={{
                width: viewMode === "split" && !isMobile ? `${splitRatio}%` : "100%",
              }}
              className="h-full flex flex-col flex-shrink-0 min-w-0"
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
                onSearchQueryChange={setSearchQuery}
              />
            </div>
          )}

          {/* Draggable Splitter Divider (Desktop Split Mode only) */}
          {viewMode === "split" && !isMobile && (
            <div
              onMouseDown={handleMouseDownSplitter}
              className="w-2 hover:w-2.5 bg-theme-surface-sunken hover:bg-theme-primary cursor-col-resize transition-all z-20 flex items-center justify-center relative group select-none border-x border-theme-border"
              title="Drag to resize Editor and Preview"
            >
              <div className="w-0.5 h-6 bg-theme-border group-hover:bg-theme-primary-text rounded-none transition-colors" />
            </div>
          )}

          {/* Live Document Preview Pane */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div
              style={{
                width:
                  viewMode === "split" && !isMobile
                    ? `${100 - splitRatio}%`
                    : "100%",
              }}
              className="h-full flex flex-col flex-1 min-w-0"
            >
              <LivePreview
                ref={previewRef}
                content={fileContent}
                theme={config.theme}
                title={config.title}
                documentNumber={config.documentNumber}
                version={config.version}
                slug={activeSlug}
                onScroll={handlePreviewScroll}
                searchQuery={searchQuery}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
