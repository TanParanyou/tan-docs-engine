# Agent Operating Guide: tan-docs-engine

คำแนะนำ มาตรฐาน และข้อบังคับการปฏิบัติงานสำหรับ AI Agent ในการพัฒนา ดูแลรักษา และขยายความสามารถของโปรเจกต์ **tan-docs-engine**

> ⚠️ **กฎเหล็กก่อนเริ่มงาน (Mandatory Pre-work & Development Rules):**
> - **ก่อนทำให้อ่าน `agent.md` และ `design.md` เสมอ:** เพื่อเข้าใจกฎระเบียบของระบบ ข้อจำกัดทางสถาปัตยกรรม และมาตรฐาน Design System
> - **ห้ามใช้ type `any`, `as any` หรือ `@ts-ignore` เด็ดขาด:** ให้ใช้ strict types, interfaces หรือ `unknown` แล้ว narrow อย่างรัดกุมใน [`lib/types.ts`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/lib/types.ts)
> - **Zero Emoji & Strict SVG Icon Standard:** ห้ามใช้อักขระอีโมจิ (Emoji Pictographs) ในโค้ด UI, Markdown Preprocessing, Template หรือ Export Generators เด็ดขาด ทุกไอคอนต้องใช้ SVG (`lucide-react` หรือ Inline `<svg>`) เสมอ
> - **Reuse First & No Duplicate Logic:** ส่วนไหนที่มีคอมโพเนนต์หรือฟังก์ชันกลางอยู่ใน `components/common/`, `lib/` หรือ `hooks/` ให้นำมาใช้เสมอ ห้ามเขียนโค้ดซ้ำซ้อน หากจำเป็นต้องสร้างใหม่และมีโอกาสใช้ซ้ำ ให้ทำเป็น Reusable Component
> - **Minimal Blast Radius:** แตะเฉพาะไฟล์ที่เกี่ยวกับ Task โดยตรง ห้าม refactor, จัดระเบียบ หรือแก้ formatting ไฟล์ที่ไม่เกี่ยวข้อง
> - **Verification Before Completion (Evidence Before Assertions):** ห้ามกล่าวอ้างว่างาน "เสร็จแล้ว" หรือ "ผ่านแล้ว" หากยังไม่ได้รันคำสั่ง Verify (`npm run build`, `npm run generate:...`) และยืนยันผลลัพธ์จริง

---

## 1. Project Context & Mental Model

- **Project:** `tan-docs-engine`
- **Purpose:** เครื่องมือสร้างและจัดการเอกสารสเปกระดับ Enterprise Multi-Tenant พร้อมระบบ Web Studio สองโหมด (Visual TipTap + Raw Markdown) และระบบ Export A4 PDF / Word / Excel / Markdown รวมเล่ม
- **Single Source of Truth:**
  - เอกสารและคอนฟิกจัดเก็บแบบ File-backed ใน `/workspaces/<slug>/`
  - คอนฟิกหลักของแต่ละ Workspace อยู่ใน `workspaces/<slug>/docs.config.json`
  - ไฟล์เนื้อหา Markdown อยู่ใน `workspaces/<slug>/src/*.md`
  - รูปภาพและ Assets อยู่ใน `workspaces/<slug>/src/assets/`
- **Design Tokens:** Theme Presets และสีหลักของระบบถูกควบคุมไว้ที่ [`lib/theme.ts`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/lib/theme.ts)
- **System Architecture Design:** ศึกษาคู่มือสถาปัตยกรรมฉบับเต็มได้ที่ [`design.md`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/design.md)

---

## 2. Directory Layout & Key Locations

