import { NextRequest, NextResponse } from "next/server";
import { getAllWorkspaces, createWorkspace, isValidSlug } from "@/lib/workspaces";
import { CreateWorkspaceInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const workspaces = getAllWorkspaces();
    return NextResponse.json({
      success: true,
      data: workspaces.map((w) => ({
        slug: w.slug,
        name: w.config.name,
        title: w.config.title,
        subtitle: w.config.subtitle,
        documentNumber: w.config.documentNumber,
        version: w.config.version,
        status: w.config.status,
        author: w.config.author,
        client: w.config.client,
        fileCount: w.files.length,
      })),
    });
  } catch (error) {
    console.error("Failed to list workspaces:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list workspaces", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateWorkspaceInput;

    if (!body.slug || !body.name || !body.title || !body.author) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (slug, name, title, author)" },
        { status: 400 }
      );
    }

    if (!isValidSlug(body.slug)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid slug. Only alphanumeric characters, hyphens, and underscores are allowed.",
        },
        { status: 400 }
      );
    }

    const newWorkspace = createWorkspace(body);
    return NextResponse.json(
      {
        success: true,
        data: {
          slug: newWorkspace.slug,
          config: newWorkspace.config,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create workspace:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create workspace" },
      { status: 400 }
    );
  }
}
