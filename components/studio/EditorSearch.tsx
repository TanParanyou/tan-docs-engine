"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  Replace,
  ReplaceAll,
} from "lucide-react";

interface EditorSearchProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onSearchChange: (query: string, matchCase: boolean) => void;
  onFindNext: (query: string, matchCase: boolean) => void;
  onFindPrev: (query: string, matchCase: boolean) => void;
  onReplace: (query: string, replacement: string, matchCase: boolean) => void;
  onReplaceAll: (query: string, replacement: string, matchCase: boolean) => void;
  currentMatchIndex: number;
  totalMatches: number;
}

export default function EditorSearch({
  isOpen,
  onClose,
  content: _content,
  onSearchChange,
  onFindNext,
  onFindPrev,
  onReplace,
  onReplaceAll,
  currentMatchIndex,
  totalMatches,
}: EditorSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQueryChange = (val: string, mc = matchCase) => {
    setSearchQuery(val);
    onSearchChange(val, mc);
  };

  const handleMatchCaseToggle = (checked: boolean) => {
    setMatchCase(checked);
    onSearchChange(searchQuery, checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!searchQuery) return;
      if (e.shiftKey) {
        onFindPrev(searchQuery, matchCase);
      } else {
        onFindNext(searchQuery, matchCase);
      }
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearchChange("", matchCase);
    searchInputRef.current?.focus();
  };

  const hasNoMatches = searchQuery.trim().length > 0 && totalMatches === 0;

  return (
    <div className="absolute top-12 right-6 z-40 bg-theme-surface border-2 border-theme-border rounded-retro shadow-retro p-3 text-xs text-theme-text flex flex-col gap-2.5 w-88 animate-fade-in select-none">
      {/* Search Row */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-theme-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ค้นหาข้อความ (Enter เพื่อค้นหา)..."
            className={`w-full h-8 pl-8 pr-20 bg-theme-surface-sunken border ${
              hasNoMatches
                ? "border-theme-danger/60 focus:border-theme-danger"
                : "border-theme-border focus:border-theme-primary"
            } rounded-retro text-xs text-theme-text placeholder-theme-text-faint focus:outline-none focus:bg-theme-surface font-mono transition-colors`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="w-4 h-4 rounded-full hover:bg-theme-surface flex items-center justify-center text-theme-text-muted hover:text-theme-text transition-colors"
                title="ล้างข้อความ"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
            <span
              className={`text-[10px] font-mono font-semibold px-1 py-0.5 rounded ${
                hasNoMatches
                  ? "text-theme-danger bg-theme-danger-light"
                  : "text-theme-text-muted"
              }`}
            >
              {totalMatches > 0
                ? `${currentMatchIndex + 1}/${totalMatches}`
                : searchQuery
                ? "0/0"
                : ""}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onFindPrev(searchQuery, matchCase)}
          disabled={totalMatches === 0}
          className="h-8 w-8 flex items-center justify-center hover:bg-theme-surface-sunken border border-transparent hover:border-theme-border rounded-retro disabled:opacity-30 text-theme-text-muted hover:text-theme-text cursor-pointer transition-colors active:translate-x-[0.5px] active:translate-y-[0.5px]"
          title="ก่อนหน้า (Shift+Enter)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onFindNext(searchQuery, matchCase)}
          disabled={totalMatches === 0}
          className="h-8 w-8 flex items-center justify-center hover:bg-theme-surface-sunken border border-transparent hover:border-theme-border rounded-retro disabled:opacity-30 text-theme-text-muted hover:text-theme-text cursor-pointer transition-colors active:translate-x-[0.5px] active:translate-y-[0.5px]"
          title="ถัดไป (Enter)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowReplace(!showReplace)}
          className={`h-8 w-8 flex items-center justify-center rounded-retro transition-colors cursor-pointer border ${
            showReplace
              ? "bg-theme-primary text-theme-primary-text border-theme-border font-bold shadow-retro-sm"
              : "hover:bg-theme-surface-sunken border-transparent hover:border-theme-border text-theme-text-muted hover:text-theme-text"
          }`}
          title="เปิด/ปิดการแทนที่ข้อความ (Replace)"
        >
          <Replace className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center hover:bg-theme-surface-sunken border border-transparent hover:border-theme-border rounded-retro text-theme-text-muted hover:text-theme-text cursor-pointer transition-colors"
          title="ปิด (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Replace Row */}
      {showReplace && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-theme-border-subtle">
          <input
            type="text"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onReplace(searchQuery, replaceQuery, matchCase);
              }
            }}
            placeholder="แทนที่ด้วย..."
            className="flex-1 h-8 px-2.5 bg-theme-surface-sunken border border-theme-border rounded-retro text-xs text-theme-text placeholder-theme-text-faint focus:outline-none focus:bg-theme-surface focus:border-theme-primary font-mono transition-colors"
          />

          <button
            type="button"
            onClick={() => onReplace(searchQuery, replaceQuery, matchCase)}
            disabled={totalMatches === 0}
            className="h-8 px-2.5 bg-theme-surface hover:bg-theme-surface-hover border border-theme-border shadow-retro-sm disabled:opacity-30 rounded-retro text-xs font-medium text-theme-text cursor-pointer transition-all active:translate-x-[0.5px] active:translate-y-[0.5px]"
            title="แทนที่ตำแหน่งปัจจุบัน (Enter)"
          >
            แทนที่
          </button>

          <button
            type="button"
            onClick={() => onReplaceAll(searchQuery, replaceQuery, matchCase)}
            disabled={totalMatches === 0}
            className="h-8 px-2.5 bg-theme-primary hover:bg-theme-primary-hover border border-theme-border shadow-retro-sm disabled:opacity-30 rounded-retro text-xs font-medium text-theme-primary-text flex items-center gap-1 cursor-pointer transition-all active:translate-x-[0.5px] active:translate-y-[0.5px]"
            title="แทนที่ทั้งหมด"
          >
            <ReplaceAll className="w-3.5 h-3.5" />
            <span>ทั้งหมด</span>
          </button>
        </div>
      )}

      {/* Match Case Option */}
      <div className="flex items-center justify-between text-[11px] text-theme-text-muted px-1">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={matchCase}
            onChange={(e) => handleMatchCaseToggle(e.target.checked)}
            className="rounded-retro border-theme-border text-theme-primary focus:ring-0 cursor-pointer"
          />
          <span className="font-mono">Match case (ตรงตามตัวพิมพ์)</span>
        </label>
        <span className="text-[10px] text-theme-text-faint font-mono">Esc เพื่อปิด</span>
      </div>
    </div>
  );
}
