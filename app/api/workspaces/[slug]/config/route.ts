import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceConfig, updateWorkspaceConfig, isValidSlug } from "@/lib/workspaces";
import { DocsConfig } from "@/lib/types";

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

  const config = getWorkspaceConfig(slug);
  if (!config) {
    return NextResponse.json(
      { success: false, error: `Workspace "${slug}" not found` },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { success: false, error: "Invalid workspace slug" },
      { status: 400 }
    );
  }

  try {
    const partialConfig = (await request.json()) as Partial<DocsConfig>;
    const updated = updateWorkspaceConfig(slug, partialConfig);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Failed to update workspace config:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update configuration" },
      { status: 400 }
    );
  }
}
