import { notFound } from "next/navigation";
import { getWorkspaceData, getAllWorkspaceSlugs } from "@/lib/workspaces";
import StudioLayout from "@/components/studio/StudioLayout";

interface StudioPageProps {
  params: Promise<{
    workspace: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllWorkspaceSlugs();
  return slugs.map((workspace) => ({ workspace }));
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { workspace: slug } = await params;
  const workspace = getWorkspaceData(slug);

  if (!workspace) {
    notFound();
  }

  return <StudioLayout initialWorkspace={workspace} />;
}
