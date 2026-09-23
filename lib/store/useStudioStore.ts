import { create } from "zustand";
import { DocsConfig, WorkspaceData } from "@/lib/types";

export type ViewMode = "split" | "editor" | "preview";
export type ActiveTab = "files" | "outline" | "snippets" | "settings" | null;
export type EditorTheme = "light" | "dark";
export type InputMode = "visual" | "markdown";

export interface FileItem {
  filename: string;
  title: string;
}

interface StudioState {
  slug: string;
  config: DocsConfig;
  files: FileItem[];
  selectedFile: string;
  fileContent: string;
  savedContent: string;

  // View & UI controls
  viewMode: ViewMode;
  inputMode: InputMode;
  activeTab: ActiveTab;
  splitRatio: number;
  syncScroll: boolean;
  editorTheme: EditorTheme;
  zoomLevel: number;
  isA4PageMode: boolean;

  // Status & Feedback
  isSaving: boolean;
  saveToast: string | null;
  lastSavedTime: string | null;
  isExportingPdf: boolean;
  cursorPos: { line: number; col: number };

  // Actions
  initStudio: (workspace: WorkspaceData) => void;
  setFileContent: (content: string) => void;
  setSavedContent: (content: string) => void;
  setSelectedFile: (filename: string) => void;
  setConfig: (config: DocsConfig) => void;
  setFiles: (files: FileItem[]) => void;
  setViewMode: (mode: ViewMode) => void;
  setInputMode: (mode: InputMode) => void;
  setActiveTab: (tab: ActiveTab) => void;
  toggleActiveTab: (tab: ActiveTab) => void;
  setSplitRatio: (ratio: number) => void;
  setSyncScroll: (sync: boolean) => void;
  toggleSyncScroll: () => void;
  setEditorTheme: (theme: EditorTheme) => void;
  toggleEditorTheme: () => void;
  setZoomLevel: (level: number) => void;
  setIsA4PageMode: (mode: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setSaveToast: (msg: string | null) => void;
  setLastSavedTime: (time: string | null) => void;
  setIsExportingPdf: (exporting: boolean) => void;
  setCursorPos: (pos: { line: number; col: number }) => void;
  isDirty: () => boolean;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  slug: "",
  config: {
    name: "",
    title: "",
    version: "1.0.0",
    author: "",
    date: "",
  },
  files: [],
  selectedFile: "",
  fileContent: "",
  savedContent: "",

  viewMode: "split",
  inputMode: "visual",
  activeTab: null,
  splitRatio: 50,
  syncScroll: true,
  editorTheme: "light",
  zoomLevel: 100,
  isA4PageMode: true,

  isSaving: false,
  saveToast: null,
  lastSavedTime: null,
  isExportingPdf: false,
  cursorPos: { line: 1, col: 1 },

  initStudio: (workspace: WorkspaceData) => {
    const firstFile = workspace.files[0]?.filename || "01-system-overview.md";
    const initialContent = workspace.files[0]?.content || "";

    set({
      slug: workspace.slug,
      config: workspace.config,
      files: workspace.files.map((f) => ({
        filename: f.filename,
        title: "",
      })),
      selectedFile: firstFile,
      fileContent: initialContent,
      savedContent: initialContent,
    });
  },

  setFileContent: (fileContent) => set({ fileContent }),
  setSavedContent: (savedContent) => set({ savedContent }),
  setSelectedFile: (selectedFile) => set({ selectedFile }),
  setConfig: (config) => set({ config }),
  setFiles: (files) => set({ files }),
  setViewMode: (viewMode) => set({ viewMode }),
  setInputMode: (inputMode) => set({ inputMode }),
  setActiveTab: (activeTab) => set({ activeTab }),
  toggleActiveTab: (tab) =>
    set((state) => ({ activeTab: state.activeTab === tab ? null : tab })),
  setSplitRatio: (splitRatio) => set({ splitRatio }),
  setSyncScroll: (syncScroll) => set({ syncScroll }),
  toggleSyncScroll: () => set((state) => ({ syncScroll: !state.syncScroll })),
  setEditorTheme: (editorTheme) => set({ editorTheme }),
  toggleEditorTheme: () =>
    set((state) => ({
      editorTheme: state.editorTheme === "light" ? "dark" : "light",
    })),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  setIsA4PageMode: (isA4PageMode) => set({ isA4PageMode }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setSaveToast: (saveToast) => set({ saveToast }),
  setLastSavedTime: (lastSavedTime) => set({ lastSavedTime }),
  setIsExportingPdf: (isExportingPdf) => set({ isExportingPdf }),
  setCursorPos: (cursorPos) => set({ cursorPos }),
  isDirty: () => get().fileContent !== get().savedContent,
}));
