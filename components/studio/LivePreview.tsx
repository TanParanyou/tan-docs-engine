"use client";

import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { ThemeConfig } from "@/lib/types";
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Eye, Printer } from "lucide-react";

import PreviewToolbar from "./preview/PreviewToolbar";

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
}

const LivePreview = forwardRef<LivePreviewHandle, LivePreviewProps>(
  ({ content, theme, title, documentNumber, version }, ref) => {
    const [renderedHtml, setRenderedHtml] = useState("");
    const [mermaidError, setMermaidError] = useState<string | null>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(100);
    const [isA4PageMode, setIsA4PageMode] = useState<boolean>(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);

    // Expose scrolling methods to parent
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
        const sheet = sheetRef.current;
        if (!sheet || !containerRef.current) return;

        const cleanTarget = headingText.toLowerCase().trim();
        const headings = sheet.querySelectorAll("h1, h2, h3, h4");
        for (let i = 0; i < headings.length; i++) {
          const h = headings[i] as HTMLElement;
          const text = h.textContent?.toLowerCase().trim() || "";
          if (text.includes(cleanTarget) || cleanTarget.includes(text)) {
            h.scrollIntoView({ behavior: "smooth", block: "start" });
            // Subtle flash highlight
            h.classList.add("bg-blue-100", "transition-colors");
            setTimeout(() => h.classList.remove("bg-blue-100"), 1500);
            break;
          }
        }
      },
    }));

    // Render markdown to HTML
    useEffect(() => {
      try {
        let html = renderMarkdown(content || "");
        // Enhance page break visualization in live preview
        html = html.replace(
          /<div class="page-break"><\/div>/gi,
          `<div class="preview-page-break my-10 relative flex items-center justify-center select-none print:hidden">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t-2 border-dashed border-blue-300"></div></div>
            <span class="relative bg-white px-3 py-1 text-[11px] font-mono font-semibold text-blue-600 border border-blue-200 rounded-full shadow-sm flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-blue-500 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
              <span>A4 Page Break (ขึ้นหน้าใหม่ใน PDF)</span>
            </span>
          </div>`
        );
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
        if (!sheetRef.current) return;
        const mermaidNodes = sheetRef.current.querySelectorAll(".mermaid");
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
          console.warn("Mermaid parsing warning:", err);
          setMermaidError(
            "Mermaid Syntax Note: ตรวจพบไวยากรณ์ Diagram ที่ยังไม่สมบูรณ์ กำลังรอการพิมพ์เสร็จ..."
          );
        }
      };

      timeoutId = setTimeout(runMermaid, 300);

      return () => {
        clearTimeout(timeoutId);
      };
    }, [renderedHtml]);

    const primaryColor = theme?.primaryColor || "#0f3b6c";
    const accentColor = theme?.accentColor || "#1d4ed8";

    return (
      <div
        className="h-full flex flex-col bg-slate-200 overflow-hidden"
        style={
          {
            "--primary-color": primaryColor,
            "--accent-color": accentColor,
          } as React.CSSProperties
        }
      >
        {/* Preview Control Header */}
        <PreviewToolbar
          documentNumber={documentNumber}
          version={version}
          isA4PageMode={isA4PageMode}
          onToggleA4PageMode={() => setIsA4PageMode(!isA4PageMode)}
          zoomLevel={zoomLevel}
          onZoomIn={() => setZoomLevel((z) => Math.min(150, z + 10))}
          onZoomOut={() => setZoomLevel((z) => Math.max(50, z - 10))}
          onResetZoom={() => setZoomLevel(100)}
        />

        {mermaidError && (
          <div className="mx-6 mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2 shadow-xs flex-shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>{mermaidError}</span>
          </div>
        )}

        {/* Scrollable Document Canvas Viewport */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-slate-200 relative select-text"
        >
          {/* Canvas Wrapper ensuring solid background across all scroll dimensions */}
          <div className="min-w-full min-h-full py-8 px-4 sm:px-8 flex flex-col items-center justify-start bg-slate-200">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease-out",
              }}
              className="w-full flex justify-center pb-24"
            >
              <div
                ref={sheetRef}
                className={`w-full bg-white transition-all shadow-xl border border-slate-300 rounded-xl overflow-x-auto ${
                  isA4PageMode
                    ? "max-w-[210mm] min-h-[297mm] p-8 sm:p-14"
                    : "max-w-4xl p-8"
                }`}
              >
                {/* Real Document Content matching print and reader view */}
                <div
                  className="doc-content"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

LivePreview.displayName = "LivePreview";

export default LivePreview;
