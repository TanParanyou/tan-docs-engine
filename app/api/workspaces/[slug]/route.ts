import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceData, deleteWorkspace, isValidSlug } from "@/lib/workspaces";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { success: false, error: "Invalid workspace slug" },
      { status: 400 }
    );
  }

  const workspace = getWorkspaceData(slug);
  if (!workspace) {
    return NextResponse.json(
      { success: false, error: `Workspace "${slug}" not found` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      slug: workspace.slug,
      config: workspace.config,
      files: workspace.files.map((f) => f.filename),
    },
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { success: false, error: "Invalid workspace slug" },
      { status: 400 }
    );
  }

  try {
    deleteWorkspace(slug);
    return NextResponse.json({
      success: true,
      message: `Workspace "${slug}" deleted successfully`,
    });
  } catch (error: any) {
    console.error(`Failed to delete workspace "${slug}":`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete workspace" },
      { status: 400 }
    );
  }
}
