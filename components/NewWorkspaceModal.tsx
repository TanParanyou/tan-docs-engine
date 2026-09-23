"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { CreateWorkspaceInput } from "@/lib/types";
import { useMarkdownDropzone } from "@/hooks/useMarkdownDropzone";
import MarkdownDropzone from "./common/MarkdownDropzone";
import UploadedMarkdownList from "./common/UploadedMarkdownList";
import MarkdownPreviewModal from "./common/MarkdownPreviewModal";
import {
  X,
  Layers,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  FileCode2,
  Check,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Server,
  Briefcase,
  FilePlus2,
  UploadCloud,
  Palette,
  Eye,
  Settings2,
} from "lucide-react";
import {
  WORKSPACE_TEMPLATES,
  getTemplateById,
  DocumentTemplate,
  TemplateCategory,
  interpolateTemplateContent,
} from "@/lib/document-templates";
import { renderMarkdown } from "@/lib/markdown";

interface NewWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTemplateId?: string;
}

export default function NewWorkspaceModal({
  isOpen,
  onClose,
  preselectedTemplateId,
}: NewWorkspaceModalProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    preselectedTemplateId || "srs-standard"
  );
  const [previewingTemplate, setPreviewingTemplate] = useState<DocumentTemplate | null>(null);
  const [previewFileIdx, setPreviewFileIdx] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceInput>({
    defaultValues: {
      slug: "",
      name: "",
      title: "",
      subtitle: "",
      documentNumber: "",
      version: "1.0.0",
      status: "Draft",
      author: "Tan System Architecture Team",
      client: "",
      organization: "TAN TECHNOLOGY SOLUTIONS",
      theme: {
        primaryColor: "#0f2b48",
        accentColor: "#2563eb",
      },
    },
  });

  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  const watchedDocNumber = watch("documentNumber");
  const primaryColor = watch("theme.primaryColor") || "#0f2b48";
  const accentColor = watch("theme.accentColor") || "#2563eb";

  const {
    files,
    isDragging,
    error: dropzoneError,
    activePreviewFile,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    removeFile,
    moveFile,
    clearFiles,
    openPreview,
    closePreview,
  } = useMarkdownDropzone({
    onFirstFileDetected: (firstFile) => {
      if (!watchedName && firstFile.previewTitle) {
        setValue("name", firstFile.previewTitle, { shouldValidate: true });
      }
    },
  });

  const currentTemplate =
    getTemplateById(selectedTemplateId) || WORKSPACE_TEMPLATES[0];

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplateId(template.id);
    setValue("theme.primaryColor", template.theme.primaryColor);
    setValue("theme.accentColor", template.theme.accentColor);
    setValue("subtitle", template.subtitle);

    const cleanCode = (watchedName || "SYS")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .substring(0, 4);
    setValue(
      "documentNumber",
      `${template.documentNumberPrefix}-${cleanCode || "SYS"}-2026-001`
    );
  };

  useEffect(() => {
    if (preselectedTemplateId) {
      const tpl = getTemplateById(preselectedTemplateId);
      if (tpl) {
        handleSelectTemplate(tpl);
      }
    }
  }, [preselectedTemplateId]);

  const handleClose = () => {
    reset();
    clearFiles();
    setServerError(null);
    setIsAdvancedOpen(false);
    setSelectedTemplateId(preselectedTemplateId || "srs-standard");
    onClose();
  };

  // Auto-generate slug and doc number when project name changes
  useEffect(() => {
    if (!watchedName) return;

    if (!isSlugCustomized) {
      const generatedSlug = watchedName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }

    const cleanCode = watchedName
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .substring(0, 4);
    if (cleanCode) {
      const prefix = currentTemplate ? currentTemplate.documentNumberPrefix : "DOC-SYS";
      setValue("documentNumber", `${prefix}-${cleanCode}-2026-001`);
    }
  }, [watchedName, isSlugCustomized, setValue, currentTemplate]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: TemplateCategory) => {
    switch (category) {
      case "srs":
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case "requirement":
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      case "api":
        return <Server className="w-4 h-4 text-purple-600" />;
      case "erp":
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      default:
        return <FilePlus2 className="w-4 h-4 text-slate-600" />;
    }
  };

  const onSubmit = async (data: CreateWorkspaceInput) => {
    setServerError(null);

    try {
      const title =
        data.title ||
        (currentTemplate
          ? `${data.name} ${currentTemplate.title}`
          : `${data.name} Requirement Confirmation & System Specifications`);

      const hasUploadedFiles = files.length > 0;

      const payload: CreateWorkspaceInput = {
        ...data,
        title,
        templateId: hasUploadedFiles ? undefined : selectedTemplateId,
        initialFiles: hasUploadedFiles
          ? files.map((f) => ({
              filename: f.filename,
              content: f.content,
            }))
          : undefined,
      };

      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create workspace");
      }

      reset();
      clearFiles();
      onClose();
      // Direct navigation to Studio for immediate authoring
      router.push(`/${json.data.slug}/edit`);
    } catch (err: any) {
      setServerError(err.message || "Failed to create workspace");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in">
        <div
          className="bg-theme-surface rounded-retro shadow-retro-lg border-2 border-theme-border w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 bg-theme-surface-sunken border-b-2 border-theme-border text-theme-text flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-retro bg-theme-primary flex items-center justify-center text-theme-primary-text border border-theme-border shadow-retro-sm">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base tracking-tight flex items-center gap-1.5 text-theme-text m-0 p-0 border-none font-sans">
                  <span>สร้างเล่มเอกสารสเปกใหม่ (New Workspace)</span>
                  <Sparkles className="w-3.5 h-3.5 text-theme-warning" />
                </h2>
                <p className="text-xs text-theme-text-muted m-0 mt-0.5">
                  เลือกแม่แบบและระบุชื่อระบบ เพื่อเริ่มร่างสเปกได้ทันทีใน 1 นาที
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              type="button"
              className="p-1.5 rounded-retro hover:bg-theme-surface-hover text-theme-text-muted hover:text-theme-text border border-theme-border cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {serverError && (
            <div className="px-6 py-2.5 bg-theme-danger-light border-b border-theme-danger/40 text-theme-danger text-xs flex items-center gap-2 flex-shrink-0 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-4 overflow-y-auto text-xs flex-1"
          >
            {/* 1. Template Selection Grid */}
            <div className="space-y-2">
              <label className="text-slate-800 font-bold block text-xs">
                1. เลือกแม่แบบเอกสาร (Choose Document Template)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {WORKSPACE_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5">
                            {getCategoryIcon(tpl.category)}
                            <span
                              className={`text-xs font-bold leading-tight ${
                                isSelected ? "text-blue-950" : "text-slate-800"
                              }`}
                            >
                              {tpl.name}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <p className="text-[10.5px] text-slate-500 line-clamp-2 leading-relaxed mt-0.5">
                          {tpl.description}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-600 flex items-center gap-1">
                            <FileCode2 className="w-3 h-3 text-slate-400" />
                            <span>{tpl.files.length} ไฟล์</span>
                          </span>
                          {tpl.files.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewingTemplate(tpl);
                                setPreviewFileIdx(0);
                              }}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/60 transition-colors"
                              title="ดูตัวอย่างไฟล์และเนื้อหา Markdown"
                            >
                              <Eye className="w-2.5 h-2.5" />
                              <span>ดูตัวอย่าง</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center -space-x-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white"
                            style={{ backgroundColor: tpl.theme.primaryColor }}
                            title={`Primary Color`}
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white"
                            style={{ backgroundColor: tpl.theme.accentColor }}
                            title={`Accent Color`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Essential Project Information */}
            <div className="space-y-3 pt-1">
              <label className="text-slate-800 font-bold block text-xs">
                2. ข้อมูลโครงการ (Project Details)
              </label>

              {/* Project Name Input (Hero Focus) */}
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  ชื่อระบบ / โครงการ (Project Name) *
                </label>
                <input
                  type="text"
                  {...register("name", { required: "กรุณาระบุชื่อระบบหรือโครงการ" })}
                  placeholder="เช่น Loyalty Points System, POS & Billing Platform"
                  autoFocus
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder:text-slate-400 shadow-2xs"
                />
                {errors.name ? (
                  <p className="text-red-500 text-[10.5px] mt-1 font-medium">
                    {errors.name.message}
                  </p>
                ) : (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 font-mono">
                    <span>
                      โฟลเดอร์: /workspaces/{watchedSlug || "project-slug"}
                    </span>
                    <span>•</span>
                    <span>รหัส: {watchedDocNumber || "DOC-SYS-2026-001"}</span>
                  </div>
                )}
              </div>

              {/* Client Name Input (Optional) */}
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  ลูกค้า / ผู้ว่าจ้าง (Client Name)
                  <span className="text-[10.5px] text-slate-400 font-normal ml-1">
                    (ไม่บังคับ)
                  </span>
                </label>
                <input
                  type="text"
                  {...register("client")}
                  placeholder="เช่น บริษัท รีเทล อินเตอร์เนชั่นแนล จำกัด"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 3. Collapsible Advanced Options & Markdown File Import */}
            <div className="border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full py-2 flex items-center justify-between text-slate-600 hover:text-slate-900 transition-colors text-xs font-semibold"
              >
                <div className="flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>ตั้งค่าเพิ่มเติม & นำเข้าไฟล์ Markdown</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Slug, เลขที่เอกสาร, ผู้จัดทำ, สีธีม, อัปโหลดไฟล์ .md)
                  </span>
                </div>
                {isAdvancedOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isAdvancedOpen && (
                <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 mt-1 space-y-4 animate-fade-in">
                  {/* Slug & Document ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">
                        Workspace Slug (ชื่อโฟลเดอร์)
                      </label>
                      <input
                        type="text"
                        {...register("slug", {
                          required: "กรุณาระบุ Workspace ID",
                          pattern: {
                            value: /^[a-zA-Z0-9_-]+$/,
                            message: "ใช้อักษรภาษาอังกฤษ, ตัวเลข, - หรือ _ เท่านั้น",
                          },
                        })}
                        onChange={(e) => {
                          setIsSlugCustomized(true);
                          setValue("slug", e.target.value);
                        }}
                        placeholder="loyalty-point-system"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                      {errors.slug && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {errors.slug.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">
                        เลขที่เอกสาร (Document ID)
                      </label>
                      <input
                        type="text"
                        {...register("documentNumber")}
                        placeholder="DOC-LOY-2026-001"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      หัวข้อเอกสาร (Document Title)
                    </label>
                    <input
                      type="text"
                      {...register("title")}
                      placeholder="Requirement Confirmation & System Specifications"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      คำอธิบายย่อย (Subtitle)
                    </label>
                    <input
                      type="text"
                      {...register("subtitle")}
                      placeholder="เอกสารยืนยันขอบเขตความต้องการและสถาปัตยกรรมระบบ"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Author & Organization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">
                        ผู้จัดทำ (Author)
                      </label>
                      <input
                        type="text"
                        {...register("author", { required: "กรุณาระบุผู้จัดทำ" })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">
                        หน่วยงาน (Organization)
                      </label>
                      <input
                        type="text"
                        {...register("organization")}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Theme Colors */}
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-blue-600" />
                      <span>ชุดสีธีมเอกสาร (Theme Color Palette)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-500 text-[10.5px] block mb-1">
                          Primary Color (สีหลัก/หัวข้อ)
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            {...register("theme.primaryColor")}
                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                          />
                          <span className="font-mono text-slate-700 text-xs">
                            {primaryColor}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[10.5px] block mb-1">
                          Accent Color (สีเน้น/เส้นคั่น)
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            {...register("theme.accentColor")}
                            className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                          />
                          <span className="font-mono text-slate-700 text-xs">
                            {accentColor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optional File Upload Dropzone */}
                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <label className="text-slate-700 font-semibold block mb-1 flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                      <span>หรือ นำเข้าไฟล์ Markdown (.md) ภายนอก</span>
                    </label>
                    <MarkdownDropzone
                      isDragging={isDragging}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onFileInputChange={handleFileInputChange}
                    />

                    {dropzoneError && (
                      <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                        <span>{dropzoneError}</span>
                      </div>
                    )}

                    <UploadedMarkdownList
                      files={files}
                      onPreview={openPreview}
                      onRemove={removeFile}
                      onMove={moveFile}
                      onClear={clearFiles}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                {files.length > 0 ? (
                  <span>
                    นำเข้าไฟล์: <strong>{files.length} ไฟล์</strong>
                  </span>
                ) : (
                  <span>
                    แม่แบบ: <strong>{currentTemplate?.name}</strong> ({currentTemplate?.files.length} ไฟล์)
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-theme-text hover:bg-theme-surface-hover bg-theme-surface border border-theme-border rounded-retro shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-theme-primary-text bg-theme-primary hover:bg-theme-primary-hover border-2 border-theme-border rounded-retro shadow-retro active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังสร้าง...</span>
                    </>
                  ) : (
                    <>
                      <span>สร้าง Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Quick Template Preview Modal */}
      {previewingTemplate && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[85vh] max-h-[800px] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-100">
                      ตัวอย่างแม่แบบ: {previewingTemplate.name}
                    </h3>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                      {previewingTemplate.categoryLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {previewingTemplate.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectTemplate(previewingTemplate);
                    setPreviewingTemplate(null);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>เลือกแม่แบบนี้</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewingTemplate(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* File Switcher Tabs */}
            {previewingTemplate.files.length > 0 ? (
              <>
                <div className="px-5 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
                  <span className="text-[10.5px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                    <FileCode2 className="w-3 h-3 text-slate-400" />
                    <span>ไฟล์ ({previewingTemplate.files.length}):</span>
                  </span>
                  {previewingTemplate.files.map((file, idx) => (
                    <button
                      key={file.filename}
                      type="button"
                      onClick={() => setPreviewFileIdx(idx)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                        previewFileIdx === idx
                          ? "bg-white text-blue-600 shadow-xs border border-slate-300 font-semibold"
                          : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                      }`}
                    >
                      {file.filename}
                    </button>
                  ))}
                </div>

                {/* Markdown Rendered Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                  <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-xs max-w-3xl mx-auto">
                    <div
                      className="doc-content prose prose-slate max-w-none text-slate-800 text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(
                          interpolateTemplateContent(
                            previewingTemplate.files[previewFileIdx]?.content || "",
                            {
                              projectName: watchedName || "ตัวอย่างโครงการ",
                              title: `${watchedName || "โครงการ"} ${previewingTemplate.title}`,
                              author: "Tan System Architecture Team",
                              organization: "TAN TECHNOLOGY SOLUTIONS",
                              client: "Client Name",
                              date: new Date().toLocaleDateString("th-TH"),
                            }
                          )
                        ),
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
                แม่แบบเอกสารเปล่า (ไม่มีไฟล์เริ่มต้น)
              </div>
            )}

            {/* Footer */}
            <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
              <span className="text-[11px] text-slate-500">
                ไฟล์ปัจจุบัน: <code className="font-mono text-slate-700 font-semibold">{previewingTemplate.files[previewFileIdx]?.filename || "-"}</code>
              </span>
              <button
                type="button"
                onClick={() => setPreviewingTemplate(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
              >
                ปิดหน้าต่างตัวอย่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Markdown Preview Modal */}
      <MarkdownPreviewModal
        file={activePreviewFile}
        onClose={closePreview}
      />
    </>
  );
}
