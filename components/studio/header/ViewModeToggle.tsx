"use client";

import React from "react";
import { Maximize2, Columns, Eye } from "lucide-react";
import SegmentedControl, { SegmentOption } from "@/components/common/SegmentedControl";
import { ViewMode } from "@/lib/store/useStudioStore";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({ viewMode, onChange }: ViewModeToggleProps) {
  const options: SegmentOption<ViewMode>[] = [
    {
      value: "editor",
      label: "Editor",
      icon: <Maximize2 className="w-3.5 h-3.5" />,
      title: "Full Editor Mode (แสดงเฉพาะกล่องแก้ไข)",
    },
    {
      value: "split",
      label: "Split",
      icon: <Columns className="w-3.5 h-3.5" />,
      title: "Split Mode (แบ่งสองฝั่ง Editor และ Preview)",
    },
    {
      value: "preview",
      label: "Preview",
      icon: <Eye className="w-3.5 h-3.5" />,
      title: "Full Preview Mode (แสดงเฉพาะตัวอย่างเอกสาร)",
    },
  ];

  return <SegmentedControl options={options} value={viewMode} onChange={onChange} />;
}
