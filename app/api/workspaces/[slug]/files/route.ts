import { NextRequest, NextResponse } from "next/server";
import {
  listWorkspaceFiles,
  createWorkspaceFile,
  renameWorkspaceFile,
  deleteWorkspaceFile,
  reorderWorkspaceFiles,
  isValidSlug,
} from "@/lib/workspaces";

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

  try {
    const data = listWorkspaceFiles(slug);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Failed to list workspace files:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list files" },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { success: false, error: "Invalid workspace slug" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const action = body.action as "create" | "rename" | "delete" | "reorder";

    switch (action) {
      case "create": {
        const { filename, initialContent } = body;
        if (!filename) {
          return NextResponse.json(
            { success: false, error: "Filename is required" },
            { status: 400 }
          );
        }
        createWorkspaceFile(slug, filename, initialContent);
        break;
      }

      case "rename": {
        const { oldFilename, newFilename } = body;
        if (!oldFilename || !newFilename) {
          return NextResponse.json(
            { success: false, error: "oldFilename and newFilename are required" },
            { status: 400 }
          );
        }
        renameWorkspaceFile(slug, oldFilename, newFilename);
        break;
      }

      case "delete": {
        const { filename } = body;
        if (!filename) {
          return NextResponse.json(
            { success: false, error: "Filename is required" },
            { status: 400 }
          );
        }
        deleteWorkspaceFile(slug, filename);
        break;
      }

      case "reorder": {
        const { files } = body;
        if (!Array.isArray(files)) {
          return NextResponse.json(
            { success: false, error: "files must be an array of filenames" },
            { status: 400 }
          );
        }
        reorderWorkspaceFiles(slug, files);
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported action "${action}"` },
          { status: 400 }
        );
    }

    const updated = listWorkspaceFiles(slug);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("File operation failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "File operation failed" },
      { status: 400 }
    );
  }
}
