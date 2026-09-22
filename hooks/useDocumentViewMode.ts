"use client";

import { useState, useEffect, useCallback } from "react";

export type DocumentViewMode = "paged" | "pdf" | "continuous";

export interface UseDocumentViewModeOptions {
  defaultMode?: DocumentViewMode;
  storageKey?: string;
  defaultZoom?: number;
}

export interface UseDocumentViewModeReturn {
  viewMode: DocumentViewMode;
  setViewMode: (mode: DocumentViewMode) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  isMounted: boolean;
}

const ZOOM_STEPS = [60, 75, 90, 100, 110, 125, 150];

export function useDocumentViewMode(options: UseDocumentViewModeOptions = {}): UseDocumentViewModeReturn {
  const {
    defaultMode = "paged",
    storageKey = "tan_docs_view_mode",
    defaultZoom = 100,
  } = options;

  const [viewMode, setViewModeState] = useState<DocumentViewMode>(defaultMode);
  const [zoom, setZoom] = useState<number>(defaultZoom);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Hydrate preference from localStorage
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedMode = localStorage.getItem(storageKey) as DocumentViewMode | null;
      if (savedMode && ["paged", "pdf", "continuous"].includes(savedMode)) {
        setViewModeState(savedMode);
      }
    } catch {
      // localStorage may not be accessible in private/restricted environments
    }
  }, [storageKey]);

  const setViewMode = useCallback(
    (mode: DocumentViewMode) => {
      setViewModeState(mode);
      try {
        localStorage.setItem(storageKey, mode);
      } catch {
        // ignore
      }
    },
    [storageKey]
  );

  const zoomIn = useCallback(() => {
    setZoom((prev) => {
      const next = ZOOM_STEPS.find((s) => s > prev);
      return next ?? prev;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => {
      const prevStep = [...ZOOM_STEPS].reverse().find((s) => s < prev);
      return prevStep ?? prev;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  return {
    viewMode,
    setViewMode,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    isMounted,
  };
}
