import type { PDFOptions } from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import { WorkspaceData } from "./types";
import { generateWorkspaceHtml } from "./template";

function findChromeExecutable(): string | undefined {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const commonPaths = [
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    // Linux
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    // Windows
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];

  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return undefined;
}

export async function renderWorkspacePdf(
  workspace: WorkspaceData,
  outputDir = path.join(process.cwd(), "output")
): Promise<{ filePath: string; buffer: Uint8Array }> {
  const puppeteer = (await import("puppeteer")).default;
  const html = generateWorkspaceHtml(workspace);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let sanitizedTitle = workspace.config.title;
  const enMatch = sanitizedTitle.match(/\(([A-Za-z0-9\s-]+)\)/);
  if (enMatch) {
    sanitizedTitle = enMatch[1];
  }
  const cleanTitle = sanitizedTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "document";

  const filename = `${workspace.slug}-${cleanTitle}-v${workspace.config.version}.pdf`;
  const filePath = path.join(outputDir, filename);

  const executablePath = findChromeExecutable();

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--allow-file-access-from-files",
    ],
  });

  try {
    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 1600 });

    // Set HTML content
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    // Run mermaid rendering inside the page
    await page.evaluate(async () => {
      // @ts-expect-error - injected by layout.html
      if (typeof window.__renderMermaid === "function") {
        // @ts-expect-error
        await window.__renderMermaid();
      }
    });

    // Brief timeout to ensure SVG reflow and fonts have settled
    await new Promise((resolve) => setTimeout(resolve, 500));

    const pdfOptions: PDFOptions = {
      path: filePath,
      format: (workspace.config.pdfOptions?.format?.toLowerCase() as "a4" | "letter") || "a4",
      landscape: workspace.config.pdfOptions?.orientation === "landscape",
      printBackground: workspace.config.pdfOptions?.printBackground ?? true,
      displayHeaderFooter: workspace.config.pdfOptions?.displayHeaderFooter ?? true,
      headerTemplate: `
        <div style="font-size: 8px; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; padding: 0 16mm; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span>${workspace.config.name} &bull; ${workspace.config.title}</span>
          <span>${workspace.config.documentNumber ? `ID: ${workspace.config.documentNumber}` : ""}</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 8px; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; padding: 0 16mm; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <span>Version ${workspace.config.version} &bull; ${workspace.config.status || "CONFIDENTIAL"}</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "16mm",
        right: "16mm",
      },
    };

    const buffer = await page.pdf(pdfOptions);
    return { filePath, buffer };
  } finally {
    await browser.close();
  }
}
