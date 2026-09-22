import fs from "node:fs";
import path from "node:path";
import { DocsConfig, MarkdownFileItem, WorkspaceData } from "./types";
import { renderMarkdown } from "./markdown";

const WORKSPACES_DIR = path.join(process.cwd(), "workspaces");

export function getAllWorkspaceSlugs(): string[] {
  if (!fs.existsSync(WORKSPACES_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(WORKSPACES_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => {
      const configPath = path.join(WORKSPACES_DIR, slug, "docs.config.json");
      return fs.existsSync(configPath);
    });
}

export function getWorkspaceConfig(slug: string): DocsConfig | null {
  const configPath = path.join(WORKSPACES_DIR, slug, "docs.config.json");
  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as DocsConfig;
  } catch (error) {
    console.error(`Failed to parse docs.config.json for workspace "${slug}":`, error);
    return null;
  }
}

export function getWorkspaceData(slug: string): WorkspaceData | null {
  const workspacePath = path.join(WORKSPACES_DIR, slug);
  const config = getWorkspaceConfig(slug);

  if (!config) {
    return null;
  }

  const srcDir = path.join(workspacePath, "src");
  let fileList: string[] = [];

  if (Array.isArray(config.files) && config.files.length > 0) {
    fileList = config.files;
  } else if (fs.existsSync(srcDir)) {
    // Auto-discover all .md files in src/ and sort alphabetically
    fileList = fs
      .readdirSync(srcDir)
      .filter((file) => file.endsWith(".md"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  }

  const markdownFiles: MarkdownFileItem[] = [];

  for (const filename of fileList) {
    const filePath = path.join(srcDir, filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const html = renderMarkdown(content);
      markdownFiles.push({
        filename,
        relativePath: path.relative(workspacePath, filePath),
        content,
        html,
      });
    }
  }

  // Combine HTML with page breaks between sections
  const combinedHtml = markdownFiles
    .map((file, index) => {
      const sectionHtml = `<section class="doc-section" data-filename="${file.filename}">\n${file.html}\n</section>`;
      if (index < markdownFiles.length - 1) {
        return sectionHtml + '\n<div class="page-break"></div>';
      }
      return sectionHtml;
    })
    .join("\n\n");

  return {
    slug,
    dirPath: workspacePath,
    config,
    files: markdownFiles,
    combinedHtml,
  };
}

export function getAllWorkspaces(): WorkspaceData[] {
  const slugs = getAllWorkspaceSlugs();
  const list: WorkspaceData[] = [];

  for (const slug of slugs) {
    const data = getWorkspaceData(slug);
    if (data) {
      list.push(data);
    }
  }

  return list;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(slug);
}

export function isValidFilename(filename: string): boolean {
  return /^[a-zA-Z0-9_-]+\.md$/.test(filename);
}

export function createWorkspace(input: import("./types").CreateWorkspaceInput): WorkspaceData {
  if (!isValidSlug(input.slug)) {
    throw new Error("Invalid workspace slug. Only letters, numbers, hyphens, and underscores are allowed.");
  }

  const workspacePath = path.join(WORKSPACES_DIR, input.slug);
  if (fs.existsSync(workspacePath)) {
    throw new Error(`Workspace "${input.slug}" already exists.`);
  }

  const srcDir = path.join(workspacePath, "src");
  const assetsDir = path.join(srcDir, "assets");
  fs.mkdirSync(assetsDir, { recursive: true });

  const initialFilename = "01-system-overview.md";
  const initialConfig: DocsConfig = {
    name: input.name,
    title: input.title,
    subtitle: input.subtitle || "",
    documentNumber: input.documentNumber || `DOC-${input.slug.toUpperCase()}-001`,
    version: input.version || "1.0.0",
    status: input.status || "Draft",
    author: input.author,
    client: input.client || "",
    organization: input.organization || "TAN TECHNOLOGY SOLUTIONS",
    date: new Date().toISOString().split("T")[0],
    files: [initialFilename],
    theme: {
      primaryColor: input.theme?.primaryColor || "#0f172a",
      accentColor: input.theme?.accentColor || "#2563eb",
    },
    pdfOptions: {
      format: "A4",
      orientation: "portrait",
      printBackground: true,
      displayHeaderFooter: true,
    },
  };

  fs.writeFileSync(
    path.join(workspacePath, "docs.config.json"),
    JSON.stringify(initialConfig, null, 2),
    "utf-8"
  );

  const initialContent = `# ${input.title}\n\n## 1. บทนำและวัตถุประสงค์ (Overview)\nยินดีต้อนรับสู่เอกสารสเปกของ **${input.name}**\n\n- **Project:** ${input.name}\n- **Version:** v${initialConfig.version}\n- **Author:** ${input.author}\n\n## 2. แผนภาพสถาปัตยกรรม (Architecture Flowchart)\n\`\`\`mermaid\ngraph TD\n  Client[User Application] --> Gateway[API Gateway]\n  Gateway --> Service[Core Microservice]\n  Service --> DB[(Database Cluster)]\n\`\`\`\n\n<!-- pagebreak -->\n\n## 3. รายละเอียดระบบ (System Specifications)\n| โมดูล (Module) | รายละเอียด (Description) | สถานะ (Status) |\n| :--- | :--- | :--- |\n| Core Engine | ประมวลผลและจัดการข้อมูลหลัก | กำลังพัฒนา |\n| Security & Auth | การยืนยันตัวตนและการเข้าถึง | เสร็จสมบูรณ์ |\n`;

  fs.writeFileSync(path.join(srcDir, initialFilename), initialContent, "utf-8");

  const data = getWorkspaceData(input.slug);
  if (!data) {
    throw new Error("Failed to load newly created workspace.");
  }
  return data;
}

export function updateWorkspaceConfig(slug: string, partialConfig: Partial<DocsConfig>): DocsConfig {
  if (!isValidSlug(slug)) {
    throw new Error("Invalid workspace slug.");
  }

  const configPath = path.join(WORKSPACES_DIR, slug, "docs.config.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(`Workspace "${slug}" not found.`);
  }

  const currentConfig = getWorkspaceConfig(slug);
  if (!currentConfig) {
    throw new Error(`Failed to read current config for "${slug}".`);
  }

  const updatedConfig: DocsConfig = {
    ...currentConfig,
    ...partialConfig,
    theme: {
      ...currentConfig.theme,
      ...partialConfig.theme,
    },
    pdfOptions: {
      ...currentConfig.pdfOptions,
      ...partialConfig.pdfOptions,
    },
  };

  fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), "utf-8");
  return updatedConfig;
}

export function listWorkspaceFiles(slug: string): { files: { filename: string; title: string }[]; orderedFiles: string[] } {
  if (!isValidSlug(slug)) {
    throw new Error("Invalid workspace slug.");
  }

  const workspacePath = path.join(WORKSPACES_DIR, slug);
  const config = getWorkspaceConfig(slug);
  if (!config) {
    throw new Error(`Workspace "${slug}" not found.`);
  }

  const srcDir = path.join(workspacePath, "src");
  if (!fs.existsSync(srcDir)) {
    return { files: [], orderedFiles: [] };
  }

  const allDiskFiles = fs
    .readdirSync(srcDir)
    .filter((f) => f.endsWith(".md"));

  const orderedFiles = Array.isArray(config.files) && config.files.length > 0
    ? config.files.filter((f) => allDiskFiles.includes(f))
    : allDiskFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  // Include any disk files that might not be in config.files
  for (const f of allDiskFiles) {
    if (!orderedFiles.includes(f)) {
      orderedFiles.push(f);
    }
  }

  const files = orderedFiles.map((filename) => {
    let title = filename.replace(/\.md$/, "");
    try {
      const content = fs.readFileSync(path.join(srcDir, filename), "utf-8");
      const firstHeading = content.match(/^#\s+(.+)$/m);
      if (firstHeading && firstHeading[1]) {
        title = firstHeading[1].trim();
      }
    } catch {
      // ignore
    }
    return { filename, title };
  });

  return { files, orderedFiles };
}

export function createWorkspaceFile(slug: string, filename: string, content?: string): void {
  if (!isValidSlug(slug)) {
    throw new Error("Invalid workspace slug.");
  }
  if (!isValidFilename(filename)) {
    throw new Error("Invalid filename. Must end with .md and contain only alphanumeric, hyphen, and underscore.");
  }

  const srcDir = path.join(WORKSPACES_DIR, slug, "src");
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  const filePath = path.join(srcDir, filename);
  if (fs.existsSync(filePath)) {
    throw new Error(`File "${filename}" already exists.`);
  }

  const initialContent = content || `# ${filename.replace(/\.md$/, "")}\n\nเนื้อหาสำหรับส่วนนี้...\n`;
  fs.writeFileSync(filePath, initialContent, "utf-8");

  // Append to config.files
  const config = getWorkspaceConfig(slug);
  if (config) {
    const currentFiles = Array.isArray(config.files) ? config.files : [];
    if (!currentFiles.includes(filename)) {
      updateWorkspaceConfig(slug, { files: [...currentFiles, filename] });
    }
  }
}

export function deleteWorkspaceFile(slug: string, filename: string): void {
  if (!isValidSlug(slug) || !isValidFilename(filename)) {
    throw new Error("Invalid slug or filename.");
  }

  const filePath = path.join(WORKSPACES_DIR, slug, "src", filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const config = getWorkspaceConfig(slug);
  if (config && Array.isArray(config.files)) {
    updateWorkspaceConfig(slug, {
      files: config.files.filter((f) => f !== filename),
    });
  }
}

export function renameWorkspaceFile(slug: string, oldFilename: string, newFilename: string): void {
  if (!isValidSlug(slug) || !isValidFilename(oldFilename) || !isValidFilename(newFilename)) {
    throw new Error("Invalid slug or filename.");
  }

  const srcDir = path.join(WORKSPACES_DIR, slug, "src");
  const oldPath = path.join(srcDir, oldFilename);
  const newPath = path.join(srcDir, newFilename);

  if (!fs.existsSync(oldPath)) {
    throw new Error(`File "${oldFilename}" does not exist.`);
  }
  if (fs.existsSync(newPath)) {
    throw new Error(`File "${newFilename}" already exists.`);
  }

  fs.renameSync(oldPath, newPath);

  const config = getWorkspaceConfig(slug);
  if (config && Array.isArray(config.files)) {
    updateWorkspaceConfig(slug, {
      files: config.files.map((f) => (f === oldFilename ? newFilename : f)),
    });
  }
}

export function reorderWorkspaceFiles(slug: string, filenames: string[]): void {
  if (!isValidSlug(slug)) {
    throw new Error("Invalid slug.");
  }
  for (const f of filenames) {
    if (!isValidFilename(f)) {
      throw new Error(`Invalid filename: ${f}`);
    }
  }

  updateWorkspaceConfig(slug, { files: filenames });
}

export function readWorkspaceFileContent(slug: string, filename: string): string {
  if (!isValidSlug(slug) || !isValidFilename(filename)) {
    throw new Error("Invalid slug or filename.");
  }

  const filePath = path.join(WORKSPACES_DIR, slug, "src", filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File "${filename}" not found in workspace "${slug}".`);
  }

  return fs.readFileSync(filePath, "utf-8");
}

export function writeWorkspaceFileContent(slug: string, filename: string, content: string): void {
  if (!isValidSlug(slug) || !isValidFilename(filename)) {
    throw new Error("Invalid slug or filename.");
  }

  const srcDir = path.join(WORKSPACES_DIR, slug, "src");
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  const filePath = path.join(srcDir, filename);
  fs.writeFileSync(filePath, content, "utf-8");
}
