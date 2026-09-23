import path from "node:path";
import fs from "node:fs";
import ExcelJS from "exceljs";
import { WorkspaceData } from "./types";
import { sanitizeDocumentFilename } from "./export-utils";

export interface ExcelExportResult {
  buffer: Buffer;
  filename: string;
  filePath?: string;
}

interface ParsedTable {
  sectionTitle: string;
  filename: string;
  headers: string[];
  rows: string[][];
}

interface ParsedRequirement {
  code: string;
  title: string;
  sourceFile: string;
  status: string;
  details: string;
}

/**
 * Extract Markdown tables from markdown content
 */
function extractMarkdownTables(content: string, filename: string): ParsedTable[] {
  const tables: ParsedTable[] = [];
  const lines = content.split("\n");
  let currentHeading = filename.replace(/\.md$/, "");

  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Track headings
    const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      currentHeading = headingMatch[1].replace(/[*_`]/g, "").trim();
    }

    // Check if line is a table row
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) =>
          c
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/&nbsp;/gi, " ")
            .replace(/[*_`]/g, "")
            .trim()
        );

      // Check if delimiter row (e.g. | :--- | :--- |)
      const isDelimiter = cells.every((c) => /^:?-+:?$/.test(c));

      if (isDelimiter) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
        tableRows = [];
      } else {
        tableRows.push(cells);
      }
    } else {
      if (inTable) {
        if (tableHeaders.length > 0 && tableRows.length > 0) {
          tables.push({
            sectionTitle: currentHeading,
            filename,
            headers: tableHeaders,
            rows: tableRows,
          });
        }
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
    }
  }

  if (inTable && tableHeaders.length > 0 && tableRows.length > 0) {
    tables.push({
      sectionTitle: currentHeading,
      filename,
      headers: tableHeaders,
      rows: tableRows,
    });
  }

  return tables;
}

/**
 * Extract checklist/requirement items from markdown content
 */
