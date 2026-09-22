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
} from "lucide-react";

interface NewWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewWorkspaceModal({
  isOpen,
  onClose,
}: NewWorkspaceModalProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);

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
      // Auto-suggest project name or title from first file H1 if not yet filled
      if (!watchedName && firstFile.previewTitle) {
        setValue("name", firstFile.previewTitle, { shouldValidate: true });
      }
    },
  });

  const handleClose = () => {
    reset();
    clearFiles();
    setServerError(null);
    onClose();
  };

  // Auto-generate slug and doc number from project name
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
      setValue("documentNumber", `DOC-${cleanCode}-2026-001`);
    }
  }, [watchedName, isSlugCustomized, setValue]);

  if (!isOpen) return null;

  const onSubmit = async (data: CreateWorkspaceInput) => {
    setServerError(null);

    try {
      const title =
        data.title ||
        `${data.name} Requirement Confirmation & System Specifications`;

      const payload: CreateWorkspaceInput = {
        ...data,
        title,
        initialFiles:
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
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create workspace");
      }

      reset();
      clearFiles();
      onClose();
      // Navigate to Studio for immediate authoring
      router.push(`/${json.data.slug}/edit`);
    } catch (err: any) {
      setServerError(err.message || "Failed to create workspace");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
        <div
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/30">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base tracking-tight flex items-center gap-1.5">
                  <span>Create New Docs Workspace</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h2>
                <p className="text-xs text-slate-400">
                  สร้างเล่มเอกสารสเปกใหม่ หรือนำเข้าไฟล์ Markdown (.md)
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              type="button"
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {serverError && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-red-700 text-xs flex items-center gap-2 flex-shrink-0">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Modal Form via React Hook Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-4 overflow-y-auto text-xs flex-1"
          >
            {/* Project Name */}
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                ชื่อระบบ / โครงการ (Project Name) *
              </label>
              <input
                type="text"
                {...register("name", { required: "กรุณาระบุชื่อระบบหรือโครงการ" })}
                placeholder="e.g. Loyalty Point System"
                autoFocus
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {errors.name && (
                <p className="text-red-500 text-[10px] mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Slug & Document ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Workspace ID / Slug (โฟลเดอร์) *
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
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                {errors.slug ? (
                  <p className="text-red-500 text-[10px] mt-0.5">{errors.slug.message}</p>
                ) : (
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    เก็บใน /workspaces/{watchedSlug || "slug"}
                  </span>
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
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Document Title */}
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                หัวข้อเอกสาร (Document Title)
              </label>
              <input
                type="text"
                {...register("title")}
                placeholder="Requirement Confirmation & System Specifications"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                คำอธิบายย่อย (Subtitle)
              </label>
              <input
                type="text"
                {...register("subtitle")}
                placeholder="เอกสารยืนยันขอบเขตความต้องการและสถาปัตยกรรมระบบ"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Author & Client */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  ผู้จัดทำ (Author) *
                </label>
                <input
                  type="text"
                  {...register("author", { required: "กรุณาระบุผู้จัดทำ" })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.author && (
                  <p className="text-red-500 text-[10px] mt-1">{errors.author.message}</p>
                )}
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  ลูกค้า / ผู้ว่าจ้าง (Client)
                </label>
                <input
                  type="text"
                  {...register("client")}
                  placeholder="Enterprise Customer Co., Ltd."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Markdown Files Upload Section */}
            <div className="border-t border-slate-100 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <FileCode2 className="w-4 h-4 text-blue-600" />
                    <span>นำเข้าไฟล์ Markdown (.md)</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (ไม่บังคับ - ลากวางหรือเลือกหลายไฟล์)
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    หากมีไฟล์ .md ระบบจะนำเข้าเป็นเนื้อหาเริ่มต้นของ Workspace แทนเทมเพลตมาตรฐาน
                  </p>
                </div>
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

            {/* Theme Colors */}
            <div className="border-t border-slate-100 pt-3">
              <label className="text-slate-700 font-semibold block mb-2">
                ชุดสีธีมเอกสาร (Theme Color Palette)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 text-[11px] block mb-1">
                    Primary Color (สีหลัก/หัวเรื่อง)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      {...register("theme.primaryColor")}
                      className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                    />
                    <span className="font-mono text-slate-700 text-xs">{primaryColor}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block mb-1">
                    Accent Color (สีเน้น/เส้นคั่น)
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      {...register("theme.accentColor")}
                      className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
                    />
                    <span className="font-mono text-slate-700 text-xs">{accentColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-all"
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
                      {files.length > 0
                        ? `สร้าง Workspace พร้อม ${files.length} ไฟล์`
                        : "สร้างเล่มเอกสาร & เข้าสู่ Studio"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
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
