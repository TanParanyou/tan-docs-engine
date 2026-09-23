"use client";

import React from "react";
import { ListTree, Boxes, Files, Settings, ChevronLeft } from "lucide-react";
import { ActiveTab } from "@/lib/store/useStudioStore";
import { cn } from "@/lib/utils";

interface StudioRailProps {
  activeTab: ActiveTab;
  onToggleTab: (tab: ActiveTab) => void;
  onCollapse: () => void;
}

export default function StudioRail({
  activeTab,
  onToggleTab,
  onCollapse,
}: StudioRailProps) {
  const tabs = [
    {
      id: "outline" as const,
      label: "Document Outline",
      icon: <ListTree className="w-5 h-5" />,
      title: "Document Outline / สารบัญหัวข้อ",
    },
    {
      id: "snippets" as const,
      label: "Snippets",
      icon: <Boxes className="w-5 h-5" />,
      title: "Requirement Snippets / เทมเพลตสเปก",
    },
    {
      id: "files" as const,
      label: "Files",
      icon: <Files className="w-5 h-5" />,
      title: "Document Files & Sections / ไฟล์ในเอกสาร",
    },
  ];

  return (
    <aside className="w-15 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-3.5 space-y-2 flex-shrink-0 z-20 select-none">
      {/* Top Tool Tabs */}
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onToggleTab(tab.id)}
            className={cn(
              "h-10 w-10 flex items-center justify-center rounded-xl transition-all relative cursor-pointer",
              isActive
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/70"
            )}
            title={tab.title}
          >
            {tab.icon}
          </button>
        );
      })}

      <div className="w-8 h-px bg-slate-200 my-1.5" />

      {/* Settings Tab */}
      <button
        type="button"
        onClick={() => onToggleTab("settings")}
        className={cn(
          "h-10 w-10 flex items-center justify-center rounded-xl transition-all relative cursor-pointer",
          activeTab === "settings"
            ? "bg-blue-600 text-white shadow-xs"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/70"
        )}
        title="Workspace Settings / การตั้งค่า (docs.config.json)"
      >
        <Settings className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      {/* Collapse Tab */}
      {activeTab && (
        <button
          type="button"
          onClick={onCollapse}
          className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
          title="ปิดแถบด้านข้าง (Collapse)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
    </aside>
  );
}
