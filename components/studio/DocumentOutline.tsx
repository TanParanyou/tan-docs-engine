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
      const match = line.match(/^(#{1,4})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
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
    <div className="flex flex-col h-full bg-theme-surface border-r-2 border-theme-border text-theme-text select-none">
      {/* Drawer Header */}
      <div className="px-4 py-3 border-b-2 border-theme-border bg-theme-surface flex items-center justify-between shadow-retro-sm">
        <div className="flex items-center space-x-2">
          <ListTree className="w-4 h-4 text-theme-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-theme-text font-mono">
            Document Outline ({headings.length})
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-retro bg-theme-accent-light text-theme-accent-text border border-theme-accent/50 font-semibold">
          1-Click Jump
        </span>
      </div>

      {/* Search Filter */}
      <div className="p-3 border-b border-theme-border bg-theme-surface">
        <div className="relative">
          <Search className="w-4 h-4 text-theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="ค้นหาหัวข้อ เช่น REQ-POS-001..."
            className="w-full h-9 pl-9 pr-3.5 bg-theme-surface-sunken border border-theme-border rounded-retro text-xs text-theme-text placeholder-theme-text-faint focus:outline-none focus:bg-theme-surface focus:border-theme-primary transition-all font-mono"
          />
        </div>
      </div>

      {/* Heading List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredHeadings.length === 0 ? (
          <div className="p-6 text-center text-theme-text-muted text-xs font-mono">
            {headings.length === 0
              ? "ไม่พบหัวข้อในเอกสาร (พิมพ์ # หรือ ## เพื่อสร้างหัวข้อ)"
              : `ไม่พบหัวข้อที่ตรงกับ "${filterQuery}"`}
          </div>
        ) : (
          filteredHeadings.map((h) => {
            const indentClass =
              h.level === 1
                ? "pl-3 font-bold text-theme-text bg-theme-surface-hover border-l-2 border-theme-primary"
                : h.level === 2
                ? "pl-5 text-theme-text font-semibold border-l border-theme-accent"
                : h.level === 3
                ? "pl-7 text-theme-text-muted font-medium"
                : "pl-9 text-theme-text-faint text-xs";

            return (
              <button
                key={h.id}
                type="button"
                onClick={() => onJumpToHeading(h)}
                className={`w-full group text-left py-2 pr-2.5 rounded-retro hover:bg-theme-surface-hover hover:text-theme-primary transition-colors flex items-center justify-between text-xs min-h-[36px] cursor-pointer ${indentClass}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Hash
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      h.level === 1
                        ? "text-theme-primary"
                        : h.level === 2
                        ? "text-theme-accent"
                        : "text-theme-text-muted group-hover:text-theme-primary"
                    }`}
                  />
                  <span className="truncate">{h.text}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[11px] font-mono text-theme-text-muted group-hover:text-theme-primary">
                    L{h.lineNumber}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-theme-text-muted group-hover:text-theme-primary" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
