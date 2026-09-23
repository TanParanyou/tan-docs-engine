"use client";

import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { ThemeConfig } from "@/lib/types";
import DocumentViewer, { DocumentViewerHandle } from "@/components/viewer/DocumentViewer";

export interface LivePreviewHandle {
  scrollToPercentage: (percentage: number) => void;
  scrollToHeading: (headingText: string) => void;
}

interface LivePreviewProps {
  content: string;
  theme?: ThemeConfig;
  title?: string;
  documentNumber?: string;
  version?: string;
  slug?: string;
  onScroll?: (percentage: number) => void;
  searchQuery?: string;
}

const LivePreview = forwardRef<LivePreviewHandle, LivePreviewProps>(
  (
    {
      content,
      theme,
      title,
      documentNumber,
      version,
      slug = "d",
      onScroll,
      searchQuery = "",
    },
    ref
  ) => {
    const [renderedHtml, setRenderedHtml] = useState("");
    const viewerRef = useRef<DocumentViewerHandle>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Direct scrolling on the scrollable container of LivePreview
    useImperativeHandle(ref, () => ({
      scrollToPercentage: (percentage: number) => {
        const container = containerRef.current;
        if (!container) return;
        const maxScroll = container.scrollHeight - container.clientHeight;
        if (maxScroll > 0) {
          container.scrollTop = percentage * maxScroll;
        }
      },
      scrollToHeading: (headingText: string) => {
        const container = containerRef.current;
        if (!container) return;
        const cleanTarget = headingText.toLowerCase().trim();
        const headings = container.querySelectorAll("h1, h2, h3, h4");
        for (let i = 0; i < headings.length; i++) {
          const h = headings[i] as HTMLElement;
          if (h.textContent?.toLowerCase().trim().includes(cleanTarget)) {
            h.scrollIntoView({ behavior: "smooth", block: "start" });
            break;
          }
        }
      },
    }));

    // Render markdown to HTML in real-time
    useEffect(() => {
      try {
        let html = renderMarkdown(content || "");
        if (searchQuery && searchQuery.trim().length > 0) {
          const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(`(?![^<]*>)(${escaped})`, "gi");
          html = html.replace(
            regex,
            '<mark class="bg-amber-300 text-slate-900 rounded-xs px-0.5">$1</mark>'
          );
        }
        setRenderedHtml(html);
      } catch (err: any) {
        console.error("Markdown rendering error in LivePreview:", err);
      }
    }, [content, searchQuery]);

    const handleContainerScroll = (e: React.UIEvent<HTMLDivElement>) => {
      if (!onScroll) return;
      const container = e.currentTarget;
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (maxScroll > 0) {
        onScroll(container.scrollTop / maxScroll);
      }
    };

    return (
      <div
        ref={containerRef}
        onScroll={handleContainerScroll}
        className="h-full flex flex-col bg-slate-100/80 overflow-y-auto select-text scroll-smooth"
      >
        <DocumentViewer
          ref={viewerRef}
          workspaceSlug={slug}
          config={{
            name: title || slug,
            title: title || "Document Preview",
            documentNumber: documentNumber || "",
            version: version || "1.0.0",
            author: "",
            date: "",
            theme,
          }}
          liveHtml={renderedHtml}
          primaryColor={theme?.primaryColor || "#0f3b6c"}
          accentColor={theme?.accentColor || "#1d4ed8"}
          initialMode="paged"
          showToolbar={true}
          stickyClassName="sticky top-0 z-20 w-full rounded-none border-x-0 border-t-0 shadow-retro-sm"
          contentClassName="p-3 sm:p-6 pb-20"
        />
      </div>
    );
  }
);

LivePreview.displayName = "LivePreview";

export default LivePreview;
