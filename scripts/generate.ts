#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs";
import { Command } from "commander";
import {
  getAllWorkspaceSlugs,
  getWorkspaceData,
} from "../lib/workspaces";
import { renderWorkspacePdf } from "../lib/pdf-generator";
import { renderWorkspaceDocx } from "../lib/docx-generator";
import { renderWorkspaceExcel } from "../lib/excel-generator";
import { generateWorkspaceMarkdown } from "../lib/md-generator";

const program = new Command();

program
  .name("tan-docs-engine")
  .description("Centralized documentation CLI - Generate professional PDF, DOCX, Excel, and Markdown from workspace files")
  .version("1.1.0")
  .option("-w, --workspace <name>", "Name of the workspace to build (e.g. wallet-project)")
  .option("-a, --all", "Build all available workspaces")
  .option("-f, --format <type>", "Export format: pdf, docx, excel, md, or all", "pdf")
  .option("-o, --output <directory>", "Output directory for generated files", "output");

program.parse(process.argv);
const options = program.opts();

async function buildSingleWorkspace(slug: string, outputDir: string, format: string) {
  console.log(`\n🚀 [Workspace: ${slug}] Starting build (Format: ${format.toUpperCase()})...`);
  const startTime = Date.now();

  const workspace = getWorkspaceData(slug);
  if (!workspace) {
    console.error(`❌ Error: Workspace "${slug}" not found or docs.config.json is missing.`);
    process.exitCode = 1;
    return;
  }

  console.log(`📋 Title: ${workspace.config.title} (v${workspace.config.version})`);
  console.log(`📁 Found ${workspace.files.length} markdown file(s): ${workspace.files.map(f => f.filename).join(", ")}`);

  const requestedFormat = format.toLowerCase();
  const buildPdf = requestedFormat === "pdf" || requestedFormat === "all";
  const buildDocx = requestedFormat === "docx" || requestedFormat === "all";
  const buildExcel = requestedFormat === "excel" || requestedFormat === "xlsx" || requestedFormat === "all";
  const buildMd = requestedFormat === "md" || requestedFormat === "markdown" || requestedFormat === "all";

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // 1. PDF
    if (buildPdf) {
      console.log(`🖨️  Rendering PDF via Puppeteer...`);
      const { filePath } = await renderWorkspacePdf(workspace, outputDir);
      console.log(`  ✅ PDF Generated: ${filePath}`);
    }

    // 2. Word DOCX
    if (buildDocx) {
      console.log(`📘 Generating Word (.docx)...`);
      const { filePath } = await renderWorkspaceDocx(workspace, outputDir);
      console.log(`  ✅ DOCX Generated: ${filePath}`);
    }

    // 3. Excel XLSX
    if (buildExcel) {
      console.log(`📗 Generating Excel (.xlsx)...`);
      const { filePath } = await renderWorkspaceExcel(workspace, outputDir);
      console.log(`  ✅ Excel Generated: ${filePath}`);
    }

    // 4. Combined Markdown
    if (buildMd) {
      console.log(`📑 Generating Combined Markdown (.md)...`);
      const { content, filename } = generateWorkspaceMarkdown(workspace);
      const filePath = path.join(outputDir, filename);
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`  ✅ Markdown Generated: ${filePath}`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🎉 Finished workspace "${slug}" in ${duration}s`);
  } catch (error) {
    console.error(`❌ Build failed for workspace "${slug}":`, error);
    process.exitCode = 1;
  }
}

async function main() {
  const outputDir = path.resolve(process.cwd(), options.output);
  const format = options.format || "pdf";

  if (options.all) {
    const slugs = getAllWorkspaceSlugs();
    if (slugs.length === 0) {
      console.log("⚠️ No workspaces found in /workspaces directory.");
      return;
    }
    console.log(`\n📦 Found ${slugs.length} workspace(s) to build: ${slugs.join(", ")}`);
    for (const slug of slugs) {
      await buildSingleWorkspace(slug, outputDir, format);
    }
    console.log(`\n🎉 All workspaces processed successfully! Output directory: ${outputDir}\n`);
    return;
  }

  if (options.workspace) {
    await buildSingleWorkspace(options.workspace, outputDir, format);
    return;
  }

  // If neither --workspace nor --all provided, show interactive guide
  const available = getAllWorkspaceSlugs();
  console.log("\n📖 tan-docs-engine CLI");
  console.log("======================");
  console.log("Usage:");
  console.log("  npm run generate -- --workspace <workspace-name> [--format pdf|docx|excel|md|all]");
  console.log("  npm run generate -- --all [--format pdf|docx|excel|md|all]");
  console.log("\nAvailable workspaces in this repo:");
  if (available.length === 0) {
    console.log("  (None found)");
  } else {
    for (const ws of available) {
      console.log(`  - ${ws}`);
    }
  }
  console.log("\nExamples:");
  console.log("  npm run generate -- --workspace wallet-project --format docx");
  console.log("  npm run generate -- --workspace wallet-project --format excel");
  console.log("  npm run generate -- --workspace wallet-project --format all\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
