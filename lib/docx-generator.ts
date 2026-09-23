import path from "node:path";
import fs from "node:fs";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  HeadingLevel,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  ShadingType,
  ImageRun,
  TableLayoutType,
  VerticalAlign,
} from "docx";
import { WorkspaceData } from "./types";
import { sanitizeDocumentFilename } from "./export-utils";

export interface DocxExportResult {
  buffer: Buffer;
  filename: string;
  filePath?: string;
}

/**
 * Clean hex color string for docx (removes leading #)
 */
function cleanHex(color?: string, fallback: string = "0F172A"): string {
  if (!color) return fallback;
  const cleaned = color.replace(/^#/, "").trim();
  return /^[0-9A-Fa-f]{6}$/.test(cleaned) ? cleaned : fallback;
}

/**
 * Decode common HTML entities into native characters
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&nbsp;/gi, "\u00A0")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–");
}

/**
 * Parse inline markdown tokens (**bold**, *italic*, `code`, ~~strike~~) into docx TextRuns
 */
function parseInlineMarkdown(
  text: string,
  baseFontColor: string = "0F172A",
  fontSize: number = 24
): TextRun[] {
  const decodedText = decodeHtmlEntities(text);
  const runs: TextRun[] = [];
  // Tokenize regex: matches **bold**, *italic*, `code`, ~~strike~~
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|~~.*?~~)/g;
  const parts = decodedText.split(regex);

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      runs.push(
        new TextRun({
          text: part.slice(2, -2),
          bold: true,
          font: "Sarabun",
          size: fontSize,
          color: baseFontColor,
        })
      );
    } else if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      runs.push(
        new TextRun({
          text: part.slice(1, -1),
          italics: true,
          font: "Sarabun",
          size: fontSize,
          color: baseFontColor,
        })
      );
    } else if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      const codeContent = part.slice(1, -1);
      // Check if it's an inline checkbox option like `[x] ยืนยัน` or `[ ] ขอแก้ไข`
      const checkMatch = codeContent.match(/^\[([ xX])\]\s*(.*)$/);
      if (checkMatch) {
        const isChecked = checkMatch[1].toLowerCase() === "x";
        const label = checkMatch[2].trim();
        runs.push(
          new TextRun({
            text: isChecked ? "☑  " : "☐  ",
            bold: true,
            font: "Arial",
            size: fontSize,
            color: isChecked ? "16A34A" : "94A3B8",
          })
        );
        if (label) {
          runs.push(
            new TextRun({
              text: label,
              bold: isChecked,
              font: "Sarabun",
              size: fontSize,
              color: isChecked ? "0F172A" : "64748B",
            })
          );
        }
      } else {
        runs.push(
          new TextRun({
            text: ` ${codeContent} `,
            font: "Consolas",
            size: Math.max(fontSize - 4, 18),
            color: "1E293B",
            shading: {
              fill: "F1F5F9",
              type: ShadingType.CLEAR,
            },
          })
        );
      }
    } else if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
      runs.push(
        new TextRun({
          text: part.slice(2, -2),
          strike: true,
          font: "Sarabun",
          size: fontSize,
          color: "64748B",
        })
      );
    } else {
      // Check if plain text contains checkboxes like [x] or [ ]
      const checkboxRegex = /(\[[ xX]\])/g;
      const subparts = part.split(checkboxRegex);
      for (const sub of subparts) {
        if (!sub) continue;
        const boxMatch = sub.match(/^\[([ xX])\]$/);
        if (boxMatch) {
          const isChecked = boxMatch[1].toLowerCase() === "x";
          runs.push(
            new TextRun({
              text: isChecked ? "☑  " : "☐  ",
              bold: true,
              font: "Arial",
              size: fontSize,
              color: isChecked ? "16A34A" : "94A3B8",
            })
          );
        } else {
          runs.push(
            new TextRun({
              text: sub,
              font: "Sarabun",
              size: fontSize,
              color: baseFontColor,
            })
          );
        }
      }
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text: "", font: "Sarabun", size: fontSize })];
}

const PAGE_CONTENT_WIDTH_DXA = 9026; // Standard A4 (11906) minus 1 inch margins on each side (1440 * 2)

/**
 * Calculate proportional column widths in DXA based on content length
 * Ensures exact fit across the printable page width (9026 dxa) without column clipping in Google Docs
 */