| Directory / File | Description & Agent Responsibility |
| :--- | :--- |
| `app/` | Next.js 15 App Router (`/[workspace]` Reader, `/[workspace]/edit` Studio, `/[workspace]/print` Print View) |
| `app/api/` | REST Handlers (`/api/workspaces`, `/api/pdf`, `/api/docx`, `/api/excel`, `/api/md`) |
| `components/studio/` | ส่วนประกอบ Studio (`StudioLayout`, `EditorToolbar`, `VisualEditor`, `LivePreview`, `FileManagementDrawer`) |
| `components/common/` | คอมโพเนนต์ Reusable ส่วนกลาง (`ActionButton`, `SegmentedControl`, `StatusBadge`, `ExportDropdown`, `MarkdownDropzone`) |
| `components/viewer/` | คอมโพเนนต์เอกสารฝั่ง Reader (`DocumentViewer`, `PrintButton`) |
| `lib/types.ts` | Single Source of Truth สำหรับ Types, Interfaces และ Data Contracts ทั้งหมด |
| `lib/theme.ts` | Color Palettes, Theme Presets, และ Contrast Utilities |
| `lib/workspaces.ts` | โมดูลกลางสำหรับอ่าน/เขียน/จัดการ Workspace บน Filesystem ทั้งหมด |
| `lib/markdown.ts` | Custom Markdown Parser (`markdown-it`), Syntax Highlighting, และ Gojo Enrich Preprocessing |
| `lib/pdf-generator.ts` | Puppeteer Engine แปลง HTML เป็น A4 PDF พร้อม Headless Chrome Discovery |
| `lib/docx-generator.ts` | HTML-to-DOCX Engine สร้างไฟล์ Word พร้อม A4 Margin และตารางสเปก |
| `lib/excel-generator.ts` | ExcelJS Engine สกัดตารางข้อมูลจาก Markdown เป็น Workbook พร้อมสรุปรายการ |
| `lib/document-templates.ts` | แค็ตตาล็อกแม่แบบเล่มเอกสารและ Snippets สำเร็จรูป |
| `lib/store/` | Zustand Store สำหรับจัดการ UI State และ Editor Content Synchronization |
| `scripts/generate.ts` | CLI Generator Script (`npm run generate`) สำหรับรันคอมไพล์เอกสารผ่าน Command Line |
| `workspaces/` | พื้นที่จัดเก็บเอกสาร Multi-Tenant ทั้งหมด ห้ามเขียนข้อมูลนอกไดเรกทอรีนี้ |
| `output/` | ผลลัพธ์ไฟล์ PDF/DOCX/XLSX ที่ถูกสร้างขึ้น (gitignored) |

---

## 3. Core Development Invariants & Standards

เมื่อพัฒนาหรือแก้ไขโค้ด Agent ต้องปฏิบัติตามมาตรฐานต่อไปนี้อย่างเคร่งครัด:

