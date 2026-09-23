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
    <aside className="w-15 bg-theme-surface-sunken border-r-2 border-theme-border flex flex-col items-center py-3.5 space-y-2 flex-shrink-0 z-20 select-none">
      {/* Top Tool Tabs */}
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onToggleTab(tab.id)}
            className={cn(
              "h-10 w-10 flex items-center justify-center rounded-retro transition-all relative cursor-pointer",
              isActive
                ? "bg-theme-primary text-theme-primary-text border border-theme-border shadow-retro-sm"
                : "text-theme-text-muted hover:text-theme-text hover:bg-theme-surface active:translate-x-[0.5px] active:translate-y-[0.5px]"
            )}
            title={tab.title}
          >
            {tab.icon}
          </button>
        );
      })}

      <div className="w-8 h-px bg-theme-border-subtle my-1.5" />

      {/* Settings Tab */}
      <button
        type="button"
        onClick={() => onToggleTab("settings")}
        className={cn(
          "h-10 w-10 flex items-center justify-center rounded-retro transition-all relative cursor-pointer",
          activeTab === "settings"
            ? "bg-theme-primary text-theme-primary-text border border-theme-border shadow-retro-sm"
            : "text-theme-text-muted hover:text-theme-text hover:bg-theme-surface active:translate-x-[0.5px] active:translate-y-[0.5px]"
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
          className="h-9 w-9 flex items-center justify-center text-theme-text-muted hover:text-theme-text hover:bg-theme-surface rounded-retro border border-transparent hover:border-theme-border transition-colors cursor-pointer"
          title="ปิดแถบด้านข้าง (Collapse)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
    </aside>
  );
}
