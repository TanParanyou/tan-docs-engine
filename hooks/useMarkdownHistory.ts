"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface HistorySnapshot {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  timestamp: number;
}

interface FileHistoryState {
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];
  lastSnapshot: HistorySnapshot | null;
}

const MAX_HISTORY_LIMIT = 100;
const COALESCE_THRESHOLD_MS = 500;

// In-memory cache สำหรับรักษาประวัติแยกตามแต่ละไฟล์ในระหว่างเปิด session
const fileHistoryCache = new Map<string, FileHistoryState>();

interface UseMarkdownHistoryOptions {
  filename: string;
  initialContent: string;
  onChange: (value: string) => void;
}

export function useMarkdownHistory({
  filename,
  initialContent,
  onChange,
}: UseMarkdownHistoryOptions) {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  const undoStackRef = useRef<HistorySnapshot[]>([]);
  const redoStackRef = useRef<HistorySnapshot[]>([]);
  const lastSnapshotRef = useRef<HistorySnapshot | null>(null);
  const currentFilenameRef = useRef(filename);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // อัปเดตสถานะ UI buttons
  const syncState = useCallback(() => {
    const uCount = undoStackRef.current.length;
    const rCount = redoStackRef.current.length;
    setUndoCount(uCount);
    setRedoCount(rCount);
    setCanUndo(uCount > 0);
    setCanRedo(rCount > 0);
  }, []);

  // บันทึก history ปัจจุบันลง cache ประจำไฟล์
  const saveCurrentToCache = useCallback((fname: string) => {
    if (!fname) return;
    fileHistoryCache.set(fname, {
      undoStack: [...undoStackRef.current],
      redoStack: [...redoStackRef.current],
      lastSnapshot: lastSnapshotRef.current,
    });
  }, []);

  // เมื่อเปลี่ยนไฟล์ (filename change) ให้สลับ context ประวัติ
  useEffect(() => {
    if (currentFilenameRef.current !== filename) {
      // เซฟไฟล์เดิมเข้าแคช
      saveCurrentToCache(currentFilenameRef.current);

      currentFilenameRef.current = filename;

      // โหลดประวัติของไฟล์ใหม่จากแคช (ถ้ามี)
      const cached = fileHistoryCache.get(filename);
      if (cached) {
        undoStackRef.current = [...cached.undoStack];
        redoStackRef.current = [...cached.redoStack];
        lastSnapshotRef.current = cached.lastSnapshot;
      } else {
        // ไฟล์ใหม่ที่ยังไม่เคยเปิดในรอบนี้
        const initialSnap: HistorySnapshot = {
          text: initialContent,
          selectionStart: 0,
          selectionEnd: 0,
          timestamp: Date.now(),
        };
        undoStackRef.current = [];
        redoStackRef.current = [];
        lastSnapshotRef.current = initialSnap;
      }

      syncState();
    }
  }, [filename, initialContent, saveCurrentToCache, syncState]);

  // ตั้งค่า snapshot แรกเริ่มหากยังไม่มี
  useEffect(() => {
    if (!lastSnapshotRef.current && initialContent) {
      lastSnapshotRef.current = {
        text: initialContent,
        selectionStart: 0,
        selectionEnd: 0,
        timestamp: Date.now(),
      };
      syncState();
    }
  }, [initialContent, syncState]);

  // บันทึกการเปลี่ยนแปลง (push change)
  const pushChange = useCallback(
    (
      newText: string,
      selection: { start: number; end: number },
      isImmediate: boolean = false
    ) => {
      const now = Date.now();
      const currentLast = lastSnapshotRef.current;

      // ถ้าข้อความเหมือนเดิมเป๊ะ ไม่ต้องทำอะไร
      if (currentLast && currentLast.text === newText) {
        currentLast.selectionStart = selection.start;
        currentLast.selectionEnd = selection.end;
        return;
      }

      const commitSnapshot = () => {
        if (currentLast) {
          undoStackRef.current.push({ ...currentLast });
          if (undoStackRef.current.length > MAX_HISTORY_LIMIT) {
            undoStackRef.current.shift();
          }
        }

        // เมื่อมีการกระทำใหม่ ให้เคลียร์ redo stack
        redoStackRef.current = [];

        lastSnapshotRef.current = {
          text: newText,
          selectionStart: selection.start,
          selectionEnd: selection.end,
          timestamp: now,
        };

        saveCurrentToCache(currentFilenameRef.current);
        syncState();
      };

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (isImmediate) {
        commitSnapshot();
        return;
      }

      // ถ้าพิมพ์ต่อเนื่องในเวลา COALESCE_THRESHOLD_MS ให้ coalesce
      if (
        currentLast &&
        now - currentLast.timestamp < COALESCE_THRESHOLD_MS &&
        Math.abs(newText.length - currentLast.text.length) <= 3
      ) {
        // อัปเดต snapshot ล่าสุดแทนการสร้าง entry ใหม่
        lastSnapshotRef.current = {
          text: newText,
          selectionStart: selection.start,
          selectionEnd: selection.end,
          timestamp: now,
        };
        saveCurrentToCache(currentFilenameRef.current);
      } else {
        commitSnapshot();
      }
    },
    [saveCurrentToCache, syncState]
  );

  // Undo (ย้อนกลับ)
  const undo = useCallback((): { text: string; selectionStart: number; selectionEnd: number } | null => {
    if (undoStackRef.current.length === 0) return null;

    const currentLast = lastSnapshotRef.current;
    const previousSnapshot = undoStackRef.current.pop();
    if (!previousSnapshot) return null;

    if (currentLast) {
      redoStackRef.current.push({ ...currentLast });
      if (redoStackRef.current.length > MAX_HISTORY_LIMIT) {
        redoStackRef.current.shift();
      }
    }

    lastSnapshotRef.current = { ...previousSnapshot, timestamp: Date.now() };

    onChange(previousSnapshot.text);
    saveCurrentToCache(currentFilenameRef.current);
    syncState();

    return {
      text: previousSnapshot.text,
      selectionStart: previousSnapshot.selectionStart,
      selectionEnd: previousSnapshot.selectionEnd,
    };
  }, [onChange, saveCurrentToCache, syncState]);

  // Redo (ทำซ้ำ)
  const redo = useCallback((): { text: string; selectionStart: number; selectionEnd: number } | null => {
    if (redoStackRef.current.length === 0) return null;

    const currentLast = lastSnapshotRef.current;
    const nextSnapshot = redoStackRef.current.pop();
    if (!nextSnapshot) return null;

    if (currentLast) {
      undoStackRef.current.push({ ...currentLast });
      if (undoStackRef.current.length > MAX_HISTORY_LIMIT) {
        undoStackRef.current.shift();
      }
    }

    lastSnapshotRef.current = { ...nextSnapshot, timestamp: Date.now() };

    onChange(nextSnapshot.text);
    saveCurrentToCache(currentFilenameRef.current);
    syncState();

    return {
      text: nextSnapshot.text,
      selectionStart: nextSnapshot.selectionStart,
      selectionEnd: nextSnapshot.selectionEnd,
    };
  }, [onChange, saveCurrentToCache, syncState]);

  // รีเซ็ตประวัติทั้งหมด (เช่น เมื่อ Revert กลับสู่ Original)
  const resetHistory = useCallback(
    (newText: string) => {
      undoStackRef.current = [];
      redoStackRef.current = [];
      lastSnapshotRef.current = {
        text: newText,
        selectionStart: 0,
        selectionEnd: 0,
        timestamp: Date.now(),
      };
      saveCurrentToCache(currentFilenameRef.current);
      syncState();
    },
    [saveCurrentToCache, syncState]
  );

  return {
    canUndo,
    canRedo,
    undoCount,
    redoCount,
    pushChange,
    undo,
    redo,
    resetHistory,
  };
}
