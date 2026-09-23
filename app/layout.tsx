import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tan Docs Engine - Centralized Documentation Workspace",
  description: "Centralized workspace documentation engine for technical & requirement confirmation documents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css"
        />
      </head>
      <body className="min-h-screen bg-theme-bg text-theme-text antialiased selection:bg-theme-primary selection:text-white">
        {children}
        <Script
          src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
