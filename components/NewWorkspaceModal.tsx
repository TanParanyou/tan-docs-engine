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
  Plus,
  Layers,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  FileCode2,
  Check,
  BookOpen,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Server,
  Briefcase,
  FilePlus2,
  UploadCloud,
  Palette,
} from "lucide-react";
import {
  WORKSPACE_TEMPLATES,
  getTemplateById,
  DocumentTemplate,
  TemplateCategory,
} from "@/lib/document-templates";

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
  const [creationTab, setCreationTab] = useState<"template" | "import">("template");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    preselectedTemplateId || "srs-standard"
  );

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
        primaryColor: "#0f172a",
        accentColor: "#2563eb",
      },
    },
  });

  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  const watchedDocNumber = watch("documentNumber");
  const primaryColor = watch("theme.primaryColor") || "#0f172a";
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

  const onSubmit = async (data: CreateWorkspaceInput) => {
    setServerError(null);

    try {
      const title =
        data.title ||
        (currentTemplate
          ? `${data.name} ${currentTemplate.title}`
          : `${data.name} Requirement Confirmation & System Specifications`);

      const hasUploadedFiles = creationTab === "import" && files.length > 0;

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
        <div
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base tracking-tight flex items-center gap-1.5">
                  <span>สร้างเล่มเอกสารสเปกใหม่ (New Workspace)</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h2>
                <p className="text-xs text-slate-400">
                  เลือกแม่แบบและระบุชื่อระบบ เพื่อเริ่มร่างสเปกได้ทันทีใน 1 นาที
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              type="button"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="px-6 pt-3 pb-2 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setCreationTab("template")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                creationTab === "template"
                  ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>เลือกแม่แบบเอกสาร (Templates)</span>
            </button>

            <button
              type="button"
              onClick={() => setCreationTab("import")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                creationTab === "import"
                  ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>นำเข้าไฟล์ Markdown (.md)</span>
              {files.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {files.length}
                </span>
              )}
            </button>
          </div>

          {serverError && (
            <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-xs flex items-center gap-2 flex-shrink-0">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-4 overflow-y-auto text-xs flex-1"
          >
            {/* TAB 1: TEMPLATE MODE */}
            {creationTab === "template" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>1. เลือกแม่แบบเอกสารที่ต้องการ</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    คลิกเพื่อเปลี่ยนแม่แบบ
                  </span>
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {WORKSPACE_TEMPLATES.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => handleSelectTemplate(tpl)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/15"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-1.5">
                              {getCategoryIcon(tpl.category)}
                              <span
                                className={`text-xs font-bold ${
                                  isSelected ? "text-blue-950" : "text-slate-800"
                                }`}
                              >
                                {tpl.name}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal">
                            {tpl.description}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-medium text-slate-600 flex items-center gap-1">
                            <FileCode2 className="w-3 h-3 text-slate-400" />
                            <span>{tpl.files.length} ไฟล์มาตรฐาน</span>
                          </span>
                          <div className="flex items-center -space-x-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white"
                              style={{ backgroundColor: tpl.theme.primaryColor }}
                            />
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white"
                              style={{ backgroundColor: tpl.theme.accentColor }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Template Files Info Banner */}
                {currentTemplate && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="font-semibold text-slate-700 flex-shrink-0">
                        โครงสร้างที่จะสร้าง:
                      </span>
                      <span className="truncate font-mono text-[10.5px] text-slate-500">
                        {currentTemplate.files.map((f) => f.filename).join(", ")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: IMPORT MARKDOWN MODE */}
            {creationTab === "import" && (
              <div className="space-y-3">
                <div>
                  <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <FileCode2 className="w-4 h-4 text-blue-600" />
                    <span>นำเข้าไฟล์ Markdown (.md)</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ลากไฟล์ .md หรือเลือกหลายไฟล์ ระบบจะนำเข้าเป็นเนื้อหาเริ่มต้นของ Workspace
                  </p>
                </div>

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
            )}

            {/* ESSENTIAL PROJECT INFO (Simple, Easy to use) */}
            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                {creationTab === "template"
                  ? "2. ข้อมูลโครงการ (Project Information)"
                  : "ข้อมูลโครงการ"}
              </span>

              {/* Project Name */}
              <div>
                <label className="text-slate-800 font-semibold block mb-1">
                  ชื่อระบบ / โครงการ (Project Name) *
                </label>
                <input
                  type="text"
                  {...register("name", { required: "กรุณาระบุชื่อระบบหรือโครงการ" })}
                  placeholder="e.g. Loyalty Points System, POS & Billing"
                  autoFocus
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder:text-slate-400 shadow-2xs"
                />
                {errors.name ? (
                  <p className="text-red-500 text-[10.5px] mt-1">
                    {errors.name.message}
                  </p>
                ) : (
                  <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-1 font-mono">
                    <span>
                      โฟลเดอร์: /workspaces/{watchedSlug || "project-slug"}
                    </span>
                    <span>•</span>
                    <span>รหัส: {watchedDocNumber || "DOC-SYS-2026-001"}</span>
                  </div>
                )}
              </div>

              {/* Client (Optional) */}
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  ลูกค้า / ผู้ว่าจ้าง (Client Name)
                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                    (ไม่บังคับ)
                  </span>
                </label>
                <input
                  type="text"
                  {...register("client")}
                  placeholder="e.g. Retail Enterprise Co., Ltd."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* COLLAPSIBLE ADVANCED OPTIONS (Keeps UI clean and simple) */}
            <div className="border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full py-2 flex items-center justify-between text-slate-600 hover:text-slate-900 transition-colors text-xs font-semibold"
              >
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  <span>การตั้งค่าเพิ่มเติม (Advanced Options)</span>
                  <span className="text-[10.5px] text-slate-400 font-normal">
                    (Slug, เลขที่เอกสาร, ผู้จัดทำ, สีธีม)
                  </span>
                </div>
                {isAdvancedOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isAdvancedOpen && (
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 mt-1 space-y-3 animate-fade-in">
                  {/* Slug & Document ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">
                        Workspace ID / Slug (โฟลเดอร์)
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
                          Primary Color (สีหลัก)
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
                          Accent Color (สีเน้น)
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
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                {creationTab === "template" ? (
                  <span>
                    แม่แบบ: <strong>{currentTemplate?.name}</strong>
                  </span>
                ) : (
                  <span>
                    ไฟล์นำเข้า: <strong>{files.length} ไฟล์</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังสร้าง...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>
                        {creationTab === "import" && files.length > 0
                          ? `สร้าง Workspace พร้อม ${files.length} ไฟล์`
                          : "สร้างเล่มเอกสาร & เข้าสู่ Studio"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Markdown Preview Modal */}
      <MarkdownPreviewModal
        file={activePreviewFile}
        onClose={closePreview}
      />
    </>
  );
}
