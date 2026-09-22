import fs from "node:fs";
import path from "node:path";
import { WorkspaceData } from "./types";

const TEMPLATES_DIR = path.join(process.cwd(), "templates");

export function generateCoverPageHtml(workspace: WorkspaceData): string {
  const { config } = workspace;
  if (config.coverPage === false) {
    return "";
  }
  const logoHtml = config.theme?.logoUrl
    ? `<div class="cover-logo"><img src="${config.theme.logoUrl}" alt="Logo"></div>`
    : `<div class="cover-org">${config.organization || "ORGANIZATION"}</div>`;

  return `
  <header class="cover-page">
    <div class="cover-header">
      ${logoHtml}
      <div class="cover-badge">${config.status || "CONFIDENTIAL"}</div>
    </div>

    <div class="cover-body">
      <h1 class="cover-title">${config.title}</h1>
      ${config.subtitle ? `<p class="cover-subtitle">${config.subtitle}</p>` : ""}

      <table class="cover-meta-table">
        <tbody>
          <tr>
            <td class="label">Project</td>
            <td class="value">${config.name}</td>
          </tr>
          ${config.documentNumber ? `
          <tr>
            <td class="label">Document ID</td>
            <td class="value"><code>${config.documentNumber}</code></td>
          </tr>` : ""}
          <tr>
            <td class="label">Version</td>
            <td class="value">v${config.version}</td>
          </tr>
          <tr>
            <td class="label">Prepared By</td>
            <td class="value">${config.author}</td>
          </tr>
          ${config.client ? `
          <tr>
            <td class="label">Prepared For</td>
            <td class="value">${config.client}</td>
          </tr>` : ""}
          <tr>
            <td class="label">Issue Date</td>
            <td class="value">${config.date}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="cover-footer">
      This document contains proprietary information. All rights reserved. &bull; ${config.name} &bull; v${config.version}
    </div>
  </header>
  `;
}

export function generateWorkspaceHtml(workspace: WorkspaceData): string {
  const layoutPath = path.join(TEMPLATES_DIR, "layout.html");
  const stylePath = path.join(TEMPLATES_DIR, "style.css");

  const layoutHtml = fs.existsSync(layoutPath)
    ? fs.readFileSync(layoutPath, "utf-8")
    : `<!DOCTYPE html><html><head><title>{{documentTitle}}</title><style>{{globalStyles}}{{themeStyles}}</style></head><body>{{coverPageHtml}}<main>{{contentHtml}}</main></body></html>`;

  const globalStyles = fs.existsSync(stylePath)
    ? fs.readFileSync(stylePath, "utf-8")
    : "";

  // Dynamic Theme CSS variables from docs.config.json
  const themeVars: string[] = [];
  if (workspace.config.theme?.primaryColor) {
    themeVars.push(`--primary-color: ${workspace.config.theme.primaryColor};`);
  }
  if (workspace.config.theme?.accentColor) {
    themeVars.push(`--accent-color: ${workspace.config.theme.accentColor};`);
  }
  const themeStyles = themeVars.length > 0 ? `:root {\n  ${themeVars.join("\n  ")}\n}` : "";

  // Base href pointing to workspace src for relative images and links
  const baseHref = `file://${path.join(workspace.dirPath, "src")}/`;

  // Cover page HTML
  const coverPageHtml = generateCoverPageHtml(workspace);

  // Variable substitution
  return layoutHtml
    .replace(/\{\{documentTitle\}\}/g, `${workspace.config.name} - ${workspace.config.title}`)
    .replace(/\{\{baseHref\}\}/g, baseHref)
    .replace(/\{\{globalStyles\}\}/g, globalStyles)
    .replace(/\{\{themeStyles\}\}/g, themeStyles)
    .replace(/\{\{coverPageHtml\}\}/g, coverPageHtml)
    .replace(/\{\{contentHtml\}\}/g, workspace.combinedHtml);
}