function calculateColumnWidths(parsedRows: string[][], numCols: number): number[] {
  const colLengths: number[] = new Array(numCols).fill(0);

  for (const row of parsedRows) {
    for (let c = 0; c < numCols; c++) {
      const cellText = row[c] || "";
      // Split on <br> so that multi-line cells are measured by max line length, not total string length
      const sublines = cellText.split(/<br\s*\/?>/gi);
      const maxSublineLen = Math.max(
        ...sublines.map((sub) => sub.replace(/[*_`]/g, "").trim().length),
        0
      );
      colLengths[c] = Math.max(colLengths[c], maxSublineLen);
    }
  }

  // Weight columns with minimum (12) and maximum (50) clamping
  const weights = colLengths.map((len) => Math.min(Math.max(len, 12), 50));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let allocated = 0;
  const widths: number[] = [];

  for (let c = 0; c < numCols - 1; c++) {
    const w = Math.round((weights[c] / totalWeight) * PAGE_CONTENT_WIDTH_DXA);
    widths.push(w);
    allocated += w;
  }

  // Last column receives remaining dxa to guarantee exactly 9026 dxa
  widths.push(PAGE_CONTENT_WIDTH_DXA - allocated);

  return widths;
}

/**
 * Parse markdown table lines into a well-structured docx Table
 * Specifically optimized with DXA grid columns for Google Docs, Word, and LibreOffice
 */
type AlignmentTypeValue = (typeof AlignmentType)[keyof typeof AlignmentType];

function parseTableBlock(
  tableLines: string[],
  primaryColor: string
): Table {
  const parsedRows: string[][] = [];
  let alignments: AlignmentTypeValue[] = [];

  for (const line of tableLines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) continue;

    // Handle escaped pipes \|
    const sanitizedLine = trimmed.slice(1, -1).replace(/\\\|/g, "___ESCAPED_PIPE___");
    const cells = sanitizedLine
      .split("|")
      .map((c) => c.replace(/___ESCAPED_PIPE___/g, "|").trim());

    // Check separator/delimiter rows like | :--- | :---: | ---: |
    if (cells.every((c) => /^:?-+:?$/.test(c))) {
      alignments = cells.map((c) => {
        const left = c.startsWith(":");
        const right = c.endsWith(":");
        if (left && right) return AlignmentType.CENTER;
        if (right) return AlignmentType.RIGHT;
        return AlignmentType.LEFT;
      });
      continue;
    }

    parsedRows.push(cells);
  }

  if (parsedRows.length === 0) {
    return new Table({ rows: [] });
  }

  const numCols = Math.max(...parsedRows.map((r) => r.length), 1);
  const columnWidths = calculateColumnWidths(parsedRows, numCols);

  const cellBorderConfig = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  };

  const tableRows: TableRow[] = [];

  parsedRows.forEach((rowCells, rIdx) => {
    const isHeader = rIdx === 0;
    const isEven = rIdx % 2 === 0;

    const cells: TableCell[] = [];
    for (let c = 0; c < numCols; c++) {
      const cellText = rowCells[c] || "";
      const colAlign = alignments[c] || (isHeader ? AlignmentType.CENTER : AlignmentType.LEFT);

      // Handle <br> tags within table cells into clean separate paragraphs
      const sublines = cellText.split(/<br\s*\/?>/gi);
      const cellParagraphs: Paragraph[] = [];

      if (isHeader) {
        sublines.forEach((subline) => {
          const trimmedSub = subline.trim();
          cellParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmedSub.replace(/[*_`]/g, ""),
                  bold: true,
                  color: "FFFFFF",
                  font: "Sarabun",
                  size: 21, // 10.5pt for clean header
                }),
              ],
              spacing: { before: 20, after: 20, line: 260 },
              alignment: colAlign,
            })
          );
        });
      } else {
        sublines.forEach((subline) => {
          const trimmedSub = subline.trim();
          if (!trimmedSub) {
            // Empty subline creates blank line spacing (e.g. for signature line gaps)
            cellParagraphs.push(
              new Paragraph({
                children: [new TextRun({ text: " ", font: "Sarabun", size: 16 })],
                spacing: { before: 40, after: 40 },
              })
            );
          } else {
            cellParagraphs.push(
              new Paragraph({
                children: parseInlineMarkdown(trimmedSub, "0F172A", 20), // 10pt for table cells
                spacing: { before: 20, after: 20, line: 280 },
                alignment: colAlign,
              })
            );
          }
        });
      }

      cells.push(
        new TableCell({
          width: { size: columnWidths[c], type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          shading: {
            fill: isHeader ? primaryColor : isEven ? "F8FAFC" : "FFFFFF",
            type: ShadingType.CLEAR,
          },
          margins: {
            top: 120,
            bottom: 120,
            left: 140,
            right: 140,
          },
          borders: cellBorderConfig,
          children: cellParagraphs.length > 0 ? cellParagraphs : [new Paragraph({})],
        })
      );
    }

    tableRows.push(
      new TableRow({
        tableHeader: isHeader,
        cantSplit: true,
        children: cells,
      })
    );
  });

  return new Table({
    width: { size: PAGE_CONTENT_WIDTH_DXA, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
    columnWidths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    },
    rows: tableRows,
  });
}

