"use client";

import React from "react";
import {
  FileCode2,
  Check,
  Eye,
  BookOpen,
  Briefcase,
  Server,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { DocumentTemplate, TemplateCategory } from "@/lib/document-templates";
import { cn } from "@/lib/utils";

export interface TemplateCardProps {
  template: DocumentTemplate;
  isSelected?: boolean;
  onSelect: (template: DocumentTemplate) => void;
  onPreview?: (template: DocumentTemplate) => void;
  variant?: "compact" | "detailed";
  className?: string;
}

export function getCategoryIcon(cat: TemplateCategory) {
  switch (cat) {
    case "srs":
      return <BookOpen className="w-3.5 h-3.5 text-theme-primary" />;
    case "requirement":
      return <BookOpen className="w-3.5 h-3.5 text-theme-primary" />;
    case "api":
      return <Server className="w-3.5 h-3.5 text-theme-accent" />;
    case "erp":
      return <Briefcase className="w-3.5 h-3.5 text-theme-warning" />;
    case "architecture":
      return <ShieldCheck className="w-3.5 h-3.5 text-theme-danger" />;
    default:
      return <Layers className="w-3.5 h-3.5 text-theme-text-muted" />;
  }
}

export default function TemplateCard({
  template,
  isSelected = false,
  onSelect,
  onPreview,
  variant = "compact",
  className = "",
}: TemplateCardProps) {
  const isCompact = variant === "compact";

  return (
    <div
      onClick={() => onSelect(template)}
      className={cn(
        "cursor-pointer rounded-retro p-3.5 transition-all text-left flex flex-col justify-between border-2 select-none",
        isSelected
          ? "bg-theme-surface border-theme-primary shadow-retro"
          : "bg-theme-surface border-theme-border hover:border-theme-primary/60 hover:bg-theme-surface-hover shadow-retro-sm",
        className
      )}
    >
      <div>
        {/* Card Header: Category & Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-theme-text">
            {getCategoryIcon(template.category)}
            <span className="text-[11px] text-theme-text-muted font-mono">
              {template.categoryLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {template.badge && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-retro bg-theme-accent-light text-theme-accent-text border border-theme-accent/40">
                {template.badge}
              </span>
            )}
            {isSelected && (
              <div className="w-4 h-4 rounded-retro bg-theme-primary text-theme-primary-text flex items-center justify-center flex-shrink-0 shadow-retro-sm border border-theme-border">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className={cn("font-bold text-theme-text font-sans leading-snug", isCompact ? "text-xs" : "text-sm")}>
          {template.name}
        </h3>
        <p
          className={cn(
            "text-theme-text-muted leading-relaxed mt-1 font-sans",
            isCompact ? "text-[11px] line-clamp-2" : "text-xs line-clamp-2"
          )}
        >
          {template.description}
        </p>
      </div>

      {/* Card Footer: File count, Preview button, Theme Swatches */}
      <div className="mt-3 pt-2 border-t border-theme-border-subtle flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-theme-text-muted flex items-center gap-1 text-[11px] font-mono">
            <FileCode2 className="w-3 h-3 text-theme-text-faint" />
            <span>{template.files.length} ไฟล์</span>
          </span>

          {onPreview && template.files.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(template);
              }}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-retro text-[10px] font-semibold text-theme-accent-text bg-theme-accent-light hover:bg-theme-accent/20 border border-theme-accent/40 transition-colors cursor-pointer"
              title="ดูตัวอย่างไฟล์และเนื้อหา Markdown"
            >
              <Eye className="w-2.5 h-2.5" />
              <span>ดูตัวอย่าง</span>
            </button>
          )}
        </div>

        {/* Theme Palette Swatches */}
        <div className="flex items-center -space-x-1" title={`สีธีม: ${template.theme.primaryColor}, ${template.theme.accentColor}`}>
          <span
            className="w-3 h-3 rounded-retro border border-theme-border shadow-retro-sm"
            style={{ backgroundColor: template.theme.primaryColor }}
          />
          <span
            className="w-3 h-3 rounded-retro border border-theme-border shadow-retro-sm"
            style={{ backgroundColor: template.theme.accentColor }}
          />
        </div>
      </div>
    </div>
  );
}
