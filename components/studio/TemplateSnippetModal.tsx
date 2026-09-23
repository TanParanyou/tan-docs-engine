"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Sparkles,
  Check,
  Copy,
  Plus,
  ChevronRight,
} from "lucide-react";
import {
  EDITOR_SNIPPET_TEMPLATES,
  EditorSnippetTemplate,
} from "@/lib/document-templates";

interface TemplateSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSnippet: (snippet: string) => void;
}

export default function TemplateSnippetModal({
  isOpen,
  onClose,
  onInsertSnippet,
}: TemplateSnippetModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSnippet, setSelectedSnippet] =
    useState<EditorSnippetTemplate>(EDITOR_SNIPPET_TEMPLATES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: "ทั้งหมด" },
    { id: "tables", label: "การพิจารณา REQ" },
    { id: "approval", label: "ตารางลงนาม" },
    { id: "mermaid", label: "แผนภาพ Mermaid" },
    { id: "api", label: "API & ข้อมูล" },
    { id: "structure", label: "โครงสร้างเอกสาร" },
  ];

  const filteredSnippets = EDITOR_SNIPPET_TEMPLATES.filter((snip) => {
    const matchCat =
      selectedCategory === "all" || snip.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      snip.title.toLowerCase().includes(q) ||
      snip.description.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  const handleInsert = (snip: EditorSnippetTemplate) => {
    onInsertSnippet(snip.snippet);
    onClose();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="bg-theme-surface rounded-retro shadow-retro-lg border-2 border-theme-border w-full max-w-4xl h-[82vh] max-h-[720px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-theme-surface-sunken border-b-2 border-theme-border text-theme-text flex items-center justify-between flex-shrink-0 shadow-retro-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-retro bg-theme-primary flex items-center justify-center text-white border border-theme-border shadow-retro-sm">
              <Sparkles className="w-4 h-4 text-theme-primary-text" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-theme-text font-mono flex items-center gap-1.5">
                <span>คลังแม่แบบและบล็อกข้อความ (Snippet Blocks)</span>
              </h2>
              <p className="text-[11px] text-theme-text-muted">
                เลือกแม่แบบบล็อกเนื้อหา ตารางพิจารณา REQ และ Mermaid เพื่อแทรกลงในเอกสารทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="h-8 w-8 rounded-retro hover:bg-theme-surface text-theme-text-muted hover:text-theme-text border border-transparent hover:border-theme-border transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories & Search */}
        <div className="px-5 py-2.5 bg-theme-surface border-b border-theme-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  type="button"
                  className={`h-8 px-3 rounded-retro text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-theme-primary text-theme-primary-text border border-theme-border shadow-retro-sm font-bold"
                      : "bg-theme-surface-sunken text-theme-text-muted hover:text-theme-text hover:bg-theme-surface border border-theme-border"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-60 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-theme-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาแม่แบบ..."
              className="w-full h-8 pl-8 pr-3 bg-theme-surface-sunken border border-theme-border rounded-retro text-xs text-theme-text placeholder-theme-text-faint focus:outline-none focus:bg-theme-surface focus:border-theme-primary font-mono transition-colors"
            />
          </div>
        </div>

        {/* Content Body: Left Snippet List, Right Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x-2 divide-theme-border">
          {/* Left: Snippets list */}
          <div className="md:col-span-5 overflow-y-auto p-3 space-y-2 bg-theme-bg/60">
            {filteredSnippets.length === 0 ? (
              <div className="p-6 text-center text-xs text-theme-text-muted font-mono">
                ไม่พบแม่แบบที่ค้นหา
              </div>
            ) : (
              filteredSnippets.map((snip) => {
                const isSelected = selectedSnippet?.id === snip.id;
                return (
                  <button
                    key={snip.id}
                    type="button"
                    onClick={() => setSelectedSnippet(snip)}
                    className={`w-full p-2.5 rounded-retro border-2 text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-theme-surface border-theme-primary shadow-retro-sm"
                        : "bg-theme-surface border-theme-border hover:border-theme-border-subtle"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-semibold text-theme-accent-text bg-theme-accent-light px-1.5 py-0.5 rounded-retro border border-theme-accent/40 font-mono">
                          {snip.categoryLabel}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-theme-text truncate font-sans">
                        {snip.title}
                      </h4>
                      <p className="text-[11px] text-theme-text-muted truncate mt-0.5 font-sans">
                        {snip.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-theme-text-muted flex-shrink-0" />
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Snippet Code Preview & Actions */}
          <div className="md:col-span-7 flex flex-col h-full bg-theme-surface overflow-hidden">
            {selectedSnippet ? (
              <>
                <div className="p-4 border-b border-theme-border flex items-center justify-between gap-3 flex-shrink-0 bg-theme-surface shadow-retro-sm">
                  <div>
                    <span className="text-[10px] font-semibold text-theme-text-muted uppercase tracking-wider block font-mono">
                      {selectedSnippet.categoryLabel}
                    </span>
                    <h3 className="text-sm font-bold text-theme-text mt-0.5 font-sans">
                      {selectedSnippet.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedSnippet.snippet)}
                      className="h-8 px-3 bg-theme-surface hover:bg-theme-surface-hover text-theme-text border border-theme-border rounded-retro text-xs font-medium flex items-center gap-1.5 transition-all shadow-retro-sm cursor-pointer active:translate-x-[0.5px] active:translate-y-[0.5px]"
                      title="คัดลอก Markdown"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-theme-success" />
                          <span className="text-theme-success font-semibold">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-theme-text-muted" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInsert(selectedSnippet)}
                      className="h-8 px-3.5 bg-theme-primary hover:bg-theme-primary-hover text-theme-primary-text border border-theme-border rounded-retro text-xs font-semibold shadow-retro-sm flex items-center gap-1.5 transition-all cursor-pointer active:translate-x-[0.5px] active:translate-y-[0.5px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>แทรกลงในเอกสาร</span>
                    </button>
                  </div>
                </div>

                {/* Markdown snippet raw view */}
                <div className="flex-1 overflow-y-auto p-4 bg-theme-surface-sunken text-theme-text font-mono text-[12px] leading-relaxed">
                  <pre className="whitespace-pre-wrap select-all">
                    {selectedSnippet.snippet.trim()}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-theme-text-muted text-xs font-mono">
                เลือกแม่แบบจากรายการด้านซ้าย
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
