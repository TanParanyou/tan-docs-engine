import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceData } from "@/lib/workspaces";
import { renderWorkspacePdf } from "@/lib/pdf-generator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceSlug = searchParams.get("workspace");

  if (!workspaceSlug) {
    return NextResponse.json(
      { error: "Query parameter 'workspace' is required. Example: /api/pdf?workspace=wallet-project" },
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
    const { buffer } = await renderWorkspacePdf(workspace);
    const sanitizedTitle = workspace.config.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filename = `${workspace.slug}-${sanitizedTitle}-v${workspace.config.version}.pdf`;
    const isInline = searchParams.get("inline") === "true" || searchParams.get("inline") === "1";
    const dispositionType = isInline ? "inline" : "attachment";

    return new Response(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${dispositionType}; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: String(error) },
      { status: 500 }
    );
  }
}
