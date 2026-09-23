"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { DocsConfig } from "@/lib/types";
import { Settings, Save, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";

interface WorkspaceSettingsDrawerProps {
  slug: string;
  config: DocsConfig;
  onUpdateConfig: (updated: Partial<DocsConfig>) => Promise<void>;
}

export default function WorkspaceSettingsDrawer({
  slug: _slug,
  config,
  onUpdateConfig,
}: WorkspaceSettingsDrawerProps) {
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DocsConfig>({
    defaultValues: config,
  });

  // Watch colors for live color picker preview
  const primaryColor = watch("theme.primaryColor") || config.theme?.primaryColor || "#0f3b6c";
  const accentColor = watch("theme.accentColor") || config.theme?.accentColor || "#1d4ed8";

  // Keep form in sync if external config changes
  useEffect(() => {
    reset(config);
  }, [config, reset]);

  const onSubmit = async (data: DocsConfig) => {
    setStatusMessage(null);
    try {
      await onUpdateConfig(data);
      reset(data); // Mark form as pristine after successful save
      setStatusMessage({
        type: "success",
        text: "บันทึกการตั้งค่าเอกสาร (docs.config.json) เรียบร้อยแล้ว!",
      });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update settings",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-theme-surface border-r-2 border-theme-border text-theme-text overflow-y-auto select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b-2 border-theme-border bg-theme-surface-sunken flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-theme-primary" />
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-theme-text">
            Settings (docs.config.json)
          </span>
        </div>
        {isDirty && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-retro bg-theme-warning-light text-theme-warning border border-theme-warning/40 font-bold animate-pulse shadow-2xs">
            Unsaved Changes
          </span>
        )}
      </div>

      {statusMessage && (
        <div
          className={`px-4 py-2.5 text-xs flex items-center gap-2 border-b font-medium ${
            statusMessage.type === "success"
              ? "bg-theme-success-light text-theme-success border-theme-success/40"
              : "bg-theme-danger-light text-theme-danger border-theme-danger/40"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-theme-success flex-shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-theme-danger flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Form using React Hook Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 text-xs font-sans">
        {/* Project Name */}
        <div>
          <label className="text-theme-text font-bold block mb-1 text-[11px]">
            ชื่อโปรเจกต์ (Project Name) *
          </label>
          <input
            type="text"
            {...register("name", { required: "กรุณาระบุชื่อระบบ/โปรเจกต์" })}
            className="w-full px-2.5 py-1.5 bg-theme-surface-sunken border-2 border-theme-border rounded-retro text-theme-text placeholder:text-theme-text-faint focus:outline-none focus:border-theme-primary shadow-retro-sm font-semibold text-xs"
          />
          {errors.name && (
            <p className="text-theme-danger text-[10px] font-medium mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Document Title */}
        <div>
          <label className="text-theme-text font-bold block mb-1 text-[11px]">
            หัวข้อเอกสาร (Document Title) *
          </label>
          <input
            type="text"
            {...register("title", { required: "กรุณาระบุหัวข้อเอกสาร" })}
            className="w-full px-2.5 py-1.5 bg-theme-surface-sunken border-2 border-theme-border rounded-retro text-theme-text placeholder:text-theme-text-faint focus:outline-none focus:border-theme-primary shadow-retro-sm font-semibold text-xs"
          />
          {errors.title && (
            <p className="text-theme-danger text-[10px] font-medium mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Subtitle */}
        <div>
          <label className="text-theme-text font-bold block mb-1 text-[11px]">
            คำอธิบายย่อย (Subtitle)
          </label>
          <textarea
            {...register("subtitle")}
            rows={2}
            className="w-full px-2.5 py-1.5 bg-theme-surface-sunken border-2 border-theme-border rounded-retro text-theme-text placeholder:text-theme-text-faint focus:outline-none focus:border-theme-primary shadow-retro-sm text-xs leading-relaxed"
          />
        </div>

        {/* Doc ID & Version */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-theme-text font-bold block mb-1 text-[11px]">
              รหัสเอกสาร (Doc ID)
            </label>
            <input
              type="text"
              {...register("documentNumber")}
              className="w-full px-2.5 py-1.5 bg-theme-surface-sunken border-2 border-theme-border rounded-retro text-theme-text font-mono shadow-retro-sm text-xs"
            />
          </div>
          <div>
            <label className="text-theme-text font-bold block mb-1 text-[11px]">
              เวอร์ชัน (Version) *
            </label>
            <input
              type="text"
              {...register("version", { required: "กรุณาระบุเวอร์ชัน" })}
              className="w-full px-2.5 py-1.5 bg-theme-surface-sunken border-2 border-theme-border rounded-retro text-theme-text font-mono shadow-retro-sm text-xs font-semibold"
            />
          </div>
        </div>

        {/* Status & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-theme-text font-bold block mb-1 text-[11px]">
              สถานะ (Status)
            </label>
            <select
              {...register("status")}
              className="w-full px-2.5 py-1.5 bg-theme-surface-sunken border-2 border-theme-border rounded-retro text-theme-text focus:outline-none focus:border-theme-primary shadow-retro-sm text-xs font-medium cursor-pointer"
            >
              <option value="Draft">Draft (ร่าง)</option>
              <option value="Draft for Confirmation">Draft for Confirmation (รอยืนยัน)</option>
              <option value="Review">Review (ตรวจสอบ)</option>
              <option value="Approved">Approved (อนุมัติแล้ว)</option>
              <option value="Final">Final (สมบูรณ์)</option>
            </select>
          </div>
          <div>
            <label className="text-theme-text font-bold block mb-1 text-[11px]">
              วันที่ออกเอกสาร (Date)
            </label>
            <input
              type="text"
              {...register("date")}
              className="w-full px-2.5 py-1.5 bg-theme-surface-sunken border-2 border-theme-border rounded-retro text-theme-text shadow-retro-sm text-xs"
            />
          </div>
        </div>

        {/* Author */}
        <div>
          <label className="text-theme-text font-bold block mb-1 text-[11px]">
            ผู้จัดทำ (Prepared By / Author) *
          </label>
          <input
            type="text"
            {...register("author", { required: "กรุณาระบุผู้จัดทำ" })}
            className="w-full px-2.5 py-1.5 bg-theme-surface-sunken border-2 border-theme-border rounded-retro text-theme-text shadow-retro-sm text-xs"
          />
        </div>

        {/* Client & Organization */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-theme-text font-bold block mb-1 text-[11px]">
              ลูกค้า (Client)
            </label>
            <input
              type="text"
              {...register("client")}
              className="w-full px-2.5 py-1.5 bg-theme-surface-sunken border-2 border-theme-border rounded-retro text-theme-text shadow-retro-sm text-xs"
            />
          </div>
          <div>
            <label className="text-theme-text font-bold block mb-1 text-[11px]">
              องค์กร (Org)
            </label>
            <input
              type="text"
              {...register("organization")}
              className="w-full px-2.5 py-1.5 bg-theme-surface-sunken border-2 border-theme-border rounded-retro text-theme-text shadow-retro-sm text-xs"
            />
          </div>
        </div>

        {/* Theme Colors */}
        <div className="border-t-2 border-theme-border-subtle pt-3">
          <label className="text-theme-text font-bold block mb-2 text-xs">
            สีธีมเอกสาร PDF (Document PDF Palette)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-theme-text-muted text-[10.5px] block mb-1">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register("theme.primaryColor")}
                  className="w-7 h-7 rounded-retro border-2 border-theme-border bg-theme-surface-sunken cursor-pointer"
                />
                <span className="font-mono text-theme-text text-xs font-semibold px-2 py-0.5 rounded-retro bg-theme-surface-sunken border border-theme-border-subtle">
                  {primaryColor}
                </span>
              </div>
            </div>

            <div>
              <label className="text-theme-text-muted text-[10.5px] block mb-1">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register("theme.accentColor")}
                  className="w-7 h-7 rounded-retro border-2 border-theme-border bg-theme-surface-sunken cursor-pointer"
                />
                <span className="font-mono text-theme-text text-xs font-semibold px-2 py-0.5 rounded-retro bg-theme-surface-sunken border border-theme-border-subtle">
                  {accentColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Save & Reset Buttons */}
        <div className="pt-3 border-t-2 border-theme-border-subtle flex items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={() => reset(config)}
              className="px-3 py-2 bg-theme-surface hover:bg-theme-surface-hover text-theme-text rounded-retro text-xs font-bold flex items-center gap-1 border border-theme-border shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              title="Reset to saved values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่า</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="flex-1 py-2 px-4 bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-40 text-theme-primary-text font-bold rounded-retro border-2 border-theme-border shadow-retro flex items-center justify-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>
              {isSubmitting
                ? "กำลังบันทึก..."
                : isDirty
                ? "บันทึกการตั้งค่า (Save)"
                : "บันทึกแล้ว (Saved)"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
