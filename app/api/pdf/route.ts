import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceData } from "@/lib/workspaces";
import { renderWorkspacePdf } from "@/lib/pdf-generator";
import { buildContentDisposition, sanitizeDocumentFilename } from "@/lib/export-utils";

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

  const specificFile = searchParams.get("file") || undefined;
  const workspace = getWorkspaceData(workspaceSlug, specificFile);
  if (!workspace) {
    return NextResponse.json(
      { error: `Workspace '${workspaceSlug}' not found.` },
      { status: 404 }
    );
  }

  try {
    const { buffer, filename: generatedFilename } = await renderWorkspacePdf(workspace);
    const fileSuffix = specificFile && specificFile !== "all" ? `-${specificFile.replace(/\.md$/i, "")}` : "";
    const filename = fileSuffix
      ? sanitizeDocumentFilename(
          `${workspace.slug}${fileSuffix}`,
          workspace.config.title,
          workspace.config.version,
          "pdf"
        )
      : generatedFilename;
    const isInline = searchParams.get("inline") === "true" || searchParams.get("inline") === "1";
    const dispositionType = isInline ? "inline" : "attachment";

    return new Response(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": buildContentDisposition(filename, dispositionType),
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
