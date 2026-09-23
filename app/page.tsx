import { getAllWorkspaces } from "@/lib/workspaces";
import WorkspaceDashboard from "@/components/WorkspaceDashboard";
import { Layers, FolderGit2, Terminal } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const workspaces = getAllWorkspaces();

  return (
    <div className="min-h-screen bg-theme-bg bg-retro-dots flex flex-col">
      {/* Top Navigation */}
      <header className="bg-theme-surface border-b-2 border-theme-border sticky top-0 z-30 shadow-retro-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-retro bg-theme-primary flex items-center justify-center text-theme-primary-text font-bold border border-theme-border shadow-retro-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-theme-text tracking-tight font-sans">
                tan-docs-engine
              </span>
              <span className="ml-2 text-xs font-mono font-semibold px-2 py-0.5 rounded-retro bg-theme-accent-light text-theme-accent-text border border-theme-accent/40">
                Multi-Tenant Docs
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono text-theme-text-muted">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-retro bg-theme-surface-sunken border border-theme-border-subtle">
              <FolderGit2 className="w-4 h-4 text-theme-primary" />
              <span>{workspaces.length} Workspaces</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-3 rounded-retro bg-theme-surface border border-theme-border-subtle text-xs font-mono text-theme-text-muted shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-theme-primary animate-pulse" />
            <span>SPECIFICATION WORKSTATION // V1.0</span>
          </div>
          <h1 className="text-3xl font-extrabold text-theme-text sm:text-4xl tracking-tight">
            Centralized Docs Workspace
          </h1>
          <p className="mt-2 text-base text-theme-text-muted max-w-3xl leading-relaxed">
            ศูนย์กลางผลิตและจัดการเอกสาร Requirement Confirmation และ Technical Specifications
            แปลงจาก Markdown (.md) เป็น PDF แบบ Config-driven พร้อมระบบ Web Management Studio และ Live Markdown Editor
          </p>
        </div>

        {/* Retro Terminal CLI Quick Reference Box */}
        <div className="mb-8 bg-[#1a1816] text-[#e8e2d8] rounded-retro p-5 shadow-retro border-2 border-theme-border">
          <div className="flex items-center justify-between mb-3 border-b border-[#35312a] pb-3">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5 mr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c2541a]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#b87a14]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#29784b]" />
              </div>
              <Terminal className="w-4 h-4 text-[#e0a845]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#a89f91]">
                CLI Command Quick Reference
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#8a8072]">READY // BASH</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#12110f] p-3 rounded-retro border border-[#2b2721]">
              <span className="text-[#8a8072]"># Generate single workspace:</span>
              <p className="text-[#64cf8e] mt-1 select-all font-semibold">
                npm run generate -- --workspace wallet-project
              </p>
            </div>
            <div className="bg-[#12110f] p-3 rounded-retro border border-[#2b2721]">
              <span className="text-[#8a8072]"># Generate all workspaces to /output:</span>
              <p className="text-[#64cf8e] mt-1 select-all font-semibold">npm run generate:all</p>
            </div>
          </div>
        </div>

        {/* Interactive Workspace Dashboard with Search & Create Modal */}
        <WorkspaceDashboard initialWorkspaces={workspaces} />
      </main>
    </div>
  );
}
