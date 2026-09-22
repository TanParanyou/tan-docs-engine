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
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        onFindPrev(searchQuery, matchCase);
      } else {
        onFindNext(searchQuery, matchCase);
      }
    }
  };

  return (
    <div className="absolute top-12 right-6 z-30 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2.5 text-xs text-slate-200 flex flex-col gap-2 w-80 animate-fade-in backdrop-blur-md">
      {/* Search Row */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onFindNext(e.target.value, matchCase);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Find in document..."
            className="w-full pl-8 pr-16 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
            {totalMatches > 0
              ? `${currentMatchIndex + 1}/${totalMatches}`
              : searchQuery
              ? "0/0"
              : ""}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onFindPrev(searchQuery, matchCase)}
          disabled={totalMatches === 0}
          className="p-1.5 hover:bg-slate-800 rounded disabled:opacity-30 text-slate-400 hover:text-white"
          title="Previous Match (Shift+Enter)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onFindNext(searchQuery, matchCase)}
          disabled={totalMatches === 0}
          className="p-1.5 hover:bg-slate-800 rounded disabled:opacity-30 text-slate-400 hover:text-white"
          title="Next Match (Enter)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowReplace(!showReplace)}
          className={`p-1.5 rounded transition-colors ${
            showReplace
              ? "bg-blue-600 text-white"
              : "hover:bg-slate-800 text-slate-400 hover:text-white"
          }`}
          title="Toggle Replace"
        >
          <Replace className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Replace Row */}
      {showReplace && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
          <input
            type="text"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            placeholder="Replace with..."
            className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          />

          <button
            type="button"
            onClick={() => onReplace(searchQuery, replaceQuery, matchCase)}
            disabled={totalMatches === 0}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[11px] font-medium text-slate-200"
            title="Replace Current"
          >
            Replace
          </button>

          <button
            type="button"
            onClick={() => onReplaceAll(searchQuery, replaceQuery, matchCase)}
            disabled={totalMatches === 0}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded text-[11px] font-medium text-white flex items-center gap-1"
            title="Replace All"
          >
            <ReplaceAll className="w-3 h-3" />
            <span>All</span>
          </button>
        </div>
      )}

      {/* Match Case Option */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={matchCase}
            onChange={(e) => setMatchCase(e.target.checked)}
            className="rounded bg-slate-950 border-slate-700 text-blue-600"
          />
          <span>Match case (ตรงตามตัวพิมพ์)</span>
        </label>
        <span className="text-[10px] text-slate-500">Esc to close</span>
      </div>
    </div>
  );
}
