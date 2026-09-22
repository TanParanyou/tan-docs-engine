"use client";

import React, { useState } from "react";
import { DocsConfig } from "@/lib/types";
import { Settings, Save, CheckCircle2, AlertCircle } from "lucide-react";

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
  const [formData, setFormData] = useState<DocsConfig>({ ...config });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (
    field: keyof DocsConfig,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleThemeChange = (
    field: "primaryColor" | "accentColor",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      await onUpdateConfig(formData);
      setStatusMessage({
        type: "success",
        text: "บันทึกการตั้งค่าเอกสารเรียบร้อยแล้ว!",
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center space-x-2">
        <Settings className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Workspace Settings (docs.config.json)
        </span>
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
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
        <div>
          <label className="text-slate-400 font-medium block mb-1">
            ชื่อโปรเจกต์ (Project Name)
          </label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div>
          <label className="text-slate-400 font-medium block mb-1">
            หัวข้อเอกสาร (Document Title)
          </label>
          <input
            type="text"
            value={formData.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div>
          <label className="text-slate-400 font-medium block mb-1">
            คำอธิบายย่อย (Subtitle)
          </label>
          <textarea
            value={formData.subtitle || ""}
            onChange={(e) => handleChange("subtitle", e.target.value)}
            rows={2}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 font-medium block mb-1">
              รหัสเอกสาร (Doc ID)
            </label>
            <input
              type="text"
              value={formData.documentNumber || ""}
              onChange={(e) => handleChange("documentNumber", e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
            />
          </div>
          <div>
            <label className="text-slate-400 font-medium block mb-1">
              เวอร์ชัน (Version)
            </label>
            <input
              type="text"
              value={formData.version || ""}
              onChange={(e) => handleChange("version", e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 font-medium block mb-1">
              สถานะ (Status)
            </label>
            <select
              value={formData.status || "Draft"}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="Draft">Draft (ร่าง)</option>
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
              type="date"
              value={formData.date || ""}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-400 font-medium block mb-1">
            ผู้จัดทำ (Prepared By / Author)
          </label>
          <input
            type="text"
            value={formData.author || ""}
            onChange={(e) => handleChange("author", e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
          />
        </div>

        <div>
          <label className="text-slate-400 font-medium block mb-1">
            ลูกค้า/ผู้ว่าจ้าง (Client)
          </label>
          <input
            type="text"
            value={formData.client || ""}
            onChange={(e) => handleChange("client", e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
          />
        </div>

        <div>
          <label className="text-slate-400 font-medium block mb-1">
            องค์กร (Organization)
          </label>
          <input
            type="text"
            value={formData.organization || ""}
            onChange={(e) => handleChange("organization", e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-100"
          />
        </div>

        {/* Theme Colors */}
        <div className="border-t border-slate-800 pt-3">
          <label className="text-slate-300 font-semibold block mb-2">
            สีธีมเอกสาร (Theme Styling)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.theme?.primaryColor || "#0f172a"}
                  onChange={(e) => handleThemeChange("primaryColor", e.target.value)}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-slate-300 text-xs">
                  {formData.theme?.primaryColor || "#0f172a"}
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
                  value={formData.theme?.accentColor || "#2563eb"}
                  onChange={(e) => handleThemeChange("accentColor", e.target.value)}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-slate-300 text-xs">
                  {formData.theme?.accentColor || "#2563eb"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า (Save Settings)"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
