import { getAllWorkspaces } from "@/lib/workspaces";
import WorkspaceDashboard from "@/components/WorkspaceDashboard";
import { Layers, FolderGit2, Terminal } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const workspaces = getAllWorkspaces();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                tan-docs-engine
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Multi-Tenant Docs
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-slate-400" />
              <span>{workspaces.length} Workspaces</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            Centralized Docs Workspace
          </h1>
          <p className="mt-2 text-base text-slate-600 max-w-3xl">
            ศูนย์กลางผลิตและจัดการเอกสาร Requirement Confirmation และ Technical Specifications
            แปลงจาก Markdown (.md) เป็น PDF แบบ Config-driven พร้อมระบบ Web Management Studio และ Live Markdown Editor
          </p>
        </div>

        {/* CLI Quick Reference Box */}
        <div className="mb-8 bg-slate-900 text-slate-200 rounded-xl p-5 shadow-lg border border-slate-800">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                CLI Command Quick Reference
              </span>
            </div>
            <span className="text-xs text-slate-500">Standalone execution</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-500"># Generate single workspace:</span>
              <p className="text-emerald-400 mt-1 select-all">
                npm run generate -- --workspace wallet-project
              </p>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
              <span className="text-slate-500"># Generate all workspaces to /output:</span>
              <p className="text-emerald-400 mt-1 select-all">npm run generate:all</p>
            </div>
          </div>
        </div>

        {/* Interactive Workspace Dashboard with Search & Create Modal */}
        <WorkspaceDashboard initialWorkspaces={workspaces} />
      </main>
    </div>
  );
}
