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
}

const LivePreview = forwardRef<LivePreviewHandle, LivePreviewProps>(
  ({ content, theme, title, documentNumber, version, slug = "d" }, ref) => {
    const [renderedHtml, setRenderedHtml] = useState("");
    const viewerRef = useRef<DocumentViewerHandle>(null);

    // Forward imperative scrolling methods to shared DocumentViewer
    useImperativeHandle(ref, () => ({
      scrollToPercentage: (percentage: number) => {
        viewerRef.current?.scrollToPercentage(percentage);
      },
      scrollToHeading: (headingText: string) => {
        viewerRef.current?.scrollToHeading(headingText);
      },
    }));

    // Render markdown to HTML in real-time
    useEffect(() => {
      try {
        const html = renderMarkdown(content || "");
        setRenderedHtml(html);
      } catch (err: any) {
        console.error("Markdown rendering error in LivePreview:", err);
      }
    }, [content]);

    return (
      <div className="h-full flex flex-col bg-slate-100/80 overflow-y-auto p-2 sm:p-4 select-text">
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
        />
      </div>
    );
  }
);

LivePreview.displayName = "LivePreview";

export default LivePreview;
