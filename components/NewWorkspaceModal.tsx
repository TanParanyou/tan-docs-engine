"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { CreateWorkspaceInput } from "@/lib/types";
import { useMarkdownDropzone } from "@/hooks/useMarkdownDropzone";
import MarkdownDropzone from "./common/MarkdownDropzone";
import UploadedMarkdownList from "./common/UploadedMarkdownList";
import MarkdownPreviewModal from "./common/MarkdownPreviewModal";
import Modal from "./common/Modal";
import TemplateCard from "./common/TemplateCard";
import TemplatePreviewPane from "./common/TemplatePreviewPane";
import ActionButton from "./common/ActionButton";
import {
  Layers,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Palette,
  Settings2,
  UploadCloud,
} from "lucide-react";
import {
  WORKSPACE_TEMPLATES,
  getTemplateById,
  DocumentTemplate,
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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    preselectedTemplateId || "srs-standard"
  );
  const [previewingTemplate, setPreviewingTemplate] = useState<DocumentTemplate | null>(null);

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
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", generatedSlug || "new-system");
    }

    const cleanCode = watchedName
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .substring(0, 4);
    const prefix = currentTemplate?.documentNumberPrefix || "DOC";
    setValue("documentNumber", `${prefix}-${cleanCode || "SYS"}-2026-001`);

    setValue("title", `Requirement Confirmation & System Specifications (${watchedName})`);
  }, [watchedName, isSlugCustomized, currentTemplate, setValue]);

  const onSubmit = async (data: CreateWorkspaceInput) => {
    setServerError(null);
    try {
      const payload = {
        ...data,
        templateId: selectedTemplateId,
        uploadedFiles:
          files.length > 0
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

      if (!res.ok) {
        throw new Error(json.error || "เกิดข้อผิดพลาดในการสร้าง Workspace");
      }

      handleClose();
      router.push(`/${json.slug}`);
      router.refresh();
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
      );
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        maxWidth="2xl"
        className="max-h-[92vh]"
        bodyClassName="p-0 overflow-y-auto"
        icon={<Layers className="w-4 h-4" />}
        title="สร้างเล่มเอกสารสเปกใหม่ (New Workspace)"
        badge={<Sparkles className="w-3.5 h-3.5 text-theme-warning" />}
        subtitle="เลือกแม่แบบและระบุชื่อระบบ เพื่อเริ่มร่างสเปกได้ทันทีใน 1 นาที"
      >
        {serverError && (
          <div className="px-6 py-2.5 bg-theme-danger-light border-b border-theme-danger/40 text-theme-danger text-xs flex items-center gap-2 flex-shrink-0 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-4 text-xs"
        >
          {/* 1. Template Selection Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-theme-text font-bold block text-xs">
                1. เลือกแม่แบบเอกสาร (Choose Document Template)
              </label>
              <span className="text-[11px] font-mono text-theme-text-muted">
                เลือกแล้ว: <strong className="text-theme-primary">{currentTemplate.name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WORKSPACE_TEMPLATES.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  template={tpl}
                  isSelected={selectedTemplateId === tpl.id}
                  onSelect={handleSelectTemplate}
                  onPreview={(t) => setPreviewingTemplate(t)}
                  variant="compact"
                />
              ))}
            </div>
          </div>

          {/* 2. Essential Project Information */}
          <div className="space-y-3 pt-2">
            <label className="text-theme-text font-bold block text-xs">
              2. ข้อมูลโครงการ (Project Details)
            </label>

            {/* Project Name Input (Hero Focus) */}
            <div>
              <label className="text-theme-text font-semibold block mb-1">
                ชื่อระบบ / โครงการ (Project Name) *
              </label>
              <input
                type="text"
                {...register("name", { required: "กรุณาระบุชื่อระบบหรือโครงการ" })}
                placeholder="เช่น Loyalty Points System, POS & Billing Platform"
                autoFocus
                className="w-full px-3.5 py-2 bg-theme-surface border-2 border-theme-border rounded-retro text-sm text-theme-text focus:outline-none focus:border-theme-primary font-medium placeholder:text-theme-text-faint shadow-retro-sm"
              />
              {errors.name ? (
                <p className="text-theme-danger text-[10.5px] mt-1 font-mono font-medium">
                  {errors.name.message}
                </p>
              ) : (
                <div className="flex items-center gap-2 text-[11px] text-theme-text-muted mt-1 font-mono">
                  <span>
                    โฟลเดอร์: /{watchedSlug || "project-slug"}
                  </span>
                  <span>•</span>
                  <span>รหัส: {watchedDocNumber || "DOC-SYS-2026-001"}</span>
                </div>
              )}
            </div>

            {/* Client Name Input (Optional) */}
            <div>
              <label className="text-theme-text font-semibold block mb-1">
                ลูกค้า / ผู้ว่าจ้าง (Client Name)
                <span className="text-[10.5px] text-theme-text-muted font-normal ml-1">
                  (ไม่บังคับ)
                </span>
              </label>
              <input
                type="text"
                {...register("client")}
                placeholder="เช่น บริษัท รีเทล อินเตอร์เนชั่นแนล จำกัด"
                className="w-full px-3 py-1.5 bg-theme-surface border border-theme-border rounded-retro text-xs text-theme-text focus:outline-none focus:border-theme-primary shadow-retro-sm"
              />
            </div>
          </div>

          {/* 3. Collapsible Advanced Options & Markdown File Import */}
          <div className="border-t border-theme-border-subtle pt-2">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full py-2 flex items-center justify-between text-theme-text hover:text-theme-primary transition-colors text-xs font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-theme-primary" />
                <span>ตั้งค่าเพิ่มเติม & นำเข้าไฟล์ Markdown</span>
                <span className="text-[10px] text-theme-text-muted font-normal">
                  (Slug, เลขที่เอกสาร, ผู้จัดทำ, สีธีม, อัปโหลดไฟล์ .md)
                </span>
              </div>
              {isAdvancedOpen ? (
                <ChevronUp className="w-4 h-4 text-theme-text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-theme-text-muted" />
              )}
            </button>

            {isAdvancedOpen && (
              <div className="p-4 bg-theme-surface-sunken rounded-retro border-2 border-theme-border mt-1 space-y-4 animate-fade-in shadow-retro-sm">
                {/* Slug & Document ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-theme-text font-semibold block mb-1">
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
                      className="w-full px-2.5 py-1.5 bg-theme-surface border border-theme-border rounded-retro text-xs text-theme-text focus:outline-none focus:border-theme-primary font-mono shadow-retro-sm"
                    />
                    {errors.slug && (
                      <p className="text-theme-danger text-[10px] mt-0.5 font-mono">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-theme-text font-semibold block mb-1">
                      เลขที่เอกสาร (Document ID)
                    </label>
                    <input
                      type="text"
                      {...register("documentNumber")}
                      placeholder="DOC-LOY-2026-001"
                      className="w-full px-2.5 py-1.5 bg-theme-surface border border-theme-border rounded-retro text-xs text-theme-text focus:outline-none focus:border-theme-primary font-mono shadow-retro-sm"
                    />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <label className="text-theme-text font-semibold block mb-1">
                    หัวข้อเอกสาร (Document Title)
                  </label>
                  <input
                    type="text"
                    {...register("title")}
                    placeholder="Requirement Confirmation & System Specifications"
                    className="w-full px-2.5 py-1.5 bg-theme-surface border border-theme-border rounded-retro text-xs text-theme-text focus:outline-none focus:border-theme-primary shadow-retro-sm"
                  />
                </div>

                <div>
                  <label className="text-theme-text font-semibold block mb-1">
                    คำอธิบายย่อย (Subtitle)
                  </label>
                  <input
                    type="text"
                    {...register("subtitle")}
                    placeholder="เอกสารยืนยันขอบเขตความต้องการและสถาปัตยกรรมระบบ"
                    className="w-full px-2.5 py-1.5 bg-theme-surface border border-theme-border rounded-retro text-xs text-theme-text focus:outline-none focus:border-theme-primary shadow-retro-sm"
                  />
                </div>

                {/* Author & Organization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-theme-text font-semibold block mb-1">
                      ผู้จัดทำ (Author)
                    </label>
                    <input
                      type="text"
                      {...register("author", { required: "กรุณาระบุผู้จัดทำ" })}
                      className="w-full px-2.5 py-1.5 bg-theme-surface border border-theme-border rounded-retro text-xs text-theme-text focus:outline-none focus:border-theme-primary shadow-retro-sm"
                    />
                  </div>

                  <div>
                    <label className="text-theme-text font-semibold block mb-1">
                      หน่วยงาน (Organization)
                    </label>
                    <input
                      type="text"
                      {...register("organization")}
                      className="w-full px-2.5 py-1.5 bg-theme-surface border border-theme-border rounded-retro text-xs text-theme-text focus:outline-none focus:border-theme-primary shadow-retro-sm"
                    />
                  </div>
                </div>

                {/* Theme Colors */}
                <div>
                  <label className="text-theme-text font-semibold block mb-1.5 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-theme-primary" />
                    <span>ชุดสีธีมเอกสาร (Theme Color Palette)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-theme-text-muted text-[10.5px] block mb-1">
                        Primary Color (สีหลัก/หัวข้อ)
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          {...register("theme.primaryColor")}
                          className="w-7 h-7 rounded-retro border border-theme-border cursor-pointer bg-transparent"
                        />
                        <span className="font-mono text-theme-text text-xs">
                          {primaryColor}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-theme-text-muted text-[10.5px] block mb-1">
                        Accent Color (สีเน้น/เส้นคั่น)
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          {...register("theme.accentColor")}
                          className="w-7 h-7 rounded-retro border border-theme-border cursor-pointer bg-transparent"
                        />
                        <span className="font-mono text-theme-text text-xs">
                          {accentColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional File Upload Dropzone */}
                <div className="border-t border-theme-border-subtle pt-3 space-y-2">
                  <label className="text-theme-text font-semibold block mb-1 flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5 text-theme-primary" />
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
                    <div className="p-2 bg-theme-warning-light border border-theme-warning/40 text-theme-warning rounded-retro text-[11px] flex items-center gap-1.5 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-theme-warning" />
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
          <div className="border-t-2 border-theme-border pt-4 flex items-center justify-between">
            <div className="text-[11px] text-theme-text-muted font-mono">
              {files.length > 0 ? (
                <span>
                  นำเข้าไฟล์: <strong className="text-theme-text">{files.length} ไฟล์</strong>
                </span>
              ) : (
                <span>
                  แม่แบบ: <strong className="text-theme-primary">{currentTemplate?.name}</strong> ({currentTemplate?.files.length} ไฟล์)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2.5">
              <ActionButton
                variant="secondary"
                size="md"
                onClick={handleClose}
              >
                ยกเลิก
              </ActionButton>
              <ActionButton
                variant="primary"
                size="md"
                type="submit"
                isLoading={isSubmitting}
                loadingText="กำลังสร้าง..."
              >
                สร้าง Workspace
              </ActionButton>
            </div>
          </div>
        </form>
      </Modal>

      {/* Quick Template Preview Modal using Base Modal & TemplatePreviewPane */}
      {previewingTemplate && (
        <Modal
          isOpen={Boolean(previewingTemplate)}
          onClose={() => setPreviewingTemplate(null)}
          maxWidth="4xl"
          className="h-[85vh] max-h-[800px]"
          bodyClassName="flex flex-col p-0 overflow-hidden"
          icon={<Layers className="w-4 h-4" />}
          title={`ตัวอย่างแม่แบบ: ${previewingTemplate.name}`}
          badge={
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-retro bg-theme-accent-light text-theme-accent-text border border-theme-accent/40">
              {previewingTemplate.categoryLabel}
            </span>
          }
          subtitle={previewingTemplate.description}
        >
          <TemplatePreviewPane
            template={previewingTemplate}
            projectName={watchedName}
            onUseTemplate={(tpl) => {
              handleSelectTemplate(tpl);
              setPreviewingTemplate(null);
            }}
            useButtonText="เลือกแม่แบบนี้"
          />
        </Modal>
      )}

      {/* Markdown Preview Modal */}
      <MarkdownPreviewModal
        file={activePreviewFile}
        onClose={closePreview}
      />
    </>
  );
}
