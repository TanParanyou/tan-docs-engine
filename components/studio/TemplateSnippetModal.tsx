"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Sparkles,
  Check,
  Copy,
  Plus,
  Layers,
  ChevronRight,
  Code2,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[82vh] max-h-[720px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <span>คลังแม่แบบและบล็อกข้อความ (Snippet Blocks)</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                เลือกแม่แบบบล็อกเนื้อหา ตารางพิจารณา REQ และ Mermaid เพื่อแทรกลงในเอกสารทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories & Search */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  type="button"
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาแม่แบบ..."
              className="w-full pl-7 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content Body: Left Snippet List, Right Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left: Snippets list */}
          <div className="md:col-span-5 overflow-y-auto p-3 space-y-1.5 bg-slate-50/60">
            {filteredSnippets.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
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
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-white border-blue-500 shadow-xs ring-2 ring-blue-500/15"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {snip.categoryLabel}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {snip.title}
                      </h4>
                      <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                        {snip.description}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Snippet Code Preview & Actions */}
          <div className="md:col-span-7 flex flex-col h-full bg-white overflow-hidden">
            {selectedSnippet ? (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-shrink-0 bg-white">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {selectedSnippet.categoryLabel}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      {selectedSnippet.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedSnippet.snippet)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                      title="คัดลอก Markdown"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInsert(selectedSnippet)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>แทรกลงในเอกสาร</span>
                    </button>
                  </div>
                </div>

                {/* Markdown snippet raw view */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-900 text-slate-200 font-mono text-[11.5px] leading-relaxed">
                  <pre className="whitespace-pre-wrap select-all">
                    {selectedSnippet.snippet.trim()}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                เลือกแม่แบบจากรายการด้านซ้าย
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
