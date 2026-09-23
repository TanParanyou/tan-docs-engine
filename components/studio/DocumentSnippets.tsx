"use client";

import React from "react";
import {
  Boxes,
  FileCheck2,
  Workflow,
  Table,
  Scissors,
  PenTool,
  AlertCircle,
  Plus,
} from "lucide-react";

interface DocumentSnippetsProps {
  onInsertSnippet: (snippet: string) => void;
}

interface SnippetItem {
  id: string;
  title: string;
  description: string;
  category: "Requirement" | "Table" | "Diagram" | "Document";
  icon: React.ReactNode;
  content: string;
}

export default function DocumentSnippets({
  onInsertSnippet,
}: DocumentSnippetsProps) {
  const snippets: SnippetItem[] = [
    {
      id: "req-block",
      title: "Requirement Confirmation Block",
      description: "บล็อกสเปกแยกข้อ พร้อมพฤติกรรมที่คาดหวังและผลการพิจารณา",
      category: "Requirement",
      icon: <FileCheck2 className="w-4 h-4 text-blue-600" />,
      content: `\n### 4.X REQ-POS-XXX — [ชื่อฟังก์ชัน / Feature Name]

**Requirement จากการประชุม**  
[อธิบายรายละเอียดความต้องการของผู้ว่าจ้าง...]

**พฤติกรรมที่คาดหวัง**

1. [เงื่อนไขข้อที่ 1...]
2. [เงื่อนไขข้อที่ 2...]
3. [เงื่อนไขข้อที่ 3...]

**ตัวอย่างการยอมรับ (Acceptance Criteria)**  
[ระบุตัวอย่างขั้นตอนและการทดสอบที่ยอมรับ...]

**ต้องยืนยันเพิ่มเติม**

- [ประเด็นคำถามที่ต้องสรุปร่วมกัน...]: \`[ ] ตัวเลือก A\` \`[ ] ตัวเลือก B\`

**ผลการพิจารณา:**
- [ ] ยืนยันตามข้อเสนอ
- [ ] ขอแก้ไข
- [ ] ไม่อยู่ในขอบเขต
- [ ] รอหารือเพิ่ม
**หมายเหตุลูกค้า:** -

---
`,
    },
    {
      id: "summary-matrix",
      title: "Requirement Summary Matrix",
      description: "ตารางสรุปภาพรวม Requirement ทุกข้อ",
      category: "Table",
      icon: <Table className="w-4 h-4 text-emerald-600" />,
      content: `\n## ส่วนที่ 3: ตารางสรุปภาพรวม Requirement (Requirement Summary Matrix)

| REQ ID | ชื่อฟังก์ชัน (Feature) | สรุปขอบเขตงาน (Scope Summary) | สถานะ |
| :--- | :--- | :--- | :--- |
| **REQ-POS-001** | [ชื่อฟังก์ชัน 1] | [คำอธิบายขอบเขตย่อ...] | รอยืนยัน |
| **REQ-POS-002** | [ชื่อฟังก์ชัน 2] | [คำอธิบายขอบเขตย่อ...] | รอยืนยัน |
| **REQ-POS-003** | [ชื่อฟังก์ชัน 3] | [คำอธิบายขอบเขตย่อ...] | รอยืนยัน |

---
`,
    },
    {
      id: "mermaid-flowchart",
      title: "Mermaid Architecture Diagram",
      description: "แผนภาพโฟลว์การทำงาน / สถาปัตยกรรมระบบ",
      category: "Diagram",
      icon: <Workflow className="w-4 h-4 text-purple-600" />,
      content: `\n\`\`\`mermaid
graph TD
  User([ผู้ใช้งาน / Client]) --> POS[หน้าร้าน POS Screen]
  POS -->|เบิกวัตถุดิบ / คีย์สูตร| Order[Order Service]
  Order -->|จองสิทธิ์ / บันทึก| DB[(Database / Cloud)]
  Order -->|ตัดสต๊อกตาม Lot| Stock[Inventory Module]
\`\`\`
`,
    },
    {
      id: "glossary-table",
      title: "Glossary & Definitions",
      description: "ตารางนิยามคำศัพท์ที่ใช้ร่วมกัน",
      category: "Table",
      icon: <Boxes className="w-4 h-4 text-amber-600" />,
      content: `\n## ส่วนที่ 2: นิยามคำศัพท์ที่ใช้ร่วมกัน (Glossary & Definitions)
* **Order / Invoice**: รายการสั่งซื้อบริการหรือสินค้าหน้าร้านของลูกค้า
* **Consult Sheet / Color Formula**: บันทึกสูตรผสมสี ปริมาณ หน่วย Lot และหมายเหตุเคมี
* **Show / Hide on Receipt**: การเลือกกำหนดให้รายการวัตถุดิบแสดงหรือซ่อนจากใบเสร็จลูกค้า

---
`,
    },
    {
      id: "callout-alert",
      title: "Notice / Warning Callout",
      description: "กล่องเน้นข้อความสำคัญ หรือข้อควรระวัง",
      category: "Document",
      icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
      content: `\n> **ข้อควรระวัง (Important Note):**  
> การแก้ไขหรือเปลี่ยนแปลงขอบเขตนี้ อาจมีผลกระทบต่อระยะเวลาส่งมอบและงบประมาณโครงการ กรุณายืนยันก่อนดำเนินการ\n`,
    },
    {
      id: "pagebreak",
      title: "A4 Page Break (ตัวตัดหน้า PDF)",
      description: "สั่งให้ขึ้นหน้ากระดาษแผ่นใหม่ในไฟล์ PDF",
      category: "Document",
      icon: <Scissors className="w-4 h-4 text-amber-600" />,
      content: `\n<!-- pagebreak -->\n`,
    },
    {
      id: "signoff-section",
      title: "Sign-off Section (ส่วนลงนาม)",
      description: "ตารางการลงนามยืนยันขอบเขตของทั้งสองฝ่าย",
      category: "Document",
      icon: <PenTool className="w-4 h-4 text-blue-600" />,
      content: `\n<!-- pagebreak -->

## ส่วนที่ 5: การลงนามยืนยันขอบเขตความต้องการ (Sign-off & Confirmation)
เอกสารฉบับนี้จัดทำขึ้นเพื่อยืนยันข้อตกลงร่วมกันระหว่างทั้งสองฝ่าย

**ฝั่งผู้ว่าจ้าง (Client Confirmation)**
(Enrich Salon)
ลายเซ็น: ____________________________________
ชื่อ-นามสกุล: ________________________________
ตำแหน่ง: ___________________________________
วันที่: ________ / ________ / _______________

**ฝั่งผู้พัฒนา (Developer Acknowledgment)**
(Syaco Co., Ltd.)
ลายเซ็น: ____________________________________
ชื่อ-นามสกุล: ________________________________
ตำแหน่ง: ___________________________________
วันที่: ________ / ________ / _______________
`,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-theme-surface border-r-2 border-theme-border text-theme-text select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b-2 border-theme-border bg-theme-surface-sunken flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Boxes className="w-4 h-4 text-theme-primary" />
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-theme-text">
            Document Snippets
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-retro bg-theme-accent-light text-theme-accent-text border border-theme-accent/40 font-bold shadow-2xs">
          1-Click Insert
        </span>
      </div>

      <div className="p-3 text-[11px] text-theme-text-muted border-b border-theme-border-subtle bg-theme-surface-sunken/40 leading-relaxed font-sans">
        คลิกที่ปุ่มเพื่อแทรกบล็อกสเปกและตารางมาตรฐานลงในเอกสารทันที
      </div>

      {/* Snippet Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {snippets.map((snip) => (
          <div
            key={snip.id}
            className="p-3.5 bg-theme-surface-sunken hover:bg-theme-surface rounded-retro border-2 border-theme-border hover:border-theme-primary transition-all flex flex-col justify-between group shadow-retro-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-retro bg-theme-surface border border-theme-border shadow-2xs">
                    {snip.icon}
                  </div>
                  <h4 className="font-bold text-xs text-theme-text group-hover:text-theme-primary transition-colors font-sans">
                    {snip.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-retro bg-theme-surface text-theme-text-muted border border-theme-border-subtle">
                  {snip.category}
                </span>
              </div>
              <p className="text-[11px] text-theme-text-muted leading-relaxed mb-3 font-sans">
                {snip.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onInsertSnippet(snip.content)}
              className="w-full py-2 px-3 bg-theme-primary hover:bg-theme-primary-hover text-theme-primary-text rounded-retro text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-theme-border shadow-retro-sm cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              <Plus className="w-4 h-4" />
              <span>แทรกลงในเอกสาร</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