### 3.1 Security & Path Traversal Guardrails
- **Slug Validation:** Workspace slug ต้องผ่านการตรวจสอบ Regex `/^[a-zA-Z0-9_-]+$/` เสมอ
- **Filename Validation:** ไฟล์ Markdown ต้องผ่านการตรวจสอบ Regex `/^[a-zA-Z0-9_-]+\.md$/` เสมอ
- **Zero Outside Access:** ห้ามให้มีอักขระ `..`, `/`, `\` ใน Parameter ชื่อไฟล์หรือ slug เพื่อป้องกันการเข้าถึงไฟล์นอกโฟลเดอร์ `workspaces` โดยเด็ดขาด

### 3.2 Dual-Mode Editor Integrity
- การสลับระหว่างโหมด **Visual (TipTap)** และ **Markdown (Raw Text)** ต้องรักษาความถูกต้องของข้อมูล (Zero Data Loss)
- รักษาความเข้ากันได้ของตาราง (Tables), แผนภาพ Mermaid, และแท็กแบ่งหน้า `<!-- pagebreak -->`
- ตรวจสอบให้แน่ใจว่าภาษาไทย (วรรณยุกต์และสระ) ไม่ถูกแปลงเป็น Unicode escape sequence หรือตกหล่นระหว่างการแปลง

### 3.3 Print & PDF Layout Stability
- บล็อกเนื้อหาสำคัญ เช่น `table`, `pre`, `.mermaid`, และตารางลงนาม ต้องมี CSS `page-break-inside: avoid;` เพื่อป้องกันการถูกตัดแบ่งกลางหน้ากระดาษ
- การแบ่งหน้าเอกสารระหว่างไฟล์ต้องใช้ `<div class="page-break"></div>` เสมอ
- หน้าปก (Cover Page) ต้องคงขนาดและระยะขอบ Full-bleed ตามมาตรฐาน A4 Portrait

### 3.4 Zero Emoji & Strict SVG Icon Standard
- **No Emoji in UI / Templates / Exports:** ห้ามใช้อักขระอีโมจิ (Emoji Pictographs เช่น 🧩, ✂️, ✨, 💻, 📱, 📊) ในส่วนติดต่อผู้ใช้ (UI Components), Live Preview, Print Template หรือโมดูล Export เด็ดขาด เพื่อคงความเป็นมืออาชีพระดับ Enterprise
- **Lucide Icons / Inline SVG Only:** สัญลักษณ์หรือไอคอนทั้งหมดต้องเรนเดอร์ด้วย SVG เท่านั้น (โดยใช้ไลบรารี `lucide-react` เป็นหลัก หรือ Inline `<svg>` ในกรณี Template HTML สตริง)
- **Scalability & Cross-Platform Consistency:** การใช้ SVG ช่วยรับประกันว่าไอคอนจะคมชัดในหน้าจอทุกความละเอียด (High-DPI / Retina) และเรนเดอร์ในไฟล์ PDF / Print ได้อย่างแม่นยำ ไม่ขึ้นกับฟอนต์อีโมจิของระบบปฏิบัติการ

### 3.5 UI & Interaction Safety Standards
- **Double Submit Protection:** ทุกปุ่มที่มีการยิงคำขอหรือประมวลผล (เช่น `Save`, `Create Workspace`, `Export PDF/DOCX/XLSX`, `Upload`) ต้องมีสถานะ `isLoading`, แสดง Spinner (`Loader2`) และถูก Disable ทันทีขณะประมวลผล เพื่อป้องกัน Race Condition และการสร้างไฟล์ซ้ำซ้อน
- **Safety Confirmation Modal:** การลบ Workspace, การลบไฟล์ Markdown (`.md`), หรือการรีเซ็ตข้อมูลเอกสาร ต้องมี Confirmation Modal ยืนยันความเสี่ยงเสมอ ห้ามลบทันทีโดยไม่มีการยืนยัน และปุ่มยืนยันใน Modal ต้องมีสถานะ `isLoading` ล็อกปุ่มไว้ขณะยิง API

### 3.6 Strict TypeScript & No Arbitrary Fallback
- **No `any` or `@ts-ignore`:** ห้ามใช้ `any`, `as any` หรือ `@ts-ignore` เด็ดขาด ทุกฟังก์ชัน, Props, Store State และ API Response ต้องมี Interface / Type กำกับใน [`lib/types.ts`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/lib/types.ts) อย่างชัดเจน
- **No Loose / Arbitrary Fallback Chains:** ห้ามทำ fallback ต่อกันหลายชั้นโดยเดาสุ่ม (เช่น `a || b || c || "default"`) ให้ยึดถือ Single Source of Truth จาก [`lib/theme.ts`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/lib/theme.ts) และ `docs.config.json` เท่านั้น
- **Strict Error Handling:** ห้ามตรวจสอบ Error ด้วย String ดิบ (เช่น `error.message === "..."`) ให้ใช้ Structured Error Types หรือ HTTP Status Code ที่ชัดเจน

### 3.7 Retro Sharp Industrial & Single Source of Truth Theme Standards
- **Zero Border-Radius (เหลี่ยมคมกริบ):** ดีไซน์ของระบบถูกกำหนดให้เป็นสไตล์ Retro Industrial Workstation เหลี่ยมคม 100% (`--theme-radius: 0px`) ห้าม hardcode ความโค้งมน (`rounded-full`, `rounded-2xl`, etc.) ยกเว้นไฟสถานะจุดเล็กๆ
- **Single Source of Truth Tokens:** การกำหนดสีและโครงสร้าง UI ต้องใช้ Theme Tokens เสมอ (`bg-theme-bg`, `bg-theme-surface`, `border-theme-border`, `bg-theme-primary`, `shadow-retro`) ห้าม hardcode สี Tailwind ดิบอย่าง `bg-blue-600` หรือ `bg-slate-50` ในคอมโพเนนต์หลัก เพื่อคงคุณสมบัติ "กำหนดที่เดียวเปลี่ยนทุกที่"
- **Tactile Click Feedback:** ปุ่มและอินเทอร์แอคทีฟต้องมีคลาส `active:translate-x-[1px] active:translate-y-[1px] active:shadow-none` เพื่อมอบประสบการณ์ปุ่มกดสัมผัสจริงของเครื่องจักรโบราณ

---

## 4. Scope Guardrails & Minimal Blast Radius

- **Minimal Blast Radius:** แก้ไขเฉพาะไฟล์ที่เกี่ยวกับงานที่ได้รับมอบหมาย ห้ามจัด format หรือ refactor โค้ดส่วนอื่นโดยไม่ได้รับความเห็นชอบ
- **Do Not Commit Artifacts & Secrets:**
  - ห้าม commit โฟลเดอร์ `output/`, `.next/`, `node_modules/`
  - ห้าม commit ไฟล์ `.env`, `.env.local`, API keys หรือ credentials
- **Commit Message Convention:** ยึดตามรูปแบบ `type(scope): description` (เช่น `feat(export): add docx table support`, `fix(preview): resolve mermaid re-render bug`)

---

## 5. Operational Workflows

### 5.1 การสร้างหรือปรับปรุง Workspace ผ่านโค้ด
- เมื่อต้องการสร้าง Workspace ใหม่ ให้เรียกใช้ฟังก์ชัน `createWorkspace(input)` ใน [`lib/workspaces.ts`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/lib/workspaces.ts)
- อัปเดต `docs.config.json` ผ่าน `updateWorkspaceConfig(slug, partialConfig)` เพื่อป้องกันโครงสร้างไฟล์เสียหาย
- เพิ่มหรือจัดลำดับไฟล์ผ่าน `createWorkspaceFile`, `reorderWorkspaceFiles`, หรือ `renameWorkspaceFile`

### 5.2 การแก้ไข Markdown Rendering & Preprocessing
- หากมีการเพิ่ม Syntax พิเศษ หรือรูปแบบตารางสำหรับเอกสาร ให้เพิ่มใน [`lib/markdown.ts`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/lib/markdown.ts) ในฟังก์ชัน `preprocessRequirementDoc`
- หากมีการแก้ไขการวาด Mermaid Diagram ให้ตรวจสอบทั้งฝั่ง SSR/Print ([`lib/template.ts`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/lib/template.ts)) และฝั่ง Web Preview ([`components/MermaidRenderer.tsx`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/components/MermaidRenderer.tsx))

---

## 6. Verification & Definition of Done

ก่อนส่งมอบงานหรือสรุปผล Agent ต้องรันคำสั่งตรวจสอบความถูกต้องต่อไปนี้เสมอ:

```bash
# 1. Type Check & Next.js Build Verification
npm run build

