import MarkdownIt from "markdown-it";
// @ts-expect-error - markdown-it-task-lists lacks official TS types in some versions
import taskLists from "markdown-it-task-lists";
import hljs from "highlight.js";

export function createMarkdownParser(): MarkdownIt {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str: string, lang: string): string {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code class="language-${lang}">${
            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
          }</code></pre>`;
        } catch {
          // ignore error
        }
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    },
  });

  // Enable GitHub flavored task lists [ ] and [x]
  md.use(taskLists, { enabled: true, label: true, labelAfter: false });

  // Custom fence renderer to detect mermaid diagrams
  const defaultFence = md.renderer.rules.fence || function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const info = token.info ? token.info.trim() : "";

    if (info === "mermaid") {
      return `<div class="mermaid">${token.content}</div>`;
    }

    return defaultFence(tokens, idx, options, env, self);
  };

  return md;
}

const parserInstance = createMarkdownParser();

/**
 * Pre-processes requirement confirmation markdown documents to match
 * the professional Thai specification format (Gojo Enrich standard).
 */
export function preprocessRequirementDoc(markdown: string): string {
  let content = markdown;

  // 1. Page breaks
  content = content
    .replace(/<!--\s*pagebreak\s*-->/gi, '<div class="page-break"></div>')
    .replace(/\\pagebreak/gi, '<div class="page-break"></div>');

  // 2. Title & Subtitle banner at top of document
  content = content.replace(
    /^#\s*(.+?)\n+(?:###?\s*\*{0,2}(.+?)\*{0,2}\n+)?(?:####?\s*\*{0,2}(.+?)\*{0,2}\n+)?---\s*$/m,
    (_match, title, subtitle1, _subtitle2) => {
      const sub = subtitle1 || "";
      return `<div class="doc-header-banner">
  <div class="doc-main-title">${title.trim()}</div>
  ${sub ? `<div class="doc-main-subtitle">${sub.trim()}</div>` : ""}
  <div class="doc-header-divider"></div>
</div>\n`;
    }
  );

  // 3. Section 1: Header & Version Control list -> 2-Column Table
  content = content.replace(
    /(#{2,3}\s*\*{0,2}ส่วนที่\s*1:[^\n]+\*{0,2}\n)([\s\S]*?)(?=\n#{2,3}\s*\*{0,2}ส่วนที่|\n---\s*\n#{2,3})/i,
    (_match, header, body) => {
      const lines = body.trim().split("\n");
      const rows: string[] = [];

      for (const line of lines) {
        const itemMatch = line.match(/^\s*\*\s*\*{0,2}(.+?)\*{0,2}\s*:\s*(.+)$/);
        if (itemMatch) {
          const key = itemMatch[1].trim();
          const val = itemMatch[2].trim();
          rows.push(`  <tr>\n    <td style="width: 38%; font-weight: normal;">${key}</td>\n    <td style="width: 62%; font-weight: normal;">${val}</td>\n  </tr>`);
        }
      }

      if (rows.length > 0) {
        return `${header}\n<table class="header-control-table">\n  <tbody>\n${rows.join("\n")}\n  </tbody>\n</table>\n`;
      }
      return `${header}${body}`;
    }
  );

  // 4. Section 2: Glossary & Definitions list -> Navy Table
  content = content.replace(
    /(#{2,3}\s*\*{0,2}ส่วนที่\s*2:[^\n]+\*{0,2}\n)([\s\S]*?)(?=\n#{2,3}\s*\*{0,2}ส่วนที่|\n---\s*\n#{2,3})/i,
    (_match, header, body) => {
      const lines = body.trim().split("\n");
      const rows: string[] = [];

      for (const line of lines) {
        const itemMatch = line.match(/^\s*\*\s*\*{0,2}(.+?)\*{0,2}\s*:\s*(.+)$/);
        if (itemMatch) {
          const term = itemMatch[1].trim();
          const def = itemMatch[2].trim();
          rows.push(`  <tr>\n    <td style="width: 35%; font-weight: normal;">${term}</td>\n    <td style="width: 65%; font-weight: normal;">${def}</td>\n  </tr>`);
        }
      }

      if (rows.length > 0) {
        return `${header}\n<table class="glossary-table">\n  <thead>\n    <tr>\n      <th>คำศัพท์ (Term)</th>\n      <th>คำนิยามและความหมายในระบบ (Definition)</th>\n    </tr>\n  </thead>\n  <tbody>\n${rows.join("\n")}\n  </tbody>\n</table>\n`;
      }
      return `${header}${body}`;
    }
  );

  // 5. Review Box (ผลการพิจารณา)
  // Split into sections by REQ ID to attach specific title
  const sections = content.split(/(?=####?\s*[\s\S]*?REQ-[A-Z0-9-]+)/g);
  content = sections.map((sec) => {
    const reqMatch = sec.match(/REQ-[A-Z0-9-]+/);
    const reqId = reqMatch ? reqMatch[0] : "";
    const titleLabel = reqId ? `ผลการพิจารณาสำหรับ ${reqId}:` : "ผลการพิจารณา:";

    return sec.replace(
      /\*\*ผลการพิจารณา:\*\*[\s\S]*?\*\*หมายเหตุลูกค้า:\*\*[\s\S]*?(?=\n---\s*\n|\n#{2,3}|\s*$)/g,
      `
<div class="review-box">
  <div class="review-box-title">${titleLabel}</div>
  <table class="review-box-table">
    <tr>
      <td class="label-cell">สถานะการพิจารณา</td>
      <td>
        <div class="review-status-grid">
          <span>[ ] ยืนยันตามข้อเสนอ</span>
          <span>[ ] ขอแก้ไข</span>
          <span>[ ] ไม่อยู่ในขอบเขต</span>
          <span>[ ] รอหารือเพิ่ม</span>
        </div>
      </td>
    </tr>
    <tr>
      <td class="label-cell">ข้อคิดเห็น / หมายเหตุ</td>
      <td class="notes-cell"></td>
    </tr>
  </table>
</div>
`
    );
  }).join("");

  // 6. Section: Sign-off Section -> 2-Column Table
  content = content.replace(
    /(#{2,3}\s*\*{0,2}(?:ส่วนที่\s*\d+:\s*)?การลงนามยืนยันขอบเขตความต้องการ[^\n]*\*{0,2}\n)([\s\S]*?)(\*\*ฝั่งผู้ว่าจ้าง[\s\S]*?\*\*ฝั่งผู้พัฒนา[\s\S]*?$)/i,
    (_match, header, introText, _signBlock) => {
      const signoffTableHtml = `
${introText.trim()}

<table class="signoff-table">
  <tr>
    <td>
      <p style="margin: 0 0 4px 0;"><strong>ลงนาม: ฝั่งผู้ว่าจ้าง (Client Confirmation)</strong></p>
      <p style="margin: 0 0 16px 0; color: #64748b; font-size: 11px;">(ผู้แทนที่มีอำนาจลงนาม)</p>
      <div class="signoff-line">ลายเซ็น: ____________________________________</div>
      <div class="signoff-line">ชื่อ-นามสกุล: ________________________________</div>
      <div class="signoff-line">ตำแหน่ง: ___________________________________</div>
      <div class="signoff-line">วันที่: ________ / ________ / _______________</div>
    </td>
    <td>
      <p style="margin: 0 0 4px 0;"><strong>ลงนาม: ฝั่งผู้พัฒนา (Developer Acknowledgment)</strong></p>
      <p style="margin: 0 0 16px 0; color: #64748b; font-size: 11px;">(ผู้แทนทีมสถาปัตยกรรมและพัฒนา)</p>
      <div class="signoff-line">ลายเซ็น: ____________________________________</div>
      <div class="signoff-line">ชื่อ-นามสกุล: ________________________________</div>
      <div class="signoff-line">ตำแหน่ง: ___________________________________</div>
      <div class="signoff-line">วันที่: ________ / ________ / _______________</div>
    </td>
  </tr>
</table>
`;
      return `${header}\n${signoffTableHtml}\n`;
    }
  );

  return content;
}

export function renderMarkdown(markdownContent: string): string {
  const processed = preprocessRequirementDoc(markdownContent);
  return parserInstance.render(processed);
}
