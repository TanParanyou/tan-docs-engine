"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  BookOpen,
  Sparkles,
  FileCode2,
  ArrowRight,
  Check,
  Layers,
  ChevronRight,
  Code2,
  ShieldCheck,
  Server,
  Briefcase,
  FilePlus2,
} from "lucide-react";
import {
  DocumentTemplate,
  WORKSPACE_TEMPLATES,
  TemplateCategory,
} from "@/lib/document-templates";

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DocumentTemplate) => void;
}

export default function TemplateGalleryModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplateGalleryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(
    WORKSPACE_TEMPLATES[0] || null
  );
  const [selectedPreviewFileIdx, setSelectedPreviewFileIdx] = useState<number>(0);

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: "ทั้งหมด (All Templates)" },
    { id: "srs", label: "SRS มาตรฐาน" },
    { id: "requirement", label: "ยืนยันความต้องการ (Gojo)" },
    { id: "api", label: "API & เชื่อมต่อ" },
    { id: "erp", label: "ERP / POS Module" },
    { id: "general", label: "เอกสารเปล่า" },
  ];

  const filteredTemplates = WORKSPACE_TEMPLATES.filter((tpl) => {
    const matchCat =
      selectedCategory === "all" || tpl.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      tpl.name.toLowerCase().includes(q) ||
      tpl.title.toLowerCase().includes(q) ||
      tpl.description.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  const getCategoryIcon = (category: TemplateCategory) => {
    switch (category) {
      case "srs":
        return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      case "requirement":
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case "api":
        return <Server className="w-4 h-4 text-purple-500" />;
      case "erp":
        return <Briefcase className="w-4 h-4 text-emerald-500" />;
      default:
        return <FilePlus2 className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleUseTemplate = (template: DocumentTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[88vh] max-h-[850px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight flex items-center gap-2">
                <span>คลังแม่แบบเอกสาร (Documentation Templates)</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Ready to Use
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                เลือกแม่แบบสเปกระดับมืออาชีพ โครงสร้างมาตรฐาน พร้อมใช้งานและปรับแต่งได้ทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                      : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาแม่แบบ..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Main Content: Split into Template Cards & Live Details Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left Column: Template Cards Grid (5 cols on md+) */}
          <div className="md:col-span-6 lg:col-span-5 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {filteredTemplates.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-xs text-slate-500">ไม่พบแม่แบบที่ตรงกับคำค้นหา</p>
              </div>
            ) : (
              filteredTemplates.map((tpl) => {
                const isSelected = previewTemplate?.id === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setPreviewTemplate(tpl);
                      setSelectedPreviewFileIdx(0);
                    }}
                    className={`cursor-pointer rounded-xl p-4 transition-all border text-left flex flex-col justify-between ${
                      isSelected
                        ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div>
                      {/* Card Top: Category Icon + Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          {getCategoryIcon(tpl.category)}
                          <span className="text-[11px] text-slate-500">
                            {tpl.categoryLabel}
                          </span>
                        </div>
                        {tpl.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {tpl.badge}
                          </span>
                        )}
                      </div>

                      {/* Title & Desc */}
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {tpl.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>

                    {/* Card Bottom: File count & Theme Palette indicator */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tpl.files.length} ไฟล์ในแม่แบบ</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center -space-x-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: tpl.theme.primaryColor }}
                            title={`Primary: ${tpl.theme.primaryColor}`}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: tpl.theme.accentColor }}
                            title={`Accent: ${tpl.theme.accentColor}`}
                          />
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Template Preview & Action (7 cols on md+) */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-col h-full bg-white overflow-hidden">
            {previewTemplate ? (
              <>
                {/* Preview Header */}
                <div className="p-5 border-b border-slate-100 bg-white flex-shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {previewTemplate.categoryLabel}
                        </span>
                        {previewTemplate.badge && (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {previewTemplate.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {previewTemplate.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {previewTemplate.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUseTemplate(previewTemplate)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all flex-shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>ใช้แม่แบบนี้</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>

                  {/* Included Files Tabs */}
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                      โครงสร้างไฟล์ในแม่แบบ ({previewTemplate.files.length} ไฟล์):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {previewTemplate.files.map((file, idx) => {
                        const isFileActive = selectedPreviewFileIdx === idx;
                        return (
                          <button
                            key={file.filename}
                            type="button"
                            onClick={() => setSelectedPreviewFileIdx(idx)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                              isFileActive
                                ? "bg-slate-900 text-white font-medium shadow-xs"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            <FileCode2 className="w-3 h-3 text-blue-400" />
                            <span>{file.filename}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* File Preview Content */}
                <div className="flex-1 overflow-y-auto p-5 bg-slate-50 font-mono text-[11.5px] leading-relaxed text-slate-800">
                  {previewTemplate.files[selectedPreviewFileIdx] ? (
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 text-slate-400 text-[11px]">
                        <span>
                          {previewTemplate.files[selectedPreviewFileIdx].title}
                        </span>
                        <span>Markdown Preview</span>
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        {previewTemplate.files[selectedPreviewFileIdx].content}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400">
                      ไม่พบเนื้อหาไฟล์
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                เลือกแม่แบบจากรายการด้านซ้ายเพื่อดูตัวอย่าง
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
