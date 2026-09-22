import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import { isValidSlug } from "@/lib/workspaces";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{
    slug: string;
  }>;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest, { params }: RouteProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { success: false, error: "Invalid workspace slug" },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded in form field 'file'" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type "${file.type}". Allowed: PNG, JPEG, WebP, SVG, GIF.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    const assetsDir = path.join(process.cwd(), "workspaces", slug, "src", "assets");
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const rawName = file.name || "image.png";
    const sanitizedExt = path.extname(rawName).toLowerCase() || ".png";
    const baseName = path
      .basename(rawName, sanitizedExt)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-");
    const uniqueFilename = `${Date.now()}-${baseName}${sanitizedExt}`;
    const destinationPath = path.join(assetsDir, uniqueFilename);

    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(destinationPath, Buffer.from(arrayBuffer));

    // Relative path for markdown files inside src/
    const markdownPath = `./assets/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      data: {
        url: markdownPath,
        filename: uniqueFilename,
        originalName: file.name,
      },
    });
  } catch (error: any) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
