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
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหา Workspace, ชื่อระบบ, หรือรหัสเอกสาร..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all"
            title="เปิดคลังแม่แบบเอกสาร"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>คลังแม่แบบ (Templates)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTemplateId("srs-standard");
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Workspace</span>
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          </button>
        </div>
      </div>

      {/* Quick Start Templates Shelf */}
      <div className="mb-8 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Zap className="w-3.5 h-3.5 fill-blue-600/20" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                สร้างเอกสารด่วนจากแม่แบบมาตรฐาน (Quick Start with Templates)
              </span>
              <span className="text-[10.5px] text-slate-500 block">
                เลือกแม่แบบที่ต้องการแล้วกรอกเพียงชื่อระบบ เพื่อเริ่มต้นได้ทันที
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline flex-shrink-0"
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
              className="p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 group-hover:border-blue-200 group-hover:text-blue-700 transition-colors">
                    {tpl.categoryLabel}
                  </span>
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: tpl.theme.primaryColor }}
                    title={`Primary: ${tpl.theme.primaryColor}`}
                  />
                </div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-900 transition-colors line-clamp-1">
                  {tpl.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-blue-600 font-semibold group-hover:text-blue-700">
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
            const statusColor =
              ws.config.status === "Approved"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200";

            return (
              <div
                key={ws.slug}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono">
                      {ws.slug}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${statusColor}`}
                    >
                      {ws.config.status === "Approved" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {ws.config.status || "Draft"}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 leading-snug">
                    {ws.config.title}
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    {ws.config.name}
                  </p>
                  {ws.config.subtitle && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                      {ws.config.subtitle}
                    </p>
                  )}

                  {/* Metadata Table */}
                  <div className="mt-5 grid grid-cols-2 gap-y-2 gap-x-4 text-xs border-t border-slate-100 pt-4">
                    <div>
                      <span className="text-slate-400 block">Version:</span>
                      <span className="font-semibold text-slate-700">
                        v{ws.config.version}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Document ID:</span>
                      <span className="font-mono text-slate-700">
                        {ws.config.documentNumber || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Author:</span>
                      <span className="text-slate-700 truncate block">
                        {ws.config.author}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Client:</span>
                      <span className="text-slate-700 truncate block">
                        {ws.config.client || "-"}
                      </span>
                    </div>
                  </div>

                  {/* Files List */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-400 block mb-2">
                      Included Markdown Files ({ws.files.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ws.files.map((file) => (
                        <span
                          key={file.filename}
                          className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 font-mono"
                        >
                          {file.filename}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="bg-slate-50/80 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/${ws.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
                      title="View Reader Mode"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Reader</span>
                    </Link>

                    <Link
                      href={`/${ws.slug}/edit`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors"
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
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print A4</span>
                    </Link>

                    <a
                      href={`/api/pdf?workspace=${ws.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export PDF</span>
                    </a>
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
