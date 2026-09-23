/**
 * Markdown Table Formatter Utility
 * จัดรูปแบบตาราง Markdown ให้คอลัมน์มีความกว้างเสมอกันและอ่านง่าย
 */

/**
 * คำนวณความกว้างที่แสดงผลของข้อความ (รองรับภาษาไทยและอักขระ CJK เบื้องต้น)
 */
function getDisplayWidth(str: string): number {
  let width = 0;
  // ภาษาไทย: สระบน/ล่าง และวรรณยุกต์ (Zero-width combining characters)
  const thaiCombiningRegex = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g;
  const stripped = str.replace(thaiCombiningRegex, "");

  for (let i = 0; i < stripped.length; i++) {
    const code = stripped.charCodeAt(i);
    // CJK Full-width characters
    if (
      (code >= 0x1100 && code <= 0x115f) ||
      (code >= 0x2e80 && code <= 0xa4cf && code !== 0x303f) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xfe10 && code <= 0xfe19) ||
      (code >= 0xfe30 && code <= 0xfe6f) ||
      (code >= 0xff00 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6)
    ) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

/**
 * เติมช่องว่างด้านขวาของข้อความตาม display width
 */
function padString(str: string, targetWidth: number, align: "left" | "right" | "center" = "left"): string {
  const currentWidth = getDisplayWidth(str);
  const totalPadding = Math.max(0, targetWidth - currentWidth);

  if (align === "right") {
    return " ".repeat(totalPadding) + str;
  }
  if (align === "center") {
    const leftPad = Math.floor(totalPadding / 2);
    const rightPad = totalPadding - leftPad;
    return " ".repeat(leftPad) + str + " ".repeat(rightPad);
  }
  return str + " ".repeat(totalPadding);
}

/**
 * จัดแนวและปรับแต่งตาราง Markdown ภายในเนื้อหา
 */
export function formatMarkdownTables(markdown: string): string {
  const lines = markdown.split("\n");
  const result: string[] = [];
  let tableBuffer: string[] = [];
  let inCodeBlock = false;

  const flushTableBuffer = () => {
    if (tableBuffer.length === 0) return;

    if (tableBuffer.length < 2) {
      // ไม่ใช่ตารางที่สมบูรณ์ (ต้องมีอย่างน้อย Header + Separator)
      result.push(...tableBuffer);
      tableBuffer = [];
      return;
    }

    // ตรวจสอบว่าบรรทัดที่ 2 คือ Table Separator เช่น |:---|:---:|---:|
    const separatorLine = tableBuffer[1].trim();
    const isTableSeparator = /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(separatorLine);

    if (!isTableSeparator) {
      result.push(...tableBuffer);
      tableBuffer = [];
      return;
    }

    // แยกเซลล์แต่ละแถว
    const parsedRows = tableBuffer.map((row) => {
      const trimmed = row.trim();
      let clean = trimmed;
      if (clean.startsWith("|")) clean = clean.substring(1);
      if (clean.endsWith("|")) clean = clean.substring(0, clean.length - 1);
      return clean.split("|").map((cell) => cell.trim());
    });

    const colCount = Math.max(...parsedRows.map((r) => r.length));
    const alignments: ("left" | "right" | "center")[] = [];

    // อ่านการจัดตำแหน่งจาก Separator Row
    const sepCells = parsedRows[1];
    for (let c = 0; c < colCount; c++) {
      const cell = sepCells[c] || "---";
      const startsWithColon = cell.startsWith(":");
      const endsWithColon = cell.endsWith(":");
      if (startsWithColon && endsWithColon) {
        alignments.push("center");
      } else if (endsWithColon) {
        alignments.push("right");
      } else {
        alignments.push("left");
      }
    }

    // คำนวณความกว้างสูงสุดของแต่ละคอลัมน์
    const colWidths = new Array<number>(colCount).fill(3); // ขั้นต่ำ 3 ตัวอักษร
    parsedRows.forEach((row, rowIndex) => {
      if (rowIndex === 1) return; // ข้าม separator row ในการคำนวณความกว้างข้อความ
      for (let c = 0; c < colCount; c++) {
        const cell = row[c] || "";
        const width = getDisplayWidth(cell);
        if (width > colWidths[c]) {
          colWidths[c] = width;
        }
      }
    });

    // สร้างตารางใหม่ที่มีระยะห่างสวยงาม
    const formattedRows: string[] = [];

    parsedRows.forEach((row, rowIndex) => {
      if (rowIndex === 1) {
        // สร้าง separator row
        const sepParts = colWidths.map((width, c) => {
          const align = alignments[c];
          if (align === "center") {
            return `:${"-".repeat(Math.max(1, width - 2))}:`;
          }
          if (align === "right") {
            return `${"-".repeat(Math.max(2, width - 1))}:`;
          }
          if (align === "left") {
            return `:${"-".repeat(Math.max(2, width - 1))}`;
          }
          return "-".repeat(width);
        });
        formattedRows.push(`| ${sepParts.join(" | ")} |`);
      } else {
        const cellParts = colWidths.map((width, c) => {
          const cell = row[c] || "";
          const align = alignments[c] || "left";
          return padString(cell, width, align);
        });
        formattedRows.push(`| ${cellParts.join(" | ")} |`);
      }
    });

    result.push(...formattedRows);
    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ตรวจสอบ Code Block (```)
    if (line.trim().startsWith("```")) {
      flushTableBuffer();
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }

    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    // บรรทัดที่เป็นส่วนหนึ่งของตาราง (มีเครื่องหมาย | อย่างน้อย 1 ตัว)
    if (line.trim().includes("|") && line.trim().startsWith("|")) {
      tableBuffer.push(line);
    } else {
      flushTableBuffer();
      result.push(line);
    }
  }

  flushTableBuffer();
  return result.join("\n");
}
