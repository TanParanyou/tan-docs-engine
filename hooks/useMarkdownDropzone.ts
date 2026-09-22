import { useState, useCallback, useRef } from "react";

export interface UploadedMarkdownFile {
  id: string;
  filename: string;
  content: string;
  size: number;
  previewTitle?: string;
  file?: File;
}

interface UseMarkdownDropzoneOptions {
  onFilesChanged?: (files: UploadedMarkdownFile[]) => void;
  onFirstFileDetected?: (file: UploadedMarkdownFile) => void;
}

export function extractMarkdownTitle(content: string, defaultName: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match && match[1]) {
    return match[1].replace(/[*_`]/g, "").trim();
  }
  return defaultName.replace(/\.md$/i, "");
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function useMarkdownDropzone(options?: UseMarkdownDropzoneOptions) {
  const [files, setFiles] = useState<UploadedMarkdownFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreviewFile, setActivePreviewFile] = useState<UploadedMarkdownFile | null>(null);

  const dragCounterRef = useRef(0);

  const processFile = (file: File): Promise<UploadedMarkdownFile | null> => {
    return new Promise((resolve) => {
      const isMd =
        file.name.toLowerCase().endsWith(".md") ||
        file.type === "text/markdown" ||
        file.type === "text/x-markdown";

      if (!isMd) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target?.result as string) || "";
        const title = extractMarkdownTitle(content, file.name);
        const item: UploadedMarkdownFile = {
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          filename: file.name,
          content,
          size: file.size,
          previewTitle: title,
          file,
        };
        resolve(item);
      };
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    });
  };

  const addFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setError(null);
      const incomingFiles = Array.from(fileList);
      if (incomingFiles.length === 0) return;

      const results = await Promise.all(incomingFiles.map(processFile));
      const validFiles = results.filter((f): f is UploadedMarkdownFile => f !== null);

      if (validFiles.length < incomingFiles.length) {
        const rejectedCount = incomingFiles.length - validFiles.length;
        setError(`ข้าม ${rejectedCount} ไฟล์ที่ไม่ใช่นามสกุล .md`);
      }

      if (validFiles.length === 0) {
        return;
      }

      setFiles((prev) => {
        const isFirstBatch = prev.length === 0;
        const updated = [...prev, ...validFiles];

        if (isFirstBatch && validFiles[0] && options?.onFirstFileDetected) {
          options.onFirstFileDetected(validFiles[0]);
        }
        if (options?.onFilesChanged) {
          options.onFilesChanged(updated);
        }
        return updated;
      });
    },
    [options]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        await addFiles(e.target.files);
        // Reset file input so same file can be selected again if needed
        e.target.value = "";
      }
    },
    [addFiles]
  );

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const updated = prev.filter((f) => f.id !== id);
        if (activePreviewFile?.id === id) {
          setActivePreviewFile(null);
        }
        if (options?.onFilesChanged) {
          options.onFilesChanged(updated);
        }
        return updated;
      });
    },
    [activePreviewFile, options]
  );

  const moveFile = useCallback(
    (id: string, direction: "up" | "down") => {
      setFiles((prev) => {
        const index = prev.findIndex((f) => f.id === id);
        if (index === -1) return prev;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= prev.length) return prev;

        const updated = [...prev];
        const [movedItem] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, movedItem);

        if (options?.onFilesChanged) {
          options.onFilesChanged(updated);
        }
        return updated;
      });
    },
    [options]
  );

  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
    setActivePreviewFile(null);
    if (options?.onFilesChanged) {
      options.onFilesChanged([]);
    }
  }, [options]);

  const openPreview = useCallback((file: UploadedMarkdownFile) => {
    setActivePreviewFile(file);
  }, []);

  const closePreview = useCallback(() => {
    setActivePreviewFile(null);
  }, []);

  return {
    files,
    isDragging,
    error,
    activePreviewFile,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    removeFile,
    moveFile,
    clearFiles,
    openPreview,
    closePreview,
    setError,
  };
}
