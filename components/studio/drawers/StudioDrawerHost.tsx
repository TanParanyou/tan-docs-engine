"use client";

import React from "react";
import DocumentOutline from "../DocumentOutline";
import DocumentSnippets from "../DocumentSnippets";
import FileManagementDrawer from "../FileManagementDrawer";
import WorkspaceSettingsDrawer from "../WorkspaceSettingsDrawer";
import { ActiveTab, FileItem } from "@/lib/store/useStudioStore";
import { DocsConfig } from "@/lib/types";
import { useResponsive } from "@/hooks/useResponsive";
import { X } from "lucide-react";

interface StudioDrawerHostProps {
  activeTab: ActiveTab;
  onClose: () => void;
  // Outline props
  fileContent: string;
  onJumpToHeading: (heading: { text: string; lineNumber: number }) => void;
  // Snippets props
  onInsertSnippet: (snippet: string) => void;
  // Files props
  slug: string;
  files: FileItem[];
  selectedFile: string;
  onSelectFile: (filename: string) => void;
  onCreateFile: (filename: string, initialContent?: string) => Promise<void>;
  onUploadFiles?: (files: { filename: string; content: string }[]) => Promise<void>;
  onRenameFile: (oldName: string, newName: string) => Promise<void>;
  onDeleteFile: (filename: string) => Promise<void>;
  onReorderFiles: (newOrder: string[]) => Promise<void>;
  // Settings props
  config: DocsConfig;
  onUpdateConfig: (partial: Partial<DocsConfig>) => Promise<void>;
}

export default function StudioDrawerHost({
  activeTab,
  onClose,
  fileContent,
  onJumpToHeading,
  onInsertSnippet,
  slug,
  files,
  selectedFile,
  onSelectFile,
  onCreateFile,
  onUploadFiles,
  onRenameFile,
  onDeleteFile,
  onReorderFiles,
  config,
  onUpdateConfig,
}: StudioDrawerHostProps) {
  const { isMobile } = useResponsive();

  if (!activeTab) return null;

  const content = (
    <>
      {activeTab === "outline" && (
        <DocumentOutline content={fileContent} onJumpToHeading={onJumpToHeading} />
      )}
      {activeTab === "snippets" && (
        <DocumentSnippets onInsertSnippet={onInsertSnippet} />
      )}
      {activeTab === "files" && (
        <FileManagementDrawer
          files={files}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          onCreateFile={onCreateFile}
          onUploadFiles={onUploadFiles}
          onRenameFile={onRenameFile}
          onDeleteFile={onDeleteFile}
          onReorderFiles={onReorderFiles}
        />
      )}
      {activeTab === "settings" && (
        <WorkspaceSettingsDrawer
          slug={slug}
          config={config}
          onUpdateConfig={onUpdateConfig}
        />
      )}
    </>
  );

  // Mobile / Small screen: Slide-over Drawer with Backdrop
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Drawer Panel */}
        <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
          <div className="absolute top-2 right-2 z-20">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              title="ปิด"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">{content}</div>
        </div>
      </div>
    );
  }

  // Desktop / Tablet: Inline Side Panel
  return (
    <aside className="w-72 sm:w-80 flex-shrink-0 z-10 transition-all border-r-2 border-theme-border bg-theme-surface overflow-hidden shadow-retro-sm">
      {content}
    </aside>
  );
}
