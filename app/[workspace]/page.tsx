import { notFound } from "next/navigation";
import { getWorkspaceData, getAllWorkspaceSlugs } from "@/lib/workspaces";
import { generateCoverPageHtml } from "@/lib/template";
import MermaidRenderer from "@/components/MermaidRenderer";
import WorkspaceReader from "@/components/viewer/WorkspaceReader";

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

  const { config } = workspace;
  const primaryColor = config.theme?.primaryColor || "#0f3b6c";
  const accentColor = config.theme?.accentColor || "#1d4ed8";
  const coverPageHtml = generateCoverPageHtml(workspace);

  return (
    <>
      <MermaidRenderer />
      <WorkspaceReader
        workspace={workspace}
        coverPageHtml={coverPageHtml}
        primaryColor={primaryColor}
        accentColor={accentColor}
      />
    </>
  );
}
