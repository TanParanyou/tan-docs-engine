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
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Boxes className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Document Snippets
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
          1-Click Insert
        </span>
      </div>

      <div className="p-3 text-[11px] text-slate-500 border-b border-slate-200 bg-slate-50/50">
        คลิกที่ปุ่มเพื่อแทรกแม่แบบเอกสาร Requirement Confirmation ลงในตำแหน่งเคอร์เซอร์ทันที
      </div>

      {/* Snippet Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {snippets.map((snip) => (
          <div
            key={snip.id}
            className="p-3 bg-white hover:bg-slate-50/80 rounded-xl border border-slate-200 hover:border-blue-400 transition-all flex flex-col justify-between group shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-slate-100 border border-slate-200">
                    {snip.icon}
                  </div>
                  <h4 className="font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                    {snip.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {snip.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                {snip.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onInsertSnippet(snip.content)}
              className="w-full h-8.5 py-2 px-3 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-200 hover:border-blue-600 shadow-2xs cursor-pointer active:scale-[0.98]"
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
