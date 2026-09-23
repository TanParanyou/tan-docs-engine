import { WorkspaceData } from "./types";

export interface MarkdownExportResult {
  content: string;
  filename: string;
}

/**
 * Generate Markdown export for a workspace
 * Supports combined all-in-one markdown or single file export
 */
export function generateWorkspaceMarkdown(
  workspace: WorkspaceData,
  singleFilename?: string
): MarkdownExportResult {
  const sanitizedTitle = workspace.config.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Export a single file if specified
  if (singleFilename) {
    const file = workspace.files.find((f) => f.filename === singleFilename);
    if (!file) {
      throw new Error(`File "${singleFilename}" not found in workspace "${workspace.slug}"`);
    }

    const cleanFilename = singleFilename.endsWith(".md")
      ? singleFilename
      : `${singleFilename}.md`;

    return {
      content: file.content,
      filename: `${workspace.slug}-${cleanFilename}`,
    };
  }

  // Combined Workspace Markdown
  const frontmatter = [
    "---",
    `title: "${workspace.config.title}"`,
    `subtitle: "${workspace.config.subtitle || ""}"`,
    `documentNumber: "${workspace.config.documentNumber || ""}"`,
    `version: "${workspace.config.version}"`,
    `status: "${workspace.config.status || "Draft"}"`,
    `author: "${workspace.config.author}"`,
    `client: "${workspace.config.client || ""}"`,
    `organization: "${workspace.config.organization || ""}"`,
    `date: "${workspace.config.date}"`,
    "---",
    "",
  ].join("\n");

  const metadataSummary = [
    `# ${workspace.config.title}`,
    "",
    workspace.config.subtitle ? `> ${workspace.config.subtitle}\n` : "",
    "| ข้อมูลเอกสาร | รายละเอียด |",
    "| :--- | :--- |",
    `| **เลขที่เอกสาร** | \`${workspace.config.documentNumber || "-"}\` |`,
    `| **เวอร์ชัน** | v${workspace.config.version} |`,
    `| **สถานะ** | ${workspace.config.status || "Draft"} |`,
    `| **ผู้จัดทำ** | ${workspace.config.author} |`,
    workspace.config.client ? `| **ลูกค้า/ผู้รับการติดตั้ง** | ${workspace.config.client} |` : null,
    workspace.config.organization ? `| **องค์กร/หน่วยงาน** | ${workspace.config.organization} |` : null,
    `| **วันที่ปรับปรุงล่าสุด** | ${workspace.config.date} |`,
    "",
    "---",
    "",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const combinedSections = workspace.files
    .map((file, idx) => {
      const sectionDivider = idx > 0 ? "\n\n<!-- pagebreak -->\n\n" : "";
      return `${sectionDivider}<!-- Section: ${file.filename} -->\n\n${file.content}`;
    })
    .join("");

  const fullContent = `${frontmatter}\n${metadataSummary}\n${combinedSections}\n`;
  const filename = `${workspace.slug}-${sanitizedTitle}-v${workspace.config.version}.md`;

  return {
    content: fullContent,
    filename,
  };
}
