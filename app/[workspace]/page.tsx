import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkspaceData, getAllWorkspaceSlugs } from "@/lib/workspaces";
import { generateCoverPageHtml } from "@/lib/template";
import MermaidRenderer from "@/components/MermaidRenderer";
import DocumentViewer from "@/components/viewer/DocumentViewer";
import ExportDropdown from "@/components/common/ExportDropdown";
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
      className="min-h-screen bg-theme-bg bg-retro-dots flex flex-col"
      style={
        {
          "--primary-color": primaryColor,
          "--accent-color": accentColor,
        } as React.CSSProperties
      }
    >
      <MermaidRenderer />

      {/* Top Header Navbar */}
      <header className="bg-theme-surface border-b-2 border-theme-border sticky top-0 z-40 shadow-retro-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-theme-text hover:text-theme-primary bg-theme-surface hover:bg-theme-surface-hover border border-theme-border shadow-retro-sm px-2.5 py-1.5 rounded-retro active:translate-x-[1px] active:translate-y-[1px] transition-all flex-shrink-0"
              title="กลับหน้าหลัก"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Back</span>
            </Link>
            <div className="h-4 w-px bg-theme-border-subtle flex-shrink-0" />
            <div className="min-w-0 truncate">
              <span className="font-bold text-theme-text text-xs sm:text-sm truncate inline-block max-w-[120px] sm:max-w-[200px] md:max-w-none align-middle font-sans">
                {config.name}
              </span>
              <span className="mx-1.5 text-theme-border-subtle">/</span>
              <span className="text-[11px] sm:text-xs text-theme-text-muted font-mono">v{config.version}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
            <Link
              href={`/${slug}/edit`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-accent-text bg-theme-accent-light hover:bg-theme-accent/20 border border-theme-accent/60 shadow-retro-sm px-2.5 sm:px-3 py-1.5 rounded-retro active:translate-x-[1px] active:translate-y-[1px] transition-all"
              title="แก้ไขใน Studio"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit in Studio</span>
            </Link>

            <Link
              href={`/${slug}/print`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-theme-text hover:text-theme-primary bg-theme-surface hover:bg-theme-surface-hover border border-theme-border shadow-retro-sm px-2 sm:px-3 py-1.5 rounded-retro active:translate-x-[1px] active:translate-y-[1px] transition-all"
              title="พิมพ์เอกสาร A4"
            >
              <Printer className="w-3.5 h-3.5 text-theme-text-muted" />
              <span className="hidden md:inline">Print A4</span>
            </Link>

            <ExportDropdown workspaceSlug={slug} variant="primary" />
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 w-full flex-1 flex gap-8">
        {/* Left Sticky Sidebar: Table of Contents & Metadata */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* Meta Summary Card */}
            <div className="bg-theme-surface rounded-retro border-2 border-theme-border p-5 shadow-retro-sm space-y-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-theme-text-muted block mb-1">
                  Document Info
                </span>
                <h3 className="font-bold text-theme-text text-sm leading-snug">
                  {config.title}
                </h3>
              </div>

              <div className="space-y-2.5 text-xs border-t border-theme-border-subtle pt-3">
                <div className="flex items-center gap-2 text-theme-text-muted">
                  <Calendar className="w-3.5 h-3.5 text-theme-text-faint" />
                  <span>{config.date}</span>
                </div>
                <div className="flex items-center gap-2 text-theme-text-muted">
                  <User className="w-3.5 h-3.5 text-theme-text-faint" />
                  <span className="truncate">{config.author}</span>
                </div>
                {config.client && (
                  <div className="flex items-center gap-2 text-theme-text-muted">
                    <Building className="w-3.5 h-3.5 text-theme-text-faint" />
                    <span className="truncate">{config.client}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-retro text-[11px] font-mono font-semibold border ${
                      config.status === "Approved"
                        ? "bg-theme-success-light text-theme-success border-theme-success/40"
                        : "bg-theme-warning-light text-theme-warning border-theme-warning/40"
                    }`}
                  >
                    {config.status === "Approved" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {config.status || "Draft"}
                  </span>
                  <span className="text-theme-border-subtle">&bull;</span>
                  <span className="text-theme-text-muted font-mono text-[11px]">
                    {config.documentNumber || `v${config.version}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Sections / Files */}
            <div className="bg-theme-surface rounded-retro border-2 border-theme-border p-5 shadow-retro-sm">
              <span className="text-xs font-mono uppercase tracking-wider text-theme-text-muted block mb-3">
                Sections & Files
              </span>
              <nav className="space-y-1">
                {files.map((file, idx) => (
                  <a
                    key={file.filename}
                    href={`#section-${idx}`}
                    className="flex items-center gap-2 text-xs font-medium text-theme-text-muted hover:text-theme-primary hover:bg-theme-surface-hover px-2 py-1.5 rounded-retro border border-transparent hover:border-theme-border-subtle transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-theme-text-faint flex-shrink-0" />
                    <span className="truncate font-mono">{file.filename}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content Area - Rendered via DocumentViewer (A4 Paged / Real PDF / Continuous) */}
        <main className="flex-1 min-w-0">
          <DocumentViewer
            workspaceSlug={slug}
            config={config}
            coverPageHtml={coverPageHtml}
            files={files}
            primaryColor={primaryColor}
            accentColor={accentColor}
            initialMode="paged"
          />
        </main>
      </div>
    </div>
  );
}
