"use client";

import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { ThemeConfig } from "@/lib/types";
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Eye, Printer } from "lucide-react";

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
              ✂️ A4 Page Break (ขึ้นหน้าใหม่ใน PDF)
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
        <div className="border-b border-slate-300 bg-white px-5 py-2.5 flex items-center justify-between sticky top-0 z-20 shadow-xs flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Document Preview
              </span>
            </div>
            {documentNumber && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {documentNumber} {version ? `v${version}` : ""}
              </span>
            )}
          </div>

          {/* Zoom and Page View Controls */}
          <div className="flex items-center space-x-2 text-xs">
            {/* Page View Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsA4PageMode(!isA4PageMode)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                isA4PageMode
                  ? "bg-blue-50 text-blue-700 border border-blue-200 font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
              title="Toggle A4 Document Sheet View"
            >
              <Printer className="w-3 h-3" />
              <span>A4 Sheet</span>
            </button>

            <div className="h-3.5 w-px bg-slate-200" />

            {/* Zoom Buttons */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="px-1.5 font-mono text-[10px] text-slate-600 font-semibold min-w-[36px] text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-900"
                title="Reset Zoom"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>

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