# 2. Test CLI PDF Generation for a specific workspace
npm run generate:wallet
npm run generate:pos

# 3. Test Full PDF Generation for all workspaces
npm run generate:all
```

### Criteria of Completion (Definition of Done):
- [ ] `npm run build` ผ่านโดยไม่มีข้อผิดพลาดด้าน TypeScript หรือ Next.js Bundler
- [ ] ไฟล์ PDF ถูกสร้างในไดเรกทอรี `output/` อย่างสมบูรณ์และถูกต้อง
- [ ] เอกสารภาษาไทยเรนเดอร์ถูกต้อง สระและวรรณยุกต์ไม่ซ้อน/ไม่เพี้ยน
- [ ] แผนภาพ Mermaid เรนเดอร์เป็นภาพ SVG ชัดเจน ไม่แสดง error block
- [ ] ไม่มีการใช้อีโมจิในโค้ด UI / Template โดยใช้ SVG Icon เสมอ
- [ ] ไม่มีการใช้ type `any` หรือ `@ts-ignore` ในโค้ดที่สร้างหรือแก้ไขใหม่
- [ ] **Evidence Before Assertions:** ห้ามกล่าวอ้างว่างาน "เสร็จแล้ว" หรือ "ผ่านแล้ว" หากยังไม่ได้รันคำสั่ง Verify และยืนยันผลลัพธ์จริง
