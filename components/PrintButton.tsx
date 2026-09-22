"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <div className="fixed top-6 right-6 z-50 no-print">
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
      >
        <Printer className="w-4 h-4 text-blue-400" />
        <span>Print Document (Ctrl+P / ⌘P)</span>
      </button>
    </div>
  );
}
