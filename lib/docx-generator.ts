import path from "node:path";
import fs from "node:fs";
import { WorkspaceData } from "./types";

export interface DocxExportResult {
  buffer: Buffer;
  filename: string;
  filePath?: string;
}

/**
 * Clean up HTML for docx compatibility:
 * - Replace raw mermaid code blocks with readable structured callout blocks
 * - Ensure pagebreak comments are converted to word-compatible pagebreak elements
 */
function sanitizeHtmlForDocx(html: string): string {
  let cleaned = html;

  // Convert <!-- pagebreak --> to Word page break
  cleaned = cleaned.replace(
    /<!--\s*pagebreak\s*-->/gi,
    '<div style="page-break-after: always; height: 0; line-height: 0;"></div>'
  );

  // Convert <div class="page-break"></div>
  cleaned = cleaned.replace(
    /<div class="page-break"><\/div>/gi,
    '<div style="page-break-after: always; height: 0; line-height: 0;"></div>'
  );

  // Strip width inline styles and attributes from td/th to avoid docx xmlbuilder2 @w attribute bug
  cleaned = cleaned.replace(/(<(?:td|th)[^>]*style=")([^"]*)(")/gi, (_match, prefix, styles, suffix) => {
    const safeStyles = styles.replace(/width:\s*[^;"]+;?/gi, "");
    return `${prefix}${safeStyles}${suffix}`;
  });
  cleaned = cleaned.replace(/(<(?:td|th)[^>]*)\s+width="[^"]*"/gi, "$1");

  // Format mermaid diagram blocks into clear text callout boxes
  cleaned = cleaned.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/gi,
    (_match, code) => {
      const decoded = code
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
      return `
        <div style="background-color: #f1f5f9; border-left: 4px solid #6366f1; padding: 12px; margin: 16px 0;">
          <p style="font-weight: bold; color: #4338ca; margin: 0 0 6px 0;">แผนภาพ Mermaid (Diagram Code)</p>
          <pre style="font-family: monospace; font-size: 10pt; color: #334155; margin: 0; white-space: pre-wrap;">${decoded.trim()}</pre>
        </div>
      `;
    }
  );

  return cleaned;
}

/**
 * Generate a professional Word (.docx) document from WorkspaceData
 */
export async function renderWorkspaceDocx(
  workspace: WorkspaceData,
  outputDir?: string
): Promise<DocxExportResult> {
  const htmlToDocxMod = await import("html-to-docx");
  const htmlToDocx = htmlToDocxMod.default || htmlToDocxMod;

  const { config, files, slug } = workspace;
  const sanitizedTitle = config.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const filename = `${slug}-${sanitizedTitle}-v${config.version}.docx`;

  const primaryColor = config.theme?.primaryColor || "#0f172a";
  const accentColor = config.theme?.accentColor || "#2563eb";

  // Build Front Cover / Header HTML
  const coverHtml = `
    <div style="text-align: center; margin-top: 40px; margin-bottom: 30px;">
      <p style="font-size: 13pt; color: ${accentColor}; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 8px 0;">
        ${config.organization || "DOCUMENTATION ENGINE"}
      </p>
      <h1 style="font-size: 26pt; color: ${primaryColor}; font-weight: bold; margin: 0 0 12px 0; line-height: 1.2;">
        ${config.title}
      </h1>
      ${
        config.subtitle
          ? `<p style="font-size: 14pt; color: #475569; margin: 0 0 24px 0;">${config.subtitle}</p>`
          : ""
      }
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-top: 24px; margin-bottom: 32px; border: 1px solid #cbd5e1;">
      <tbody>
        <tr style="background-color: #f8fafc;">
          <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left; font-size: 10pt; color: #334155;">เลขที่เอกสาร (Document No.)</th>
          <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-size: 10pt; color: #0f172a; font-weight: bold;">${config.documentNumber || "-"}</td>
        </tr>
        <tr>
          <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left; font-size: 10pt; color: #334155;">เวอร์ชัน (Version)</th>
          <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-size: 10pt; color: #0f172a;">v${config.version}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left; font-size: 10pt; color: #334155;">สถานะ (Status)</th>
          <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-size: 10pt; color: #0f172a;">${config.status || "Draft"}</td>
        </tr>
        <tr>
          <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left; font-size: 10pt; color: #334155;">ผู้จัดทำ (Author)</th>
          <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-size: 10pt; color: #0f172a;">${config.author}</td>
        </tr>
        ${
          config.client
            ? `<tr style="background-color: #f8fafc;">
                <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left; font-size: 10pt; color: #334155;">ลูกค้า (Client)</th>
                <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-size: 10pt; color: #0f172a;">${config.client}</td>
              </tr>`
            : ""
        }
        <tr>
          <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left; font-size: 10pt; color: #334155;">วันที่ปรับปรุงล่าสุด (Date)</th>
          <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-size: 10pt; color: #0f172a;">${config.date}</td>
        </tr>
      </tbody>
    </table>

    <div style="page-break-after: always; height: 0; line-height: 0;"></div>
  `;

  // Combine sanitized section bodies
  const bodySections = files
    .map((file, idx) => {
      const isLast = idx === files.length - 1;
      return `
        <div class="doc-file-section" data-filename="${file.filename}">
          ${file.html}
        </div>
        ${!isLast ? '<div style="page-break-after: always; height: 0; line-height: 0;"></div>' : ""}
      `;
    })
    .join("\n");

  const rawFullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${config.title}</title>
      </head>
      <body>
        ${coverHtml}
        ${bodySections}
      </body>
    </html>
  `;

  const fullHtml = sanitizeHtmlForDocx(rawFullHtml);

  // Generate docx buffer
  const rawBuffer = await htmlToDocx(
    fullHtml,
    null,
    {
      title: config.title,
      subject: config.subtitle || "",
      creator: config.author,
      keywords: ["documentation", "spec", slug],
      orientation: config.pdfOptions?.orientation === "landscape" ? "landscape" : "portrait",
      font: "TH Sarabun New",
      fontSize: 28, // 14pt in half-points
      pageNumber: true,
      footer: true,
      margins: {
        top: 1440, // 1 inch = 1440 dxa
        right: 1440,
        bottom: 1440,
        left: 1440,
      },
    },
    null
  );

  const buffer = Buffer.isBuffer(rawBuffer)
    ? rawBuffer
    : Buffer.from(await (rawBuffer as Blob).arrayBuffer());

  let filePath: string | undefined;
  if (outputDir) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, buffer);
  }

  return {
    buffer,
    filename,
    filePath,
  };
}