/**
 * Parse Markdown document content into high-fidelity docx Paragraph and Table elements
 */
function parseMarkdownToDocxElements(
  content: string,
  primaryColor: string,
  accentColor: string,
  workspaceDir?: string
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const lines = content.split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Page breaks
    if (/<!--\s*pagebreak\s*-->/i.test(trimmed) || /<div class="page-break"><\/div>/i.test(trimmed)) {
      elements.push(new Paragraph({ children: [new PageBreak()] }));
      i++;
      continue;
    }

    // 2. Headings (#, ##, ###, ####)
    const h1Match = trimmed.match(/^#\s+(.+)$/);
    if (h1Match) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: h1Match[1].replace(/[*_`]/g, "").trim(),
              bold: true,
              color: primaryColor,
              font: "Sarabun",
              size: 38, // 19pt
            }),
          ],
          spacing: { before: 360, after: 180, line: 360 },
        })
      );
      i++;
      continue;
    }

    const h2Match = trimmed.match(/^##\s+(.+)$/);
    if (h2Match) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: h2Match[1].replace(/[*_`]/g, "").trim(),
              bold: true,
              color: accentColor,
              font: "Sarabun",
              size: 30, // 15pt
            }),
          ],
          spacing: { before: 280, after: 140, line: 340 },
        })
      );
      i++;
      continue;
    }

    const h3Match = trimmed.match(/^###\s+(.+)$/);
    if (h3Match) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [
            new TextRun({
              text: h3Match[1].replace(/[*_`]/g, "").trim(),
              bold: true,
              color: "1E293B",
              font: "Sarabun",
              size: 26, // 13pt
            }),
          ],
          spacing: { before: 220, after: 100, line: 320 },
        })
      );
      i++;
      continue;
    }

    const h4Match = trimmed.match(/^####\s+(.+)$/);
    if (h4Match) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_4,
          children: [
            new TextRun({
              text: h4Match[1].replace(/[*_`]/g, "").trim(),
              bold: true,
              color: "334155",
              font: "Sarabun",
              size: 24, // 12pt
            }),
          ],
          spacing: { before: 180, after: 80, line: 300 },
        })
      );
      i++;
      continue;
    }

    // 3. Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      elements.push(
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
          },
          spacing: { before: 180, after: 180 },
        })
      );
      i++;
      continue;
    }

    // 4. Code Blocks (```) including Mermaid diagrams
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim().toLowerCase();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```

      const codeText = codeLines.join("\n");

      if (lang === "mermaid") {
        // Render as Mermaid Callout Box
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "📊 แผนภาพสถาปัตยกรรม (Mermaid Diagram Code)",
                bold: true,
                color: "4338CA",
                font: "Sarabun",
                size: 22,
              }),
            ],
            spacing: { before: 180, after: 60 },
            border: {
              left: { style: BorderStyle.SINGLE, size: 24, color: "6366F1" },
            },
            shading: { fill: "EEF2FF", type: ShadingType.CLEAR },
            indent: { left: 240 },
          })
        );
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: codeText,
                font: "Consolas",
                size: 18,
                color: "334155",
              }),
            ],
            spacing: { before: 40, after: 180 },
            border: {
              left: { style: BorderStyle.SINGLE, size: 24, color: "6366F1" },
            },
            shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
            indent: { left: 240 },
          })
        );
      } else {
        // Standard Code Box
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: codeText,
                font: "Consolas",
                size: 19,
                color: "1E293B",
              }),
            ],
            border: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
            },
            shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
            spacing: { before: 120, after: 160 },
            indent: { left: 200, right: 200 },
          })
        );
      }
      continue;
    }

    // 5. Blockquotes (> ...)
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const quoteText = quoteLines.join(" ");
      elements.push(
        new Paragraph({
          children: parseInlineMarkdown(quoteText, "334155"),
          border: {
            left: { style: BorderStyle.SINGLE, size: 24, color: accentColor },
          },
          indent: { left: 320 },
          shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
          spacing: { before: 120, after: 160, line: 320 },
        })
      );
      continue;
    }

    // 6. Markdown Tables (| col1 | col2 |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(parseTableBlock(tableLines, primaryColor));
      // Space after table
      elements.push(new Paragraph({ spacing: { before: 100, after: 100 } }));
      continue;
    }

    // 7. Task Lists (- [ ] or - [x] or * [x])
    const taskMatch = trimmed.match(/^[-*]\s*\[([ xX])\]\s*(.+)$/);
    if (taskMatch) {
      const isChecked = taskMatch[1].toLowerCase() === "x";
      const taskBody = taskMatch[2];
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: isChecked ? "☑  " : "☐  ",
              bold: true,
              font: "Arial",
              color: isChecked ? "16A34A" : "94A3B8",
              size: 24,
            }),
            ...parseInlineMarkdown(taskBody, isChecked ? "0F172A" : "334155"),
          ],
          spacing: { before: 60, after: 60, line: 300 },
          indent: { left: 360 },
        })
      );
      i++;
      continue;
    }

    // 8. Bullet Lists (- item or * item)
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      elements.push(
        new Paragraph({
          bullet: { level: 0 },
          children: parseInlineMarkdown(bulletMatch[1], "0F172A"),
          spacing: { before: 60, after: 60, line: 300 },
        })
      );
      i++;
      continue;
    }

    // 9. Numbered Lists (1. item)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${numMatch[1]}. `,
              bold: true,
              font: "Sarabun",
              size: 24,
              color: primaryColor,
            }),
            ...parseInlineMarkdown(numMatch[2], "0F172A"),
          ],
          spacing: { before: 60, after: 60, line: 300 },
          indent: { left: 360 },
        })
      );
      i++;
      continue;
    }

    // 10. Image Tags (![alt](path))
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const altText = imgMatch[1].trim();
      const rawImgPath = imgMatch[2].trim();

      let imgBuffer: Buffer | null = null;
      try {
        if (!rawImgPath.startsWith("http://") && !rawImgPath.startsWith("https://")) {
          const candidates = [
            workspaceDir ? path.resolve(workspaceDir, "src", rawImgPath) : null,
            workspaceDir ? path.resolve(workspaceDir, rawImgPath) : null,
            path.resolve(process.cwd(), "public", rawImgPath.replace(/^\//, "")),
          ].filter(Boolean) as string[];

          for (const cand of candidates) {
            if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
              imgBuffer = fs.readFileSync(cand);
              break;
            }
          }
        }
      } catch (err) {
        // Fallback gracefully if image cannot be read
      }

      if (imgBuffer) {
        const ext = path.extname(rawImgPath).toLowerCase().replace(/^\./, "");
        const imageType: "png" | "jpg" | "gif" =
          ext === "jpeg" || ext === "jpg"
            ? "jpg"
            : ext === "gif"
            ? "gif"
            : "png";

        elements.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: imgBuffer,
                transformation: {
                  width: 520,
                  height: 320,
                },
                type: imageType,
              }),
            ],
            spacing: { before: 160, after: 60 },
          })
        );
        if (altText) {
          elements.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: altText,
                  font: "Sarabun",
                  italics: true,
                  size: 20,
                  color: "64748B",
                }),
              ],
              spacing: { after: 180 },
            })
          );
        }
        i++;
        continue;
      }
    }

    // 11. Empty lines or standalone <br>
    if (trimmed === "" || /^<br\s*\/?>$/i.test(trimmed)) {
      if (/^<br\s*\/?>$/i.test(trimmed)) {
        elements.push(new Paragraph({ spacing: { before: 80, after: 80 } }));
      }
      i++;
      continue;
    }

    // 12. Normal Paragraph (split on <br> if embedded)
    const paraSublines = trimmed.split(/<br\s*\/?>/gi);
    for (const sub of paraSublines) {
      const subTrimmed = sub.trim();
      if (!subTrimmed) {
        elements.push(new Paragraph({ spacing: { before: 60, after: 60 } }));
      } else {
        elements.push(
          new Paragraph({
            children: parseInlineMarkdown(subTrimmed, "0F172A"),
            spacing: { before: 60, after: 80, line: 340 },
          })
        );
      }
    }
    i++;
  }

  return elements;
}

