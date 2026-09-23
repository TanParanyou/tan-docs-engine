import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceData } from "@/lib/workspaces";
import { renderWorkspaceExcel } from "@/lib/excel-generator";
import { buildContentDisposition } from "@/lib/export-utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceSlug = searchParams.get("workspace");

  if (!workspaceSlug) {
    return NextResponse.json(
      { error: "Query parameter 'workspace' is required. Example: /api/excel?workspace=wallet-project" },
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
    const { buffer, filename } = await renderWorkspaceExcel(workspace);

    return new Response(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": buildContentDisposition(filename),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Excel generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel (.xlsx) workbook", details: String(error) },
      { status: 500 }
    );
  }
}
