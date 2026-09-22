"use client";

import React, { useState, useMemo } from "react";
import { ListTree, Search, Hash, ChevronRight } from "lucide-react";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
  lineNumber: number;
}

interface DocumentOutlineProps {
  content: string;
  onJumpToHeading: (heading: HeadingItem) => void;
}

export default function DocumentOutline({
  content,
  onJumpToHeading,
}: DocumentOutlineProps) {
  const [filterQuery, setFilterQuery] = useState("");

  // Parse markdown headings (#, ##, ###, ####)
  const headings = useMemo<HeadingItem[]>(() => {
    if (!content) return [];
    const lines = content.split("\n");
    const result: HeadingItem[] = [];

    lines.forEach((line, index) => {
      // Match markdown headers: #, ##, ###, ####
      const match = line.match(/^(#{1,4})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        // Clean text: strip markdown bold/italic asterisks or backticks
        const rawText = match[2].trim();
        const cleanText = rawText
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/`([^`]+)`/g, "$1")
          .trim();

        const id = cleanText
          .toLowerCase()
          .replace(/[^a-z0-9ก-๙]+/g, "-")
          .replace(/^-+|-+$/g, "");

        result.push({
          id: `${id}-${index}`,
          text: cleanText,
          level,
          lineNumber: index + 1,
        });
      }
    });

    return result;
  }, [content]);

  const filteredHeadings = useMemo(() => {
    if (!filterQuery.trim()) return headings;
    const q = filterQuery.toLowerCase().trim();
    return headings.filter((h) => h.text.toLowerCase().includes(q));
  }, [headings, filterQuery]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ListTree className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Document Outline ({headings.length})
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          Jump to section
        </span>
      </div>

      {/* Filter Input */}
      <div className="p-2 border-b border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="ค้นหาหัวข้อ เช่น REQ-POS-001..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Heading List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {filteredHeadings.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs">
            {headings.length === 0
              ? "ไม่พบหัวข้อในเอกสาร (พิมพ์ # หรือ ## เพื่อสร้างหัวข้อ)"
              : `ไม่พบหัวข้อที่ตรงกับ "${filterQuery}"`}
          </div>
        ) : (
          filteredHeadings.map((h) => {
            const indentClass =
              h.level === 1
                ? "pl-2 font-semibold text-slate-100"
                : h.level === 2
                ? "pl-4 text-slate-300 font-medium"
                : h.level === 3
                ? "pl-6 text-slate-400"
                : "pl-8 text-slate-500 text-[11px]";

            return (
              <button
                key={h.id}
                type="button"
                onClick={() => onJumpToHeading(h)}
                className={`w-full group text-left py-1.5 pr-2 rounded hover:bg-slate-800 transition-colors flex items-center justify-between text-xs ${indentClass}`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Hash
                    className={`w-3 h-3 flex-shrink-0 ${
                      h.level === 1
                        ? "text-blue-400"
                        : h.level === 2
                        ? "text-emerald-400"
                        : "text-slate-600"
                    }`}
                  />
                  <span className="truncate">{h.text}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-mono text-slate-500">
                    L{h.lineNumber}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
