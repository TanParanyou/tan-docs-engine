import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceData } from "@/lib/workspaces";
import { renderWorkspaceDocx } from "@/lib/docx-generator";
import { buildContentDisposition } from "@/lib/export-utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceSlug = searchParams.get("workspace");

  if (!workspaceSlug) {
    return NextResponse.json(
      { error: "Query parameter 'workspace' is required. Example: /api/docx?workspace=wallet-project" },
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
    const { buffer, filename } = await renderWorkspaceDocx(workspace);

    return new Response(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": buildContentDisposition(filename),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("DOCX generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate Word (.docx) document", details: String(error) },
      { status: 500 }
    );
  }
}
