/**
 * Utility helpers for file exports (DOCX, Excel, Markdown, PDF)
 */

/**
 * Generate a clean, SEO-friendly and universal filename for exported documents.
 * Prioritizes English title/subtitle if present in parentheses (e.g. "(System Requirement Confirmation)")
 * to ensure maximum cross-platform compatibility across Windows, macOS, Linux, and Cloud drives.
 */
export function sanitizeDocumentFilename(
  slug: string,
  title: string,
  version: string,
  extension: string
): string {
  const ext = extension.startsWith(".") ? extension.slice(1) : extension;

  let baseTitle = (title || "").trim();

  // 1. If title contains English subtitle in parentheses, extract it
  // e.g. "เอกสารยืนยันความต้องการระบบภาพรวม (System Requirement Confirmation)" -> "System Requirement Confirmation"
  const enMatch = baseTitle.match(/\(([A-Za-z0-9\s-_]+)\)/);
  if (enMatch && enMatch[1].trim()) {
    baseTitle = enMatch[1].trim();
  }

  // 2. Clean into safe kebab-case
  let safeTitle = baseTitle
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // If title was stripped down completely or empty, fallback to "document"
  const cleanTitle = safeTitle || "document";
  const cleanVersion = (version || "1").replace(/[^a-zA-Z0-9.]/g, "");

  return `${slug}-${cleanTitle}-v${cleanVersion}.${ext}`;
}

/**
 * Construct RFC 6266 / RFC 5987 compliant Content-Disposition header.
 * Provides a clean ASCII fallback filename while embedding full UTF-8 filename for modern browsers.
 */
export function buildContentDisposition(
  filename: string,
  type: "attachment" | "inline" = "attachment"
): string {
  // Clean ASCII fallback without repeated underscores or invalid header characters
  const asciiFallback = filename
    .replace(/[^\x20-\x7E]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const encoded = encodeURIComponent(filename);

  return `${type}; filename="${asciiFallback || "document"}"; filename*=UTF-8''${encoded}`;
}
