import { NextRequest, NextResponse } from "next/server";
import {
  readWorkspaceFileContent,
  writeWorkspaceFileContent,
  isValidSlug,
  isValidFilename,
} from "@/lib/workspaces";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{
    slug: string;
    filename: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteProps) {
  const { slug, filename } = await params;

  if (!isValidSlug(slug) || !isValidFilename(filename)) {
    return NextResponse.json(
      { success: false, error: "Invalid workspace slug or filename" },
      { status: 400 }
    );
  }

  try {
    const content = readWorkspaceFileContent(slug, filename);
    return NextResponse.json({ success: true, data: { filename, content } });
  } catch (error: any) {
    console.error("Failed to read file content:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to read file" },
      { status: 404 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  const { slug, filename } = await params;

  if (!isValidSlug(slug) || !isValidFilename(filename)) {
    return NextResponse.json(
      { success: false, error: "Invalid workspace slug or filename" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content : "";
    writeWorkspaceFileContent(slug, filename, content);
    return NextResponse.json({ success: true, message: "File saved successfully" });
  } catch (error: any) {
    console.error("Failed to save file content:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save file" },
      { status: 400 }
    );
  }
}
