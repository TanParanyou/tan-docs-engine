#!/usr/bin/env node

import path from "node:path";
import { Command } from "commander";
import {
  getAllWorkspaceSlugs,
  getWorkspaceData,
  getAllWorkspaces,
} from "../lib/workspaces";
import { renderWorkspacePdf } from "../lib/pdf-generator";

const program = new Command();

program
  .name("tan-docs-engine")
  .description("Centralized documentation CLI - Generate professional PDFs from workspace markdown files")
  .version("1.0.0")
  .option("-w, --workspace <name>", "Name of the workspace to build (e.g. wallet-project)")
  .option("-a, --all", "Build all available workspaces")
  .option("-o, --output <directory>", "Output directory for generated PDFs", "output");

program.parse(process.argv);
const options = program.opts();

async function buildSingleWorkspace(slug: string, outputDir: string) {
  console.log(`\n🚀 [Workspace: ${slug}] Starting build...`);
  const startTime = Date.now();

  const workspace = getWorkspaceData(slug);
  if (!workspace) {
    console.error(`❌ Error: Workspace "${slug}" not found or docs.config.json is missing.`);
    process.exitCode = 1;
    return;
  }

  console.log(`📋 Title: ${workspace.config.title} (v${workspace.config.version})`);
  console.log(`📁 Found ${workspace.files.length} markdown file(s): ${workspace.files.map(f => f.filename).join(", ")}`);
  console.log(`🎨 Theme: Primary=${workspace.config.theme?.primaryColor || "default"}, Accent=${workspace.config.theme?.accentColor || "default"}`);
  console.log(`🖨️  Rendering PDF via Puppeteer (Mermaid + A4 + Custom Headers)...`);

  try {
    const { filePath } = await renderWorkspacePdf(workspace, outputDir);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Success! Generated PDF: ${filePath} (${duration}s)`);
  } catch (error) {
    console.error(`❌ Build failed for workspace "${slug}":`, error);
    process.exitCode = 1;
  }
}

async function main() {
  const outputDir = path.resolve(process.cwd(), options.output);

  if (options.all) {
    const slugs = getAllWorkspaceSlugs();
    if (slugs.length === 0) {
      console.log("⚠️ No workspaces found in /workspaces directory.");
      return;
    }
    console.log(`\n📦 Found ${slugs.length} workspace(s) to build: ${slugs.join(", ")}`);
    for (const slug of slugs) {
      await buildSingleWorkspace(slug, outputDir);
    }
    console.log(`\n🎉 All workspaces processed successfully! Output directory: ${outputDir}\n`);
    return;
  }

  if (options.workspace) {
    await buildSingleWorkspace(options.workspace, outputDir);
    return;
  }

  // If neither --workspace nor --all provided, show interactive guide
  const available = getAllWorkspaceSlugs();
  console.log("\n📖 tan-docs-engine CLI");
  console.log("======================");
  console.log("Usage:");
  console.log("  npm run generate -- --workspace <workspace-name>");
  console.log("  npm run generate -- --all");
  console.log("\nAvailable workspaces in this repo:");
  if (available.length === 0) {
    console.log("  (None found)");
  } else {
    for (const ws of available) {
      console.log(`  - ${ws}`);
    }
  }
  console.log("\nExample:");
  console.log("  npm run generate -- --workspace wallet-project\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
