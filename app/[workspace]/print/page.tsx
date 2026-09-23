import { notFound } from "next/navigation";
import { getWorkspaceData, getAllWorkspaceSlugs } from "@/lib/workspaces";
import { generateCoverPageHtml } from "@/lib/template";
import MermaidRenderer from "@/components/MermaidRenderer";
import PrintButton from "@/components/PrintButton";

interface PrintPageProps {
  params: Promise<{
    workspace: string;
  }>;
  searchParams: Promise<{
    file?: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllWorkspaceSlugs();
  return slugs.map((workspace) => ({ workspace }));
}

export default async function WorkspacePrintPage({ params, searchParams }: PrintPageProps) {
  const { workspace: slug } = await params;
  const { file: specificFile } = await searchParams;
  const workspace = getWorkspaceData(slug, specificFile);

  if (!workspace) {
    notFound();
  }

  const { config, combinedHtml } = workspace;
  const coverPageHtml = generateCoverPageHtml(workspace);
  const primaryColor = config.theme?.primaryColor || "#1e293b";
  const accentColor = config.theme?.accentColor || "#2563eb";

  return (
    <div
      className="bg-white min-h-screen text-slate-900"
      style={
        {
          "--primary-color": primaryColor,
          "--accent-color": accentColor,
        } as React.CSSProperties
      }
    >
      <MermaidRenderer />
      <PrintButton />

      <div className="max-w-[210mm] mx-auto px-8 py-10 print:p-0 print:m-0 print:max-w-none">
        {/* Render Cover Page */}
        <div dangerouslySetInnerHTML={{ __html: coverPageHtml }} />

        {/* Render Combined Document Sections */}
        <div
          dangerouslySetInnerHTML={{ __html: combinedHtml }}
          className="doc-content mt-8"
        />
      </div>
    </div>
  );
}
