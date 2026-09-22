"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Plus,
  Layers,
  Sparkles,
  ArrowRight,
  AlertCircle,
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
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [author, setAuthor] = useState("Tan System Architecture Team");
  const [client, setClient] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0f172a");
  const [accentColor, setAccentColor] = useState("#2563eb");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-generate slug and doc number when name changes if not manually modified
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);

    const cleanCode = val
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .substring(0, 4);
    if (cleanCode) {
      setDocumentNumber(`DOC-${cleanCode}-2026-001`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim(),
          name: name.trim(),
          title: title.trim() || `${name} Requirement Confirmation & System Specifications`,
          subtitle: subtitle.trim(),
          documentNumber: documentNumber.trim(),
          version: "1.0.0",
          status: "Draft",
          author: author.trim(),
          client: client.trim(),
          theme: {
            primaryColor,
            accentColor,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create workspace");
      }

      onClose();
      // Redirect to Studio for immediate authoring
      router.push(`/${json.data.slug}/edit`);
    } catch (err: any) {
      setError(err.message || "Failed to create workspace");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
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
                สร้างเล่มเอกสารสเปกและข้อกำหนดระบบใหม่ พร้อมเทมเพลตเริ่มต้น
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          <div>
            <label className="text-slate-700 font-semibold block mb-1">
              ชื่อระบบ / โครงการ (Project Name) *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Loyalty Point System"
              required
              autoFocus
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                Workspace ID / Slug (โฟลเดอร์) *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="loyalty-point-system"
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                เก็บใน /workspaces/{slug || "slug"}
              </span>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                เลขที่เอกสาร (Document ID)
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="DOC-LOY-2026-001"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">
              หัวข้อเอกสาร (Document Title)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Requirement Confirmation & System Specifications"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">
              คำอธิบายย่อย (Subtitle)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="เอกสารยืนยันขอบเขตความต้องการและสถาปัตยกรรมระบบ"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                ผู้จัดทำ (Author) *
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                ลูกค้า / ผู้ว่าจ้าง (Client)
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Enterprise Customer Co., Ltd."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Theme Colors */}
          <div className="border-t border-slate-100 pt-3">
            <label className="text-slate-700 font-semibold block mb-2">
              ชุดสีธีมเอกสาร (Theme Color Scheme)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 text-[11px] block mb-1">
                  Primary Color (สีหลัก/หัวเรื่อง)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
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
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
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
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading || !slug || !name}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              {isLoading ? (
                <span>กำลังสร้าง...</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>สร้างเล่มเอกสาร & เข้าสู่ Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
