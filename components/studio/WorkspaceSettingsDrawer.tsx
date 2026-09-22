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
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Settings (docs.config.json)
          </span>
        </div>
        {isDirty && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
            Unsaved
          </span>
        )}
      </div>

      {statusMessage && (
        <div
          className={`px-4 py-2 text-xs flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-950/80 text-emerald-200 border-b border-emerald-800"
              : "bg-red-950/80 text-red-200 border-b border-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Form using React Hook Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 text-xs">
        {/* Project Name */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">
            ชื่อโปรเจกต์ (Project Name) *
          </label>
          <input
            type="text"
            {...register("name", { required: "กรุณาระบุชื่อระบบ/โปรเจกต์" })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
          />
          {errors.name && (
            <p className="text-red-400 text-[10px] mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Document Title */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">
            หัวข้อเอกสาร (Document Title) *
          </label>
          <input
            type="text"
            {...register("title", { required: "กรุณาระบุหัวข้อเอกสาร" })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
          />
          {errors.title && (
            <p className="text-red-400 text-[10px] mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Subtitle */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">
            คำอธิบายย่อย (Subtitle)
          </label>
          <textarea
            {...register("subtitle")}
            rows={2}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Doc ID & Version */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 font-medium block mb-1">
              รหัสเอกสาร (Doc ID)
            </label>
            <input
              type="text"
              {...register("documentNumber")}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
            />
          </div>
          <div>
            <label className="text-slate-400 font-medium block mb-1">
              เวอร์ชัน (Version) *
            </label>
            <input
              type="text"
              {...register("version", { required: "กรุณาระบุเวอร์ชัน" })}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
            />
          </div>
        </div>

        {/* Status & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 font-medium block mb-1">
              สถานะ (Status)
            </label>
            <select
              {...register("status")}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="Draft">Draft (ร่าง)</option>
              <option value="Draft for Confirmation">Draft for Confirmation (รอยืนยัน)</option>
              <option value="Review">Review (ตรวจสอบ)</option>
              <option value="Approved">Approved (อนุมัติแล้ว)</option>
              <option value="Final">Final (สมบูรณ์)</option>
            </select>
          </div>
          <div>
            <label className="text-slate-400 font-medium block mb-1">
              วันที่ออกเอกสาร (Date)
            </label>
            <input
              type="text"
              {...register("date")}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-sans"
            />
          </div>
        </div>

        {/* Author */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">
            ผู้จัดทำ (Prepared By / Author) *
          </label>
          <input
            type="text"
            {...register("author", { required: "กรุณาระบุผู้จัดทำ" })}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
          />
        </div>

        {/* Client & Organization */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 font-medium block mb-1">
              ลูกค้า (Client)
            </label>
            <input
              type="text"
              {...register("client")}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
            />
          </div>
          <div>
            <label className="text-slate-400 font-medium block mb-1">
              องค์กร (Org)
            </label>
            <input
              type="text"
              {...register("organization")}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
            />
          </div>
        </div>

        {/* Theme Colors */}
        <div className="border-t border-slate-800 pt-3">
          <label className="text-slate-300 font-semibold block mb-2">
            สีธีมเอกสาร (Theme Color Palette)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register("theme.primaryColor")}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-slate-300 text-xs">
                  {primaryColor}
                </span>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register("theme.accentColor")}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-slate-300 text-xs">
                  {accentColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Save & Reset Buttons */}
        <div className="pt-2 flex items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={() => reset(config)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              title="Reset to saved values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่า</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
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
