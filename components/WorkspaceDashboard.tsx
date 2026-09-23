"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WorkspaceData } from "@/lib/types";
import NewWorkspaceModal from "./NewWorkspaceModal";
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Plus,
  Edit3,
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Zap,
} from "lucide-react";
import TemplateGalleryModal from "./TemplateGalleryModal";
import { DocumentTemplate, WORKSPACE_TEMPLATES } from "@/lib/document-templates";
import ExportDropdown from "@/components/common/ExportDropdown";

interface WorkspaceDashboardProps {
  initialWorkspaces: WorkspaceData[];
}

export default function WorkspaceDashboard({
  initialWorkspaces,
}: WorkspaceDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("srs-standard");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkspaces = initialWorkspaces.filter((ws) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      ws.slug.toLowerCase().includes(q) ||
      ws.config.title.toLowerCase().includes(q) ||
      ws.config.name.toLowerCase().includes(q) ||
      (ws.config.documentNumber && ws.config.documentNumber.toLowerCase().includes(q)) ||
      (ws.config.author && ws.config.author.toLowerCase().includes(q)) ||
      (ws.config.client && ws.config.client.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <NewWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedTemplateId={selectedTemplateId}
      />

      <TemplateGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectTemplate={(tpl: DocumentTemplate) => {
          setSelectedTemplateId(tpl.id);
          setIsModalOpen(true);
        }}
      />

      {/* Action Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหา Workspace, ชื่อระบบ, หรือรหัสเอกสาร..."
            className="w-full pl-10 pr-4 py-2 bg-theme-surface border-2 border-theme-border rounded-retro text-xs text-theme-text placeholder:text-theme-text-faint focus:outline-none focus:ring-1 focus:ring-theme-primary shadow-retro-sm"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-theme-surface hover:bg-theme-surface-hover text-theme-text text-xs font-semibold rounded-retro border-2 border-theme-border shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            title="เปิดคลังแม่แบบเอกสาร"
          >
            <BookOpen className="w-4 h-4 text-theme-accent" />
            <span>คลังแม่แบบ (Templates)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTemplateId("srs-standard");
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-theme-primary hover:bg-theme-primary-hover text-theme-primary-text text-xs font-bold rounded-retro border-2 border-theme-border shadow-retro active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Workspace</span>
            <Sparkles className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>

      {/* Quick Start Templates Shelf */}
      <div className="mb-8 p-4 bg-theme-surface rounded-retro border-2 border-theme-border shadow-retro-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-retro bg-theme-accent-light border border-theme-accent/40 flex items-center justify-center text-theme-accent">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <div>
              <span className="text-xs font-bold text-theme-text block leading-tight">
                สร้างเอกสารด่วนจากแม่แบบมาตรฐาน (Quick Start with Templates)
              </span>
              <span className="text-[10.5px] text-theme-text-muted block">
                เลือกแม่แบบที่ต้องการแล้วกรอกเพียงชื่อระบบ เพื่อเริ่มต้นได้ทันที
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="text-[11px] font-mono font-semibold text-theme-primary hover:text-theme-primary-hover flex items-center gap-1 hover:underline flex-shrink-0 cursor-pointer"
          >
            <span>ดูแม่แบบทั้งหมด ({WORKSPACE_TEMPLATES.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {WORKSPACE_TEMPLATES.slice(0, 4).map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                setSelectedTemplateId(tpl.id);
                setIsModalOpen(true);
              }}
              className="p-3.5 bg-theme-surface-sunken hover:bg-theme-surface-hover border border-theme-border-subtle hover:border-theme-border rounded-retro text-left transition-all cursor-pointer group flex flex-col justify-between shadow-[1px_1px_0px_var(--theme-border-subtle)]"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-retro bg-theme-surface border border-theme-border-subtle text-theme-text-muted group-hover:border-theme-border transition-colors">
                    {tpl.categoryLabel}
                  </span>
                  <div
                    className="w-2.5 h-2.5 rounded-full border border-theme-border"
                    style={{ backgroundColor: tpl.theme.primaryColor }}
                    title={`Primary: ${tpl.theme.primaryColor}`}
                  />
                </div>
                <h4 className="text-xs font-bold text-theme-text group-hover:text-theme-primary transition-colors line-clamp-1">
                  {tpl.name}
                </h4>
                <p className="text-[11px] text-theme-text-muted mt-1 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-theme-border-subtle flex items-center justify-between text-[11px] text-theme-primary font-semibold group-hover:text-theme-primary-hover">
                <span>ใช้แม่แบบนี้</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workspaces Grid */}
      {filteredWorkspaces.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-500 text-sm font-medium">
            ไม่พบ Workspace ที่ตรงกับคำค้นหา &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-3 text-xs text-blue-600 hover:underline font-semibold"
          >
            ล้างคำค้นหา
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredWorkspaces.map((ws) => {
            const isApproved = ws.config.status === "Approved";
            const statusBg = isApproved
              ? "bg-theme-success-light text-theme-success border-theme-success/40"
              : "bg-theme-warning-light text-theme-warning border-theme-warning/40";

            return (
              <div
                key={ws.slug}
                className="bg-theme-surface rounded-retro border-2 border-theme-border shadow-retro hover:shadow-retro-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between relative group/card"
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-retro bg-theme-surface-sunken border border-theme-border-subtle text-theme-text font-mono">
                      {ws.slug}
                    </span>
                    <span
                      className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-retro border flex items-center gap-1 ${statusBg}`}
                    >
                      {isApproved ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {ws.config.status || "Draft"}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-theme-text leading-snug">
                    {ws.config.title}
                  </h2>
                  <p className="text-sm font-medium text-theme-text-muted mt-0.5">
                    {ws.config.name}
                  </p>
                  {ws.config.subtitle && (
                    <p className="text-xs text-theme-text-muted mt-2 line-clamp-2">
                      {ws.config.subtitle}
                    </p>
                  )}

                  {/* Metadata Table */}
                  <div className="mt-5 grid grid-cols-2 gap-y-2 gap-x-4 text-xs border-t border-theme-border-subtle pt-4">
                    <div>
                      <span className="text-theme-text-muted block text-[11px]">Version:</span>
                      <span className="font-semibold text-theme-text font-mono">
                        v{ws.config.version}
                      </span>
                    </div>
                    <div>
                      <span className="text-theme-text-muted block text-[11px]">Document ID:</span>
                      <span className="font-mono text-theme-text">
                        {ws.config.documentNumber || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-theme-text-muted block text-[11px]">Author:</span>
                      <span className="text-theme-text truncate block">
                        {ws.config.author}
                      </span>
                    </div>
                    <div>
                      <span className="text-theme-text-muted block text-[11px]">Client:</span>
                      <span className="text-theme-text truncate block">
                        {ws.config.client || "-"}
                      </span>
                    </div>
                  </div>

                  {/* Files List */}
                  <div className="mt-4 pt-3 border-t border-theme-border-subtle">
                    <span className="text-xs font-medium text-theme-text-muted block mb-2">
                      Included Markdown Files ({ws.files.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ws.files.map((file) => (
                        <span
                          key={file.filename}
                          className="inline-flex items-center text-xs px-2 py-0.5 rounded-retro bg-theme-surface-sunken border border-theme-border-subtle text-theme-text-muted font-mono"
                        >
                          {file.filename}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="bg-theme-surface-hover px-6 py-3.5 border-t-2 border-theme-border flex items-center justify-between gap-2 rounded-b-[7px]">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${ws.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-theme-text hover:text-theme-primary bg-theme-surface border border-theme-border shadow-retro-sm px-2.5 py-1.5 rounded-retro active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                      title="View Reader Mode"
                    >
                      <FileText className="w-3.5 h-3.5 text-theme-accent" />
                      <span>Reader</span>
                    </Link>

                    <Link
                      href={`/${ws.slug}/edit`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-theme-accent-text bg-theme-accent-light hover:bg-theme-accent/20 border border-theme-accent/60 shadow-retro-sm px-2.5 py-1.5 rounded-retro active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                      title="Open Web Studio Editor"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Studio</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${ws.slug}/print`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-theme-text hover:text-theme-primary bg-theme-surface border border-theme-border shadow-retro-sm px-3 py-1.5 rounded-retro active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-theme-text-muted" />
                      <span>Print A4</span>
                    </Link>

                    <ExportDropdown workspaceSlug={ws.slug} variant="primary" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
