import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkspaceData, getAllWorkspaceSlugs } from "@/lib/workspaces";
import { generateCoverPageHtml } from "@/lib/template";
import MermaidRenderer from "@/components/MermaidRenderer";
import {
  ArrowLeft,
  Printer,
  Download,
  FileText,
  Calendar,
  User,
  Building,
  CheckCircle2,
  Clock,
  Edit3,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    workspace: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllWorkspaceSlugs();
  return slugs.map((workspace) => ({ workspace }));
}

export default async function WorkspaceDocPage({ params }: PageProps) {
  const { workspace: slug } = await params;
  const workspace = getWorkspaceData(slug);

  if (!workspace) {
    notFound();
  }

  const { config, files } = workspace;
  const primaryColor = config.theme?.primaryColor || "#0f3b6c";
  const accentColor = config.theme?.accentColor || "#1d4ed8";
  const coverPageHtml = generateCoverPageHtml(workspace);

  return (
    <div
      className="min-h-screen bg-slate-100 flex flex-col"
      style={
        {
          "--primary-color": primaryColor,
          "--accent-color": accentColor,
        } as React.CSSProperties
      }
    >
      <MermaidRenderer />

      {/* Top Header Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <span className="font-bold text-slate-900 text-sm">{config.name}</span>
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-xs text-slate-500 font-mono">v{config.version}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/${slug}/edit`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit in Studio</span>
            </Link>

            <Link
              href={`/${slug}/print`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print A4</span>
            </Link>

            <a
              href={`/api/pdf?workspace=${slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex gap-8">
        {/* Left Sticky Sidebar: Table of Contents & Metadata */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* Meta Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Document Info
                </span>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {config.title}
                </h3>
              </div>

              <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{config.date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{config.author}</span>
                </div>
                {config.client && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{config.client}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      config.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {config.status === "Approved" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {config.status || "Draft"}
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {config.documentNumber || `v${config.version}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Sections / Files */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-3">
                Sections & Files
              </span>
              <nav className="space-y-1">
                {files.map((file, idx) => (
                  <a
                    key={file.filename}
                    href={`#section-${idx}`}
                    className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 px-2 py-1.5 rounded-md transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate font-mono">{file.filename}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content Area - Rendered exactly as A4 Page Sheet */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-10 sm:p-14 max-w-[210mm] mx-auto">
            {/* Optional Cover Page if enabled */}
            {coverPageHtml && (
              <div dangerouslySetInnerHTML={{ __html: coverPageHtml }} />
            )}

            {/* Document Content rendered with style.css */}
            <div className="doc-content">
              {files.map((file, idx) => (
                <article
                  key={file.filename}
                  id={`section-${idx}`}
                  className="relative"
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: file.html }}
                    className="markdown-rendered-body"
                  />
                  {idx < files.length - 1 && (
                    <div className="my-10 border-t border-dashed border-slate-200 flex items-center justify-center">
                      <span className="bg-white px-3 text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                        Page Break / Next Section
                      </span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