function extractRequirements(content: string, filename: string): ParsedRequirement[] {
  const items: ParsedRequirement[] = [];
  const lines = content.split("\n");
  let currentReqCode = "";
  let currentReqTitle = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Look for REQ patterns, e.g., ### REQ-001 Title
    const reqHeader = line.match(/^#{2,4}\s+(?:[\d.]+)?\s*([A-Z]+-[A-Z0-9_-]+)\s*(?:[—:-]\s*(.+))?$/i);
    if (reqHeader) {
      currentReqCode = reqHeader[1].trim();
      currentReqTitle = reqHeader[2] ? reqHeader[2].trim() : "";
    }

    // Look for Task list items: - [ ] or - [x]
    const taskMatch = line.match(/^-\s*\[([ xX])\]\s*(.+)$/);
    if (taskMatch) {
      const isChecked = taskMatch[1].toLowerCase() === "x";
      const taskText = taskMatch[2].replace(/[*_`]/g, "").trim();

      items.push({
        code: currentReqCode || `TASK-${items.length + 1}`,
        title: currentReqTitle || taskText.split(/[-–:]/)[0].trim(),
        sourceFile: filename,
        status: isChecked ? "Completed" : "Pending",
        details: taskText,
      });
    }
  }

  return items;
}

/**
 * Generate a styled Excel Workbook (.xlsx) from WorkspaceData
 */
export async function renderWorkspaceExcel(
  workspace: WorkspaceData,
  outputDir?: string
): Promise<ExcelExportResult> {
  const workbook = new ExcelJS.Workbook();
  const { config, files, slug } = workspace;

  workbook.creator = config.author || "Tan Architecture Team";
  workbook.lastModifiedBy = config.author || "Tan Architecture Team";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Primary Theme Colors (Deep Navy & Accent Blue)
  const headerFillColor = "0F172A"; // Slate 900
  const accentFillColor = "1E293B"; // Slate 800
  const subHeaderFillColor = "2563EB"; // Blue 600
  const zebraFillColor = "F8FAFC"; // Slate 50
  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "CBD5E1" } },
    left: { style: "thin", color: { argb: "CBD5E1" } },
    bottom: { style: "thin", color: { argb: "CBD5E1" } },
    right: { style: "thin", color: { argb: "CBD5E1" } },
  };

  // -------------------------------------------------------------
  // Sheet 1: Overview & Metadata
  // -------------------------------------------------------------
  const overviewSheet = workbook.addWorksheet("Overview (ภาพรวม)");
  overviewSheet.views = [{ showGridLines: true }];

  // Banner Header
  overviewSheet.mergeCells("A1:D2");
  const bannerCell = overviewSheet.getCell("A1");
  bannerCell.value = `${config.title} (v${config.version})`;
  bannerCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FFFFFF" } };
  bannerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: headerFillColor } };
  bannerCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

  if (config.subtitle) {
    overviewSheet.mergeCells("A3:D3");
    const subCell = overviewSheet.getCell("A3");
    subCell.value = config.subtitle;
    subCell.font = { name: "Calibri", size: 11, italic: true, color: { argb: "64748B" } };
    subCell.alignment = { vertical: "middle", indent: 1 };
  }

  // Metadata Table
  const metaStartRow = config.subtitle ? 5 : 4;
  overviewSheet.mergeCells(`A${metaStartRow}:B${metaStartRow}`);
  const metaHeader = overviewSheet.getCell(`A${metaStartRow}`);
  metaHeader.value = "ข้อมูลหลักของเอกสาร (Document Properties)";
  metaHeader.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFF" } };
  metaHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: accentFillColor } };

  const metaRows = [
    ["เลขที่เอกสาร (Document No.)", config.documentNumber || "-"],
    ["ชื่อระบบ/โครงการ (System Name)", config.name],
    ["เวอร์ชัน (Version)", `v${config.version}`],
    ["สถานะเอกสาร (Status)", config.status || "Draft"],
    ["ผู้จัดทำ (Author)", config.author],
    ["ลูกค้า / ผู้รับติดตั้ง (Client)", config.client || "-"],
    ["องค์กร / หน่วยงาน (Organization)", config.organization || "-"],
    ["วันที่ปรับปรุง (Last Updated)", config.date],
    ["จำนวนไฟล์หัวข้อ (File Sections)", `${files.length} ไฟล์`],
  ];

  metaRows.forEach((row, idx) => {
    const rIdx = metaStartRow + 1 + idx;
    const cellA = overviewSheet.getCell(`A${rIdx}`);
    const cellB = overviewSheet.getCell(`B${rIdx}`);

    cellA.value = row[0];
    cellA.font = { name: "Calibri", size: 10, bold: true, color: { argb: "334155" } };
    cellA.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F1F5F9" } };
    cellA.border = borderStyle;

    cellB.value = row[1];
    cellB.font = { name: "Calibri", size: 10, color: { argb: "0F172A" } };
    cellB.border = borderStyle;
  });

  // Table of Contents Section
  const tocStartRow = metaStartRow + metaRows.length + 2;
  overviewSheet.mergeCells(`A${tocStartRow}:D${tocStartRow}`);
  const tocHeader = overviewSheet.getCell(`A${tocStartRow}`);
  tocHeader.value = "สารบัญหัวข้อเอกสาร (Document Sections)";
  tocHeader.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFF" } };
  tocHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: accentFillColor } };

  const tocColumns = ["ลำดับ", "ชื่อไฟล์ (Filename)", "หัวข้อ (Section Title)", "จำนวนตัวอักษร"];
  tocColumns.forEach((col, idx) => {
    const colLetter = String.fromCharCode(65 + idx);
    const cell = overviewSheet.getCell(`${colLetter}${tocStartRow + 1}`);
    cell.value = col;
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: subHeaderFillColor } };
    cell.border = borderStyle;
    cell.alignment = { horizontal: idx === 0 ? "center" : "left" };
  });

  files.forEach((file, idx) => {
    const rIdx = tocStartRow + 2 + idx;
    const heading = file.content.match(/^#\s+(.+)$/m)?.[1]?.trim() || file.filename.replace(/\.md$/, "");

    const rowData = [
      idx + 1,
      file.filename,
      heading,
      `${file.content.length.toLocaleString()} ตัวอักษร`,
    ];

    rowData.forEach((val, cIdx) => {
      const colLetter = String.fromCharCode(65 + cIdx);
      const cell = overviewSheet.getCell(`${colLetter}${rIdx}`);
      cell.value = val;
      cell.font = { name: "Calibri", size: 10 };
      cell.border = borderStyle;
      if (idx % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: zebraFillColor } };
      }
      if (cIdx === 0) {
        cell.alignment = { horizontal: "center" };
      }
    });
  });

  overviewSheet.columns = [
    { width: 32 },
    { width: 32 },
    { width: 40 },
    { width: 22 },
  ];

  // -------------------------------------------------------------
  // Sheet 2: Extracted Tables (ตารางข้อมูลและสเปก)
  // -------------------------------------------------------------
  const allTables: ParsedTable[] = [];
  for (const file of files) {
    const extracted = extractMarkdownTables(file.content, file.filename);
    allTables.push(...extracted);
  }

  if (allTables.length > 0) {
    const tableSheet = workbook.addWorksheet("Tables & Specs (ตารางข้อมูล)");
    tableSheet.views = [{ showGridLines: true }];

    let currentRow = 1;

    for (let tIdx = 0; tIdx < allTables.length; tIdx++) {
      const table = allTables[tIdx];

      // Table Header Label
      const numCols = Math.max(table.headers.length, 2);
      const lastColLetter = String.fromCharCode(65 + numCols - 1);

      tableSheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
      const tHeadingCell = tableSheet.getCell(`A${currentRow}`);
      tHeadingCell.value = `${table.sectionTitle}  (${table.filename})`;
      tHeadingCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFF" } };
      tHeadingCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: headerFillColor } };
      tHeadingCell.alignment = { vertical: "middle", indent: 1 };
      currentRow++;

      // Table Column Headers
      table.headers.forEach((h, hIdx) => {
        const colLetter = String.fromCharCode(65 + hIdx);
        const cell = tableSheet.getCell(`${colLetter}${currentRow}`);
        cell.value = h;
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: subHeaderFillColor } };
        cell.border = borderStyle;
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });
      currentRow++;

      // Table Data Rows
      table.rows.forEach((row, rIdx) => {
        row.forEach((cellVal, cIdx) => {
          const colLetter = String.fromCharCode(65 + cIdx);
          const cell = tableSheet.getCell(`${colLetter}${currentRow}`);
          cell.value = cellVal;
          cell.font = { name: "Calibri", size: 10, color: { argb: "0F172A" } };
          cell.border = borderStyle;
          cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
          if (rIdx % 2 === 1) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: zebraFillColor } };
          }
        });
        currentRow++;
      });

      // Space between tables
      currentRow += 2;
    }

    // Auto-fit column widths
    for (let c = 1; c <= 8; c++) {
      const col = tableSheet.getColumn(c);
      let maxLength = 16;
      col.eachCell({ includeEmpty: false }, (cell) => {
        const val = cell.value ? String(cell.value) : "";
        if (val.length > maxLength && val.length < 80) {
          maxLength = Math.min(val.length + 3, 50);
        }
      });
      col.width = maxLength;
    }
  }

  // -------------------------------------------------------------
  // Sheet 3: Requirements & Checklist
  // -------------------------------------------------------------
  const allReqs: ParsedRequirement[] = [];
  for (const file of files) {
    const reqs = extractRequirements(file.content, file.filename);
    allReqs.push(...reqs);
  }

  if (allReqs.length > 0) {
    const reqSheet = workbook.addWorksheet("Requirements & Checklist");
    reqSheet.views = [{ showGridLines: true }];

    // Banner Header
    reqSheet.mergeCells("A1:E1");
    const banner = reqSheet.getCell("A1");
    banner.value = "รายการข้อกำหนดและเช็กลิสต์ (Requirements & Checklist)";
    banner.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFF" } };
    banner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: headerFillColor } };
    banner.alignment = { vertical: "middle", indent: 1 };

    const reqCols = ["รหัส (Code)", "หัวข้อ (Requirement)", "สถานะ (Status)", "ไฟล์ที่มา (Source)", "รายละเอียด (Details)"];
    reqCols.forEach((col, idx) => {
      const colLetter = String.fromCharCode(65 + idx);
      const cell = reqSheet.getCell(`${colLetter}2`);
      cell.value = col;
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: subHeaderFillColor } };
      cell.border = borderStyle;
    });

    allReqs.forEach((req, idx) => {
      const rIdx = 3 + idx;
      const rowData = [req.code, req.title, req.status, req.sourceFile, req.details];

      rowData.forEach((val, cIdx) => {
        const colLetter = String.fromCharCode(65 + cIdx);
        const cell = reqSheet.getCell(`${colLetter}${rIdx}`);
        cell.value = val;
        cell.font = { name: "Calibri", size: 10 };
        cell.border = borderStyle;
        if (idx % 2 === 1) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: zebraFillColor } };
        }
        if (cIdx === 2) {
          // Status highlight
          const isDone = val === "Completed";
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: isDone ? "166534" : "854D0E" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: isDone ? "DCFCE7" : "FEF9C3" },
          };
          cell.alignment = { horizontal: "center" };
        }
      });
    });

    reqSheet.columns = [
      { width: 18 },
      { width: 30 },
      { width: 16 },
      { width: 28 },
      { width: 45 },
    ];
  }

  const filename = sanitizeDocumentFilename(slug, config.title, config.version, "xlsx");

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

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
