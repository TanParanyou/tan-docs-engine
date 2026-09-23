"use client";

import React, { useState } from "react";
import { Sparkles, Search } from "lucide-react";
import {
  WORKSPACE_TEMPLATES,
  DocumentTemplate,
  TemplateCategory,
} from "@/lib/document-templates";
import Modal from "./common/Modal";
import TemplateCard from "./common/TemplateCard";
import TemplatePreviewPane from "./common/TemplatePreviewPane";

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

  const categories = [
    { id: "all", label: "ทั้งหมด" },
    { id: "srs", label: "SRS / Tech Spec" },
    { id: "requirement", label: "BRD / Requirements" },
    { id: "api", label: "API Specification" },
    { id: "erp", label: "ERP Blueprint" },
    { id: "general", label: "เอกสารทั่วไป" },
  ];

  const filteredTemplates = WORKSPACE_TEMPLATES.filter((tpl) => {
    const matchCategory =
      selectedCategory === "all" || tpl.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      tpl.name.toLowerCase().includes(q) ||
      tpl.description.toLowerCase().includes(q) ||
      tpl.categoryLabel.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  });

  const handleUseTemplate = (template: DocumentTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="5xl"
      className="h-[88vh] max-h-[850px]"
      bodyClassName="flex flex-col p-0 overflow-hidden"
      icon={<Sparkles className="w-4 h-4" />}
      title="คลังแม่แบบเอกสาร (Documentation Templates)"
      badge={
        <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-retro bg-theme-accent-light text-theme-accent-text border border-theme-accent/40">
          Ready to Use
        </span>
      }
      subtitle="เลือกแม่แบบสเปกระดับมืออาชีพ โครงสร้างมาตรฐาน พร้อมใช้งานและปรับแต่งได้ทันที"
    >
      {/* Search & Categories Bar */}
      <div className="px-6 py-2.5 bg-theme-surface-sunken border-b-2 border-theme-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                type="button"
                className={`h-8 px-3 rounded-retro font-mono text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? "bg-theme-primary text-theme-primary-text border border-theme-border shadow-retro-sm font-bold"
                    : "bg-theme-surface text-theme-text hover:bg-theme-surface-hover border border-theme-border-subtle hover:border-theme-border"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64 flex-shrink-0">
          <Search className="w-3.5 h-3.5 text-theme-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาแม่แบบ..."
            className="w-full h-8 pl-8 pr-3 bg-theme-surface border border-theme-border rounded-retro text-xs text-theme-text placeholder-theme-text-faint focus:outline-none focus:border-theme-primary font-mono shadow-retro-sm"
          />
        </div>
      </div>

      {/* Main Content: Split into Template Cards & Live Details Preview */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x-2 divide-theme-border">
        {/* Left Column: Template Cards Grid */}
        <div className="md:col-span-5 lg:col-span-5 overflow-y-auto p-4 space-y-3 bg-theme-bg/60">
          {filteredTemplates.length === 0 ? (
            <div className="p-8 text-center bg-theme-surface rounded-retro border-2 border-dashed border-theme-border text-theme-text-muted text-xs font-mono">
              ไม่พบแม่แบบที่ตรงกับคำค้นหา
            </div>
          ) : (
            filteredTemplates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                isSelected={previewTemplate?.id === tpl.id}
                onSelect={(selected) => setPreviewTemplate(selected)}
                variant="detailed"
              />
            ))
          )}
        </div>

        {/* Right Column: Template Preview & Action */}
        <div className="md:col-span-7 lg:col-span-7 flex flex-col h-full overflow-hidden bg-theme-surface">
          <TemplatePreviewPane
            template={previewTemplate}
            onUseTemplate={handleUseTemplate}
            useButtonText="ใช้แม่แบบนี้สร้าง Workspace"
          />
        </div>
      </div>
    </Modal>
  );
}
