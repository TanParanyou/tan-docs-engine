"use client";

import React, { useEffect, useState, useRef } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { ThemeConfig } from "@/lib/types";

interface LivePreviewProps {
  content: string;
  theme?: ThemeConfig;
  title?: string;
}

export default function LivePreview({ content, theme, title }: LivePreviewProps) {
  const [renderedHtml, setRenderedHtml] = useState("");
  const [mermaidError, setMermaidError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Render markdown to HTML
  useEffect(() => {
    try {
      const html = renderMarkdown(content || "");
      setRenderedHtml(html);
    } catch (err: any) {
      console.error("Markdown rendering error:", err);
    }
  }, [content]);

  // Client-side Mermaid rendering with debounce
  useEffect(() => {
    if (!renderedHtml || typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout;

    const runMermaid = async () => {
      // @ts-expect-error - injected by CDN or script
      if (!window.mermaid) {
        // Dynamically load mermaid script if not present
        const existingScript = document.getElementById("mermaid-cdn-script");
        if (!existingScript) {
          const script = document.createElement("script");
          script.id = "mermaid-cdn-script";
          script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
          script.onload = () => {
            // @ts-expect-error
            if (window.mermaid) {
              // @ts-expect-error
              window.mermaid.initialize({
                startOnLoad: false,
                theme: "neutral",
                securityLevel: "loose",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Sarabun", "Prompt", "Segoe UI", Roboto, sans-serif',
              });
              triggerRender();
            }
          };
          document.head.appendChild(script);
          return;
        }
      }

      triggerRender();
    };

    const triggerRender = async () => {
      if (!containerRef.current) return;
      const mermaidNodes = containerRef.current.querySelectorAll(".mermaid");
      if (mermaidNodes.length === 0) {
        setMermaidError(null);
        return;
      }

      try {
        // @ts-expect-error
        if (window.mermaid) {
          // @ts-expect-error
          await window.mermaid.run({ nodes: mermaidNodes });
          setMermaidError(null);
        }
      } catch (err: any) {
        console.warn("Mermaid syntax parsing preview warning:", err);
        setMermaidError(
          "Mermaid Syntax Warning: ตรวจพบไวยากรณ์ Diagram ที่ยังเขียนไม่เสร็จสมบูรณ์ กำลังรออัปเดต..."
        );
      }
    };

    timeoutId = setTimeout(runMermaid, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [renderedHtml]);

  const primaryColor = theme?.primaryColor || "#0f172a";
  const accentColor = theme?.accentColor || "#2563eb";

  return (
    <div
      className="h-full flex flex-col bg-white overflow-y-auto"
      style={
        {
          "--primary-color": primaryColor,
          "--accent-color": accentColor,
        } as React.CSSProperties
      }
    >
      {/* Document Header Preview */}
      <div className="border-b border-slate-200 bg-slate-50/70 px-8 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            LIVE DOCUMENT PREVIEW
          </span>
          <h3 className="text-sm font-semibold text-slate-800">
            {title || "Untitled Document"}
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
          Real-time Sync
        </span>
      </div>

      {mermaidError && (
        <div className="mx-8 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
          <span className="font-semibold">⚠️</span>
          <span>{mermaidError}</span>
        </div>
      )}

      {/* Main Rendered Content */}
      <div className="flex-1 p-8 sm:p-12 max-w-4xl mx-auto w-full">
        <div
          ref={containerRef}
          className="prose prose-slate max-w-none doc-content markdown-rendered-body"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </div>
  );
}
