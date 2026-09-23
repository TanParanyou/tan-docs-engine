import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceData } from "@/lib/workspaces";
import { generateWorkspaceMarkdown } from "@/lib/md-generator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceSlug = searchParams.get("workspace");
  const singleFile = searchParams.get("file") || undefined;

  if (!workspaceSlug) {
    return NextResponse.json(
      { error: "Query parameter 'workspace' is required. Example: /api/md?workspace=wallet-project" },
      { status: 400 }
    );
  }

  const workspace = getWorkspaceData(workspaceSlug);
  if (!workspace) {
    return NextResponse.json(
      { error: `Workspace '${workspaceSlug}' not found.` },
      { status: 404 }
    );
  }

  try {
    const { content, filename } = generateWorkspaceMarkdown(workspace, singleFile);

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Markdown generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate Markdown export", details: String(error) },
      { status: 500 }
    );
  }
}
