"use client";

import { useEffect } from "react";

export default function MermaidRenderer() {
  useEffect(() => {
    const initMermaid = async () => {
      // @ts-expect-error - mermaid loaded via next/script
      if (typeof window !== "undefined" && window.mermaid) {
        try {
          // @ts-expect-error
          window.mermaid.initialize({
            startOnLoad: false,
            theme: "neutral",
            securityLevel: "loose",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Sarabun', 'Prompt', sans-serif",
          });
          // @ts-expect-error
          await window.mermaid.run({
            nodes: document.querySelectorAll(".mermaid"),
          });
        } catch (err) {
          console.warn("Failed to render Mermaid diagrams:", err);
        }
      }
    };

    const timer = setTimeout(initMermaid, 300);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