/**
 * Generate a professional Word (.docx) document fully compatible with Google Docs and Microsoft Word
 */
export async function renderWorkspaceDocx(
  workspace: WorkspaceData,
  outputDir?: string
): Promise<DocxExportResult> {
  const { config, files, slug } = workspace;
  const filename = sanitizeDocumentFilename(slug, config.title, config.version, "docx");

  const primaryColor = cleanHex(config.theme?.primaryColor, "0F172A");
  const accentColor = cleanHex(config.theme?.accentColor, "2563EB");

  // Build Front Cover / Metadata Summary Table
  const metaBorderConfig = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  };

  const metaRowsData: [string, string][] = [
    ["เลขที่เอกสาร (Document No.)", config.documentNumber || "-"],
    ["เวอร์ชัน (Version)", `v${config.version}`],
    ["สถานะ (Status)", config.status || "Draft"],
    ["ผู้จัดทำ (Author)", config.author],
  ];

  if (config.client) {
    metaRowsData.push(["ลูกค้า (Client)", config.client]);
  }
  if (config.organization) {
    metaRowsData.push(["องค์กร / บริษัท", config.organization]);
  }
  metaRowsData.push(["วันที่ปรับปรุงล่าสุด (Date)", config.date]);

  const metaCol1Width = 3000;
  const metaCol2Width = PAGE_CONTENT_WIDTH_DXA - metaCol1Width; // 6026

  const metaTableRows = metaRowsData.map(([label, value], idx) => {
    const isEven = idx % 2 === 0;
    return new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: metaCol1Width, type: WidthType.DXA },
          shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          borders: metaBorderConfig,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: label,
                  bold: true,
                  font: "Sarabun",
                  size: 22,
                  color: "334155",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: metaCol2Width, type: WidthType.DXA },
          shading: { fill: isEven ? "F8FAFC" : "FFFFFF", type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          borders: metaBorderConfig,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: value,
                  bold: label.includes("เลขที่เอกสาร"),
                  font: "Sarabun",
                  size: 22,
                  color: "0F172A",
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  const metaTable = new Table({
    width: { size: PAGE_CONTENT_WIDTH_DXA, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
    columnWidths: [metaCol1Width, metaCol2Width],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    },
    rows: metaTableRows,
  });

  // Cover Page Elements
  const coverElements: (Paragraph | Table)[] = [
    // Top organization badge
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: (config.organization || "DOCUMENTATION ENGINE").toUpperCase(),
          font: "Sarabun",
          bold: true,
          size: 22,
          color: accentColor,
        }),
      ],
      spacing: { before: 800, after: 200 },
    }),

    // Document Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: config.title,
          font: "Sarabun",
          bold: true,
          size: 48, // 24pt
          color: primaryColor,
        }),
      ],
      spacing: { before: 200, after: 200, line: 480 },
    }),

    // Subtitle
    ...(config.subtitle
      ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: config.subtitle,
                font: "Sarabun",
                italics: true,
                size: 26, // 13pt
                color: "475569",
              }),
            ],
            spacing: { before: 100, after: 400 },
          }),
        ]
      : []),

    new Paragraph({ spacing: { before: 200, after: 200 } }),

    // Metadata Summary Table
    metaTable,

    // Page Break after cover page
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];

  // Document Content Elements from Markdown Files
  const contentElements: (Paragraph | Table)[] = [];

  files.forEach((file, idx) => {
    const fileElements = parseMarkdownToDocxElements(
      file.content,
      primaryColor,
      accentColor,
      workspace.dirPath
    );
    contentElements.push(...fileElements);

    // Page break between files if not the last file
    if (idx < files.length - 1) {
      contentElements.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }
  });

  // Construct Document with Header and Footer
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Sarabun",
            size: 24, // 12pt
            color: "0F172A",
          },
          paragraph: {
            spacing: { line: 340 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 standard width (dxa)
              height: 16838, // A4 standard height (dxa)
            },
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${config.documentNumber || config.title} | v${config.version}`,
                    font: "Sarabun",
                    size: 18,
                    color: "94A3B8",
                  }),
                ],
                spacing: { after: 120 },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${config.organization || "Tan Docs"}  —  หน้า `,
                    font: "Sarabun",
                    size: 18,
                    color: "94A3B8",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Sarabun",
                    size: 18,
                    color: "94A3B8",
                  }),
                  new TextRun({
                    text: " จาก ",
                    font: "Sarabun",
                    size: 18,
                    color: "94A3B8",
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: "Sarabun",
                    size: 18,
                    color: "94A3B8",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [...coverElements, ...contentElements],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

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
