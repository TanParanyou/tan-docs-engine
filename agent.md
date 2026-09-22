# Agent Operating Guide: tan-docs-engine

คำแนะนำและมาตรฐานการปฏิบัติงานสำหรับ AI Agent ในการพัฒนา ดูแลรักษา และขยายความสามารถของโปรเจกต์ **tan-docs-engine**

---

## 1. Project Context & Mental Model

- **Project:** `tan-docs-engine`
- **Purpose:** เครื่องมือสร้างและจัดการเอกสารสเปกระดับ Enterprise Multi-Tenant พร้อมระบบ Web Studio สองโหมด (Visual TipTap + Raw Markdown) และระบบ Export A4 PDF ผ่าน Puppeteer
- **Single Source of Truth:**
  - เอกสารและคอนฟิกจัดเก็บแบบ File-backed ใน `/workspaces/<slug>/`
  - คอนฟิกหลักของแต่ละ Workspace อยู่ใน `workspaces/<slug>/docs.config.json`
  - ไฟล์เนื้อหา Markdown อยู่ใน `workspaces/<slug>/src/*.md`
  - รูปภาพและ Assets อยู่ใน `workspaces/<slug>/src/assets/`
- **System Architecture Design:** ศึกษาคู่มือสถาปัตยกรรมฉบับเต็มได้ที่ [`design.md`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/design.md)

---

## 2. Directory Layout & Key Locations

| Directory / File | Description & Agent Responsibility |
| :--- | :--- |
| `app/` | Next.js 15 App Router (`/[workspace]` สำหรับ Reader, `/[workspace]/edit` สำหรับ Studio, `/[workspace]/print` สำหรับ Print) |
| `app/api/` | REST Route Handlers สำหรับจัดการ Workspace, Files, Uploads, และ PDF Generation |
| `components/studio/` | ส่วนประกอบ UI ของ Document Studio (`StudioLayout`, `MarkdownEditor`, `VisualEditor`, `LivePreview`, `FileManagementDrawer`) |
| `components/` | คอมโพเนนต์ส่วนกลาง (`WorkspaceDashboard`, `NewWorkspaceModal`, `MermaidRenderer`, `PrintButton`) |
| `lib/workspaces.ts` | โมดูลกลางสำหรับอ่าน/เขียน/จัดการ Workspace บน Filesystem ทั้งหมด |
| `lib/markdown.ts` | Custom Markdown Parser (`markdown-it`), Syntax Highlighting, และ Gojo Enrich Preprocessing |
| `lib/pdf-generator.ts` | Puppeteer Engine สำหรับแปลง HTML เป็น A4 PDF พร้อม Headless Chrome auto-discovery |
| `lib/template.ts` | HTML Template Generator สำหรับรวม Cover Page, Custom Themes, และ Section Break |
| `lib/store/` | Zustand Store สำหรับจัดการ UI State และ Editor Content Synchronization |
| `scripts/generate.ts` | CLI Generator Script (`npm run generate`) สำหรับรันคอมไพล์เอกสารผ่าน Command Line |
| `workspaces/` | พื้นที่จัดเก็บเอกสาร Multi-Tenant ทั้งหมด ห้ามเขียนข้อมูลนอกไดเรกทอรีนี้ |
| `output/` | ผลลัพธ์ PDF ไฟล์ที่ถูกสร้างขึ้น (gitignored) |

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

---

## 4. Operational Workflows

### 4.1 การสร้างหรือปรับปรุง Workspace ผ่านโค้ด
- เมื่อต้องการสร้าง Workspace ใหม่ ให้เรียกใช้ฟังก์ชัน `createWorkspace(input)` ใน [`lib/workspaces.ts`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/lib/workspaces.ts)
- อัปเดต `docs.config.json` ผ่าน `updateWorkspaceConfig(slug, partialConfig)` เพื่อป้องกันโครงสร้างไฟล์เสียหาย
- เพิ่มหรือจัดลำดับไฟล์ผ่าน `createWorkspaceFile`, `reorderWorkspaceFiles`, หรือ `renameWorkspaceFile`

### 4.2 การแก้ไข Markdown Rendering & Preprocessing
- หากมีการเพิ่ม Syntax พิเศษ หรือรูปแบบตารางสำหรับเอกสาร ให้เพิ่มใน [`lib/markdown.ts`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/lib/markdown.ts) ในฟังก์ชัน `preprocessRequirementDoc`
- หากมีการแก้ไขการวาด Mermaid Diagram ให้ตรวจสอบทั้งฝั่ง SSR/Print ([`lib/template.ts`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/lib/template.ts)) และฝั่ง Web Preview ([`components/MermaidRenderer.tsx`](file:///Users/syaco/Documents/GitHub/tan-docs-engine/components/MermaidRenderer.tsx))

---

## 5. Verification & Testing Commands

ก่อนส่งมอบงานหรือสรุปผล Agent ต้องรันคำสั่งตรวจสอบความถูกต้องต่อไปนี้เสมอ:

```bash
# 1. Type Check & Build Verification
npm run build

# 2. Test CLI PDF Generation for a specific workspace
npm run generate:wallet
npm run generate:pos

# 3. Test Full PDF Generation for all workspaces
npm run generate:all
```

### Criteria of Completion:
- [ ] `npm run build` ผ่านโดยไม่มีข้อผิดพลาดด้าน TypeScript หรือ Next.js Bundler
- [ ] ไฟล์ PDF ถูกสร้างในไดเรกทอรี `output/` อย่างสมบูรณ์
- [ ] เอกสารภาษาไทยเรนเดอร์ถูกต้อง สระและวรรณยุกต์ไม่เพี้ยน
- [ ] แผนภาพ Mermaid เรนเดอร์เป็นภาพ SVG ชัดเจน ไม่แสดง error block
