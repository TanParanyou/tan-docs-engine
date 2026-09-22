import { ThemeConfig } from "./types";

export type TemplateCategory =
  | "srs"
  | "requirement"
  | "api"
  | "erp"
  | "architecture"
  | "general";

export interface TemplateFileDefinition {
  filename: string;
  title: string;
  description?: string;
  content: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  category: TemplateCategory;
  categoryLabel: string;
  description: string;
  badge?: string;
  documentNumberPrefix: string;
  theme: {
    primaryColor: string;
    accentColor: string;
  };
  files: TemplateFileDefinition[];
}

export interface SectionTemplate {
  id: string;
  title: string;
  filename: string;
  description: string;
  category: string;
  content: string;
}

export interface EditorSnippetTemplate {
  id: string;
  title: string;
  category: "structure" | "tables" | "mermaid" | "api" | "approval";
  categoryLabel: string;
  description: string;
  snippet: string;
}

export interface TemplateVariables {
  projectName: string;
  title?: string;
  subtitle?: string;
  version?: string;
  author?: string;
  client?: string;
  organization?: string;
  date?: string;
}

/**
 * Replace placeholders like {{projectName}} with actual values
 */
export function interpolateTemplateContent(
  rawContent: string,
  vars: TemplateVariables
): string {
  const defaults = {
    projectName: vars.projectName || "Enterprise System",
    title: vars.title || `${vars.projectName || "System"} Specifications`,
    subtitle: vars.subtitle || "เอกสารข้อกำหนดความต้องการและสถาปัตยกรรมระบบ",
    version: vars.version || "1.0.0",
    author: vars.author || "Tan System Architecture Team",
    client: vars.client || "Enterprise Client Co., Ltd.",
    organization: vars.organization || "TAN TECHNOLOGY SOLUTIONS",
    date: vars.date || new Date().toISOString().split("T")[0],
  };

  return rawContent
    .replace(/\{\{projectName\}\}/g, defaults.projectName)
    .replace(/\{\{title\}\}/g, defaults.title)
    .replace(/\{\{subtitle\}\}/g, defaults.subtitle)
    .replace(/\{\{version\}\}/g, defaults.version)
    .replace(/\{\{author\}\}/g, defaults.author)
    .replace(/\{\{client\}\}/g, defaults.client)
    .replace(/\{\{organization\}\}/g, defaults.organization)
    .replace(/\{\{date\}\}/g, defaults.date);
}

/* ==========================================================================
   1. WORKSPACE TEMPLATES (แม่แบบเล่มเอกสารสำหรับสร้าง Workspace)
   ========================================================================== */

export const WORKSPACE_TEMPLATES: DocumentTemplate[] = [
  {
    id: "srs-standard",
    name: "Software Requirements Specification (SRS)",
    title: "Software Requirements Specification & System Architecture",
    subtitle: "เอกสารข้อกำหนดความต้องการระบบและสถาปัตยกรรมซอฟต์แวร์มาตรฐาน Enterprise",
    category: "srs",
    categoryLabel: "SRS มาตรฐาน",
    badge: "แนะนำ / Enterprise",
    description:
      "แม่แบบสเปกระบบมาตรฐานระดับสากล ครอบคลุมบทนำ ขอบเขตงาน ตาราง Functional Requirements แผนภาพสถาปัตยกรรมระบบ และ Data Model",
    documentNumberPrefix: "DOC-SRS",
    theme: {
      primaryColor: "#0f172a",
      accentColor: "#2563eb",
    },
    files: [
      {
        filename: "01-system-overview.md",
        title: "1. ภาพรวมระบบและวัตถุประสงค์ (System Overview)",
        description: "บทนำ ความเป็นมา วัตถุประสงค์ของโครงการ และกลุ่มผู้ใช้งาน",
        content: `# 1. ภาพรวมระบบและวัตถุประสงค์ (System Overview)

เอกสารฉบับนี้จัดทำขึ้นเพื่อกำหนดข้อกำหนดความต้องการ (Software Requirements Specification) ของระบบ **{{projectName}}** 

## 1.1 วัตถุประสงค์ของโครงการ (Project Objectives)
1. เพื่อพัฒนาระบบ **{{projectName}}** ที่มีประสิทธิภาพ ความเสถียร และรองรับการขยายตัว (High Availability & Scalability)
2. เพื่อยกระดับกระบวนการทำงานให้เป็นระบบอัตโนมัติ ลดข้อผิดพลาดจากกระบวนการทำงานแบบ Manual
3. เพื่อจัดเก็บข้อมูลอย่างปลอดภัยตามมาตรฐานความปลอดภัยสารสนเทศและการกำกับดูแลกิจการ

## 1.2 ขอบเขตของระบบ (System Scope)
ระบบ **{{projectName}}** มีขอบเขตการทำงานครอบคลุมฟังก์ชันหลักดังนี้:
- **Core Operations**: การประมวลผลธุรกรรมหลักแบบเรียลไทม์
- **Identity & Access Management**: การยืนยันตัวตนและการกำหนดสิทธิ์ตามบทบาท (RBAC)
- **Integration Engine**: การเชื่อมต่อข้อมูลผ่าน RESTful API และ Webhook
- **Audit & Analytics**: ระบบจัดเก็บประวัติการทำงาน (Audit Trails) และรายงานสรุป

## 1.3 กลุ่มผู้ใช้งานระบบ (Stakeholders & Actors)

| กลุ่มผู้ใช้ (Actor) | บทบาทและหน้าที่ (Role & Responsibility) | ระดับการเข้าถึง (Access Level) |
| :--- | :--- | :--- |
| **System Admin** | บริหารจัดการผู้ใช้ สิทธิ์ และการตั้งค่าระบบส่วนกลาง | Full Administrative Access |
| **Operator / Staff** | ปฏิบัติงานประจำวัน บันทึกและตรวจสอบข้อมูล | Operational Access |
| **End User / Client** | เข้าถึงบริการและทำธุรกรรมผ่านเว็บ/แอปพลิเคชัน | Self-Service Access |
| **Auditor / Management** | ตรวจสอบรายงาน ประวัติการทำรายการ และสถิติภาพรวม | Read-Only Analytical Access |

<!-- pagebreak -->
`,
      },
      {
        filename: "02-functional-requirements.md",
        title: "2. ข้อกำหนดฟังก์ชันการทำงาน (Functional Requirements)",
        description: "ตารางสรุป Functional Requirements และระดับความสำคัญ",
        content: `# 2. ข้อกำหนดฟังก์ชันการทำงาน (Functional Requirements)

## 2.1 ตารางสรุปความต้องการทางฟังก์ชัน (Requirements Matrix)

ระดับความสำคัญ (Priority):
- **P1 (Critical):** ฟังก์ชันหลักที่ต้องมีสำหรับการเปิดใช้งานระบบรอบแรก
- **P2 (High):** ฟังก์ชันสำคัญที่ส่งผลต่อประสิทธิภาพและความสะดวกของผู้ใช้
- **P3 (Medium):** ฟังก์ชันสนับสนุนและส่วนขยายการทำงาน

| รหัสข้อกำหนด | โมดูลระบบ | รายละเอียดความต้องการ | ระดับความสำคัญ | สถานะ |
| :--- | :--- | :--- | :---: | :---: |
| **REQ-SYS-001** | Authentication | การเข้าสู่ระบบด้วย Multi-Factor Authentication (MFA) | P1 | Approved |
| **REQ-SYS-002** | User Management | จัดการข้อมูลผู้ใช้ บทบาท และการผูกสิทธิ์เข้าถึงตาม Role | P1 | Approved |
| **REQ-SYS-003** | Core Processing | ประมวลผลธุรกรรมหลักพร้อมระบบตรวจจับการทำซ้ำ (Idempotency) | P1 | Approved |
| **REQ-SYS-004** | Notification Engine | ส่งการแจ้งเตือนแบบเรียลไทม์ผ่าน Email, SMS และ Push Notification | P2 | In Progress |
| **REQ-SYS-005** | Audit Logging | บันทึกประวัติการเปลี่ยนแปลงข้อมูลสำคัญแบบ Tamper-proof | P1 | Approved |
| **REQ-SYS-006** | Data Export | ส่งออกข้อมูลรายงานในรูปแบบ Excel, CSV และ PDF | P3 | Planned |

---

## 2.2 ข้อกำหนดที่ไม่ใช่ฟังก์ชัน (Non-Functional Requirements)

> **ข้อกำหนดด้านประสิทธิภาพและความปลอดภัย:**
> - **Response Time:** API endpoint ต้องมีค่า Latency ไม่เกิน 500ms สำหรับ 95th Percentile
> - **Availability:** ระบบต้องมีความพร้อมใช้งาน (Uptime SLA) ไม่ต่ำกว่า 99.9%
> - **Data Encryption:** เข้ารหัสข้อมูลลับด้วย AES-256 (At-Rest) และ TLS 1.3 (In-Transit)
> - **Concurrent Users:** รองรับผู้ใช้งานพร้อมกันอย่างน้อย 1,000 Concurrent Connections

<!-- pagebreak -->
`,
      },
      {
        filename: "03-system-architecture.md",
        title: "3. สถาปัตยกรรมระบบ (System Architecture)",
        description: "ผังการทำงาน แผนภาพสถาปัตยกรรม และการไหลของข้อมูล",
        content: `# 3. สถาปัตยกรรมระบบ (System Architecture)

## 3.1 แผนภาพสถาปัตยกรรมระดับสูง (High-Level Architecture)

\`\`\`mermaid
graph TD
  subgraph ClientLayer["Client Applications"]
    Web["Web Portal (Next.js)"]
    Mobile["Mobile App (Flutter / React Native)"]
    ThirdParty["External Systems / Partners"]
  end

  subgraph GatewayLayer["API Management & Security"]
    WAF["Cloudflare WAF / DDoS Protection"]
    APIGW["Reverse Proxy & API Gateway"]
  end

  subgraph CoreLayer["Microservices & Application Tier"]
    AuthSvc["Auth & IAM Service"]
    CoreSvc["Core Domain Engine"]
    NotifySvc["Notification Service"]
  end

  subgraph DataLayer["Storage & Message Queue Tier"]
    Postgres[(PostgreSQL Primary/Replica)]
    Redis[(Redis Cache / Rate Limiter)]
    Queue[(RabbitMQ / Kafka Event Bus)]
  end

  Web --> WAF
  Mobile --> WAF
  ThirdParty --> WAF
  WAF --> APIGW

  APIGW --> AuthSvc
  APIGW --> CoreSvc
  APIGW --> NotifySvc

  AuthSvc --> Redis
  CoreSvc --> Postgres
  CoreSvc --> Redis
  CoreSvc --> Queue
  Queue --> NotifySvc
\`\`\`

---

## 3.2 ขั้นตอนการประมวลผลคำขอ (Request Processing Flow)

\`\`\`mermaid
sequenceDiagram
  autonumber
  actor User as ผู้ใช้งาน (Client)
  participant Gateway as API Gateway
  participant Auth as Auth Service
  participant Core as Core Engine
  participant DB as Database Cluster

  User->>Gateway: ส่ง Request พร้อม Bearer JWT Token
  Gateway->>Auth: ตรวจสอบความถูกต้องและสิทธิ์ของ Token
  Auth-->>Gateway: สิทธิ์ถูกต้อง (Authorized)
  Gateway->>Core: ส่งต่อ Request ไปยัง Core Service
  Core->>DB: Query / บันทึกข้อมูลแบบ Transaction
  DB-->>Core: ยืนยันผลลัพธ์การบันทึก
  Core-->>Gateway: ผลลัพธ์การทำงาน (JSON Payload)
  Gateway-->>User: HTTP 200 OK
\`\`\`

<!-- pagebreak -->
`,
      },
      {
        filename: "04-data-model.md",
        title: "4. แบบจำลองข้อมูลและพจนานุกรม (Data Model & Schema)",
        description: "Entity Relationship Diagram และพจนานุกรมข้อมูล",
        content: `# 4. แบบจำลองข้อมูลและพจนานุกรม (Data Model & Schema)

## 4.1 แผนภาพความสัมพันธ์ของข้อมูล (Entity-Relationship Diagram)

\`\`\`mermaid
erDiagram
  ORGANIZATION ||--o{ USER_ACCOUNT : contains
  USER_ACCOUNT ||--o{ ROLE_ASSIGNMENT : has
  ROLE_ASSIGNMENT }o--|| SYSTEM_ROLE : maps
  USER_ACCOUNT ||--o{ TRANSACTION_LOG : performs
  TRANSACTION_LOG ||--|| AUDIT_RECORD : generates

  USER_ACCOUNT {
    uuid id PK
    string email UK
    string password_hash
    string status
    timestamp created_at
  }

  TRANSACTION_LOG {
    uuid id PK
    uuid user_id FK
    string action_type
    decimal amount
    string currency
    timestamp executed_at
  }
\`\`\`

---

## 4.2 พจนานุกรมข้อมูลหลัก (Data Dictionary)

### ตาราง \`system_transactions\` (ประวัติการทำรายการหลัก)

| ชื่อฟิลด์ (Field Name) | ประเภทข้อมูล (Data Type) | Nullable | คำอธิบาย (Description) |
| :--- | :--- | :---: | :--- |
| \`id\` | UUID | No | รหัสระบุรายการ Primary Key (Auto-generated v4) |
| \`reference_no\` | VARCHAR(32) | No | รหัสอ้างอิงเอกสารหรือธุรกรรม (Unique Index) |
| \`user_id\` | UUID | No | Foreign Key อ้างอิงตาราง \`user_accounts\` |
| \`amount\` | NUMERIC(18, 4) | No | ยอดเงินหรือมูลค่าของรายการ |
| \`status\` | VARCHAR(20) | No | สถานะรายการ: \`PENDING\`, \`COMPLETED\`, \`REJECTED\` |
| \`created_at\` | TIMESTAMPTZ | No | วันที่และเวลาที่บันทึกรายการ (UTC) |
`,
      },
    ],
  },
  {
    id: "gojo-enrich-requirement",
    name: "Requirement Confirmation (Gojo Enrich Standard)",
    title: "Requirement Confirmation Document",
    subtitle: "เอกสารยืนยันขอบเขตความต้องการและข้อตกลงการพัฒนาตามมาตรฐาน Gojo Enrich",
    category: "requirement",
    categoryLabel: "ยืนยันความต้องการ",
    badge: "Gojo Enrich / Sign-off",
    description:
      "แบบฟอร์มเอกสารยืนยันความต้องการทางธุรกิจตามมาตรฐาน Gojo Enrich มีตารางควบคุมเวอร์ชัน คำนิยามคำศัพท์ กล่องผลการพิจารณา REQ และตารางลงนาม 2 ฝ่าย",
    documentNumberPrefix: "DOC-REQ",
    theme: {
      primaryColor: "#0f3b6c",
      accentColor: "#1d4ed8",
    },
    files: [
      {
        filename: "01-project-overview.md",
        title: "ส่วนที่ 1 & 2: ข้อมูลโครงการและคำนิยามคำศัพท์",
        description: "ตารางควบคุมเอกสารและคำนิยามเฉพาะของระบบ",
        content: `# เอกสารยืนยันขอบเขตความต้องการระบบ (Requirement Confirmation)
### โครงการ: {{projectName}}
#### ลูกค้า / ผู้ว่าจ้าง: {{client}}
---

## ส่วนที่ 1: ข้อมูลเอกสารและการควบคุมเวอร์ชัน (Document Control)

* **รหัสโครงการ** : {{projectName}}
* **เลขที่เอกสาร** : DOC-{{projectName}}-2026-001
* **เวอร์ชันเอกสาร** : v{{version}}
* **วันที่จัดทำ** : {{date}}
* **ผู้จัดทำ (Author)** : {{author}}
* **หน่วยงานผู้จัดทำ** : {{organization}}
* **ผู้รับผิดชอบฝั่งผู้ว่าจ้าง** : คุณผู้ดูแลโครงการ ({{client}})
* **สถานะเอกสาร** : อยู่ระหว่างการพิจารณาและลงนาม (Under Review)

---

## ส่วนที่ 2: คำนิยามและคำศัพท์เฉพาะ (Glossary & Definitions)

* **{{projectName}}** : ระบบซอฟต์แวร์ที่พัฒนาขึ้นเพื่อรองรับการดำเนินงานตามขอบเขตข้อตกลง
* **Tenant / Workspace** : ขอบเขตการจัดเก็บข้อมูลและการตั้งค่าเฉพาะสำหรับแต่ละองค์กรผู้ใช้งาน
* **MFA (Multi-Factor Authentication)** : การยืนยันตัวตนแบบหลายปัจจัยเพื่อความปลอดภัยสูงสุด
* **Audit Trail** : บันทึกประวัติการเปลี่ยนแปลงข้อมูลที่ไม่สามารถลบหรือดัดแปลงแก้ไขได้
* **Idempotency Key** : กุญแจเฉพาะที่ใช้ป้องกันการประมวลผลคำขอซ้ำซ้อนในระดับ API

<!-- pagebreak -->
`,
      },
      {
        filename: "02-module-specifications.md",
        title: "ส่วนที่ 3: รายละเอียดความต้องการและข้อกำหนดทางเทคนิค",
        description: "รายการ Requirement พร้อมกล่องผลการพิจารณา",
        content: `# ส่วนที่ 3: รายละเอียดความต้องการตามโมดูล (Module Specifications)

### 3.1 REQ-001 — ระบบจัดการสิทธิ์การเข้าถึงข้อมูล (Role-Based Access Control)

**Requirement จากการประชุม**  
ระบบต้องสามารถกำหนดบทบาทผู้ใช้งาน (Roles) และสิทธิ์การเข้าถึง (Permissions) ได้อย่างละเอียดตามหน้าที่งาน โดยผู้ดูแลระบบสามารถสร้างและแก้ไขสิทธิ์ได้เองผ่านหน้าจอ Admin Portal

**พฤติกรรมที่คาดหวัง (Expected Behavior)**
1. มีสิทธิ์พื้นฐานตั้งต้น (System Default Roles): SuperAdmin, Manager, Staff, Viewer
2. สามารถกำหนดสิทธิ์ระดับ Module, Menu, และ Action (Read, Create, Edit, Delete, Export)
3. การเข้าถึง API ทุกเส้นต้องตรวจสอบ Token และ Scope สิทธิ์เสมอ

**ผลการพิจารณา:**
- [x] ยืนยันตามข้อเสนอ
- [ ] ขอแก้ไข
- [ ] ไม่อยู่ในขอบเขต
- [ ] รอหารือเพิ่ม
**หมายเหตุลูกค้า:** เห็นชอบตามแนวทางที่เสนอ ขอให้เพิ่มสิทธิ์สำหรับการ Export ข้อมูลแยกต่างหาก

---

### 3.2 REQ-002 — ระบบบันทึกประวัติการทำงาน (Audit Logging)

**Requirement จากการประชุม**  
เมื่อมีการสร้าง แก้ไข ลบ หรือเปลี่ยนแปลงสถานะของข้อมูลสำคัญในระบบ ระบบต้องบันทึกประวัติการทำงานโดยอัตโนมัติ

**พฤติกรรมที่คาดหวัง (Expected Behavior)**
1. บันทึกข้อมูลผู้กระทำ (User ID, IP Address, User Agent)
2. บันทึกค่าข้อมูลเดิม (Old Value) และค่าข้อมูลใหม่ (New Value) ในรูปแบบ JSON Snapshot
3. ข้อมูล Log ต้องไม่สามารถลบหรือแก้ไขย้อนหลังได้โดยเด็ดขาด

**ผลการพิจารณา:**
- [x] ยืนยันตามข้อเสนอ
- [ ] ขอแก้ไข
- [ ] ไม่อยู่ในขอบเขต
- [ ] รอหารือเพิ่ม
**หมายเหตุลูกค้า:** -

<!-- pagebreak -->
`,
      },
      {
        filename: "03-sign-off.md",
        title: "ส่วนที่ 4: การลงนามยืนยันขอบเขตความต้องการ",
        description: "ตารางลงนาม 2 ฝ่ายระหว่างผู้ว่าจ้างและผู้พัฒนา",
        content: `# การลงนามยืนยันขอบเขตความต้องการ (Scope Sign-off & Acceptance)

เอกสารฉบับนี้มีผลผูกพันเพื่อใช้เป็นหลักฐานและแนวทางในการพัฒนาและตรวจรับระบบ **{{projectName}}** หากมีการแก้ไขเพิ่มเติมหรือเปลี่ยนแปลงขอบเขตนอกเหนือจากที่ระบุไว้ในเอกสารนี้ ทั้งสองฝ่ายตกลงจะจัดทำเอกสาร Change Request (CR) ต่อไป

**ฝั่งผู้ว่าจ้าง (Client Confirmation)**
(บริษัท {{client}})
ลายเซ็น: ____________________________________
ชื่อ-นามสกุล: ________________________________
ตำแหน่ง: ___________________________________
วันที่: ________ / ________ / _______________

**ฝั่งผู้พัฒนา (Developer Acknowledgment)**
({{organization}})
ลายเซ็น: ____________________________________
ชื่อ-นามสกุล: ________________________________
ตำแหน่ง: ___________________________________
วันที่: ________ / ________ / _______________
`,
      },
    ],
  },
  {
    id: "api-integration-spec",
    name: "API & Integration Specification",
    title: "RESTful API & Integration Specification",
    subtitle: "เอกสารข้อกำหนดทางเทคนิคสำหรับการเชื่อมต่อ Web API และระบบภายนอก",
    category: "api",
    categoryLabel: "API & ระบบเชื่อมต่อ",
    badge: "Developer / API Spec",
    description:
      "สำหรับทีมนักพัฒนาและ System Integrator ครอบคลุมการยืนยันตัวตน (Bearer JWT / API Key), Catalog Endpoints, รูปแบบ JSON Schema, Response Codes, และ Error Handling",
    documentNumberPrefix: "DOC-API",
    theme: {
      primaryColor: "#312e81",
      accentColor: "#7c3aed",
    },
    files: [
      {
        filename: "01-api-overview.md",
        title: "1. ภาพรวมและมาตรฐานการเชื่อมต่อ (API Overview)",
        description: "Base URLs, Authentication, Headers, และ Rate Limiting",
        content: `# 1. ภาพรวมและมาตรฐานการเชื่อมต่อ (API Overview)

เอกสารฉบับนี้ระบุข้อกำหนดทางเทคนิคสำหรับการเชื่อมต่อ RESTful API ของระบบ **{{projectName}}**

## 1.1 สภาพแวดล้อมระบบ (Environments & Base URLs)

| สภาพแวดล้อม (Environment) | Base URL | คำอธิบาย |
| :--- | :--- | :--- |
| **Sandbox / Staging** | \`https://api-sandbox.enterprise.com/v1\` | สำหรับการพัฒนาและทดสอบระบบ |
| **Production** | \`https://api.enterprise.com/v1\` | สภาพแวดล้อมจริง ป้องกันด้วย Cloudflare |

---

## 1.2 การยืนยันตัวตน (Authentication & Authorization)
ระบบใช้ **OAuth 2.0 / Bearer JWT Token** ในการตรวจสอบสิทธิ์การเข้าถึง ทุก Request ต้องแนบ Header ดังนี้:

\`\`\`http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
X-Client-Id: {{projectName}}-client
X-Request-Id: 550e8400-e29b-41d4-a716-446655440000
\`\`\`

---

## 1.3 อัตราการจำกัดการเรียกใช้งาน (Rate Limiting)
- **Standard Quota:** 120 Requests ต่อนาที ต่อ Client IP
- **Batch Operations:** 20 Requests ต่อนาที
- เมื่อเกินขีดจำกัด ระบบจะตอบกลับด้วยรหัส \`HTTP 429 Too Many Requests\`

<!-- pagebreak -->
`,
      },
      {
        filename: "02-endpoints-catalog.md",
        title: "2. รายการ Endpoints และ Schemas",
        description: "รายละเอียด REST Endpoints, Parameters, และตัวอย่าง Response",
        content: `# 2. รายการ Endpoints และ Schemas

## 2.1 สรุปภาพรวม Endpoints

| Method | Endpoint | คำอธิบาย | สิทธิ์ที่ต้องการ |
| :--- | :--- | :--- | :--- |
| \`POST\` | \`/auth/token\` | ขอรับ Access Token สำหรับเข้าสู่ระบบ | Public |
| \`GET\` | \`/api/v1/resources\` | ดึงรายการข้อมูลตามเงื่อนไข Pagination | \`resource:read\` |
| \`POST\` | \`/api/v1/resources\` | สร้างรายการข้อมูลใหม่ | \`resource:write\` |
| \`GET\` | \`/api/v1/resources/{id}\` | ดึงรายละเอียดข้อมูลรายแถว | \`resource:read\` |

---

## 2.2 Endpoint Detail: \`POST /api/v1/resources\`

**คำอธิบาย:** ใช้สำหรับสร้างข้อมูลใหม่ในระบบ โดยรองรับ Idempotency ป้องกันการสร้างซ้ำ

### Request Headers
| Header Name | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| \`Idempotency-Key\` | String (UUID) | Yes | รหัสเฉพาะป้องกันการส่งซ้ำ |

### Request Body (JSON)
\`\`\`json
{
  "code": "ITEM-2026-001",
  "name": "Standard Subscription Plan",
  "amount": 2500.00,
  "currency": "THB",
  "metadata": {
    "channel": "mobile-app",
    "referrer": "partner-xyz"
  }
}
\`\`\`

### Response Success (\`201 Created\`)
\`\`\`json
{
  "success": true,
  "data": {
    "id": "c71a39f6-6c70-4f51-995a-c941328eb97e",
    "code": "ITEM-2026-001",
    "name": "Standard Subscription Plan",
    "amount": 2500.00,
    "currency": "THB",
    "status": "ACTIVE",
    "createdAt": "2026-09-23T10:00:00Z"
  }
}
\`\`\`

<!-- pagebreak -->
`,
      },
      {
        filename: "03-error-codes-and-webhooks.md",
        title: "3. รหัสข้อผิดพลาดและ Webhooks (Error Handling & Webhooks)",
        description: "RFC 7807 Problem Details และการแจ้งเตือนแบบ Webhook",
        content: `# 3. รหัสข้อผิดพลาดและ Webhooks (Error Handling & Webhooks)

## 3.1 รูปแบบข้อผิดพลาดมาตรฐาน (RFC 7807 Problem Details)

\`\`\`json
{
  "type": "https://api.enterprise.com/errors/validation-failed",
  "title": "Validation Error",
  "status": 422,
  "detail": "ฟิลด์ 'amount' ต้องมีค่ามากกว่า 0",
  "instance": "/api/v1/resources",
  "errorCode": "ERR_INVALID_AMOUNT",
  "invalidParams": [
    {
      "name": "amount",
      "reason": "Must be greater than 0"
    }
  ]
}
\`\`\`

---

## 3.2 การรับข้อมูลเหตุการณ์อัตโนมัติ (Webhook Integration)

\`\`\`mermaid
sequenceDiagram
  participant Server as {{projectName}} Core Server
  participant Client as Subscriber Webhook Server

  Server->>Client: POST /webhook/events (พร้อม HMAC Signature)
  Note over Client: ตรวจสอบ X-Hub-Signature-256
  alt Signature ถูกต้อง
    Client-->>Server: HTTP 200 OK
  else Signature ไม่ถูกต้อง
    Client-->>Server: HTTP 401 Unauthorized
  end
\`\`\`
`,
      },
    ],
  },
  {
    id: "erp-pos-module",
    name: "ERP & POS Business Module Specification",
    title: "ERP Business Module & Process Specification",
    subtitle: "เอกสารข้อกำหนดโมดูลระบบบริหารจัดการธุรกิจ กฎการรันเลขเอกสาร และสิทธิ์การทำงาน",
    category: "erp",
    categoryLabel: "ERP / POS Module",
    badge: "Business Operations",
    description:
      "เหมาะสำหรับระบบงานบริหารจัดการ (Enterprise Resource Planning), POS หน้าร้าน, การจัดการสต็อกสินค้า และผังกระบวนการอนุมัติเอกสาร",
    documentNumberPrefix: "DOC-ERP",
    theme: {
      primaryColor: "#064e3b",
      accentColor: "#059669",
    },
    files: [
      {
        filename: "01-business-process.md",
        title: "1. ผังกระบวนการทำงานทางธุรกิจ (Business Process Flow)",
        description: "ขั้นตอนการทำงาน Flowchart และ Swimlane กระบวนการทางธุรกิจ",
        content: `# 1. ผังกระบวนการทำงานทางธุรกิจ (Business Process Flow)

## 1.1 ภาพรวมกระบวนการ (End-to-End Business Flow)

\`\`\`mermaid
flowchart TD
  Start([เริ่มต้น: ลูกค้าเปิดบิล/สั่งซื้อ]) --> InputOrder[พนักงานบันทึกรายการ Order]
  InputOrder --> CheckStock{ตรวจสอบสต็อกสินค้า}
  
  CheckStock -- "สินค้าไม่พอ" --> PO[สร้างใบสั่งซื้อ PO / สั่งของเพิ่ม]
  CheckStock -- "สินค้าพร้อมขาย" --> ConfirmPrice[คำนวณส่วนลดและภาษีมูลค่าเพิ่ม 7%]
  
  ConfirmPrice --> Payment[เลือกช่องทางชำระเงิน]
  Payment --> CompletePay{ชำระเงินสำเร็จ?}
  
  CompletePay -- "ไม่สำเร็จ" --> Payment
  CompletePay -- "สำเร็จ" --> GenerateTaxInvoice[รันเลขที่ใบกำกับภาษีอย่างย่อ/เต็มรูป]
  GenerateTaxInvoice --> DeductStock[ตัดสต็อกสินค้าอัตโนมัติ]
  DeductStock --> PrintReceipt[พิมพ์ใบเสร็จรับเงิน]
  PrintReceipt --> End([สิ้นสุดกระบวนการ])
\`\`\`

<!-- pagebreak -->
`,
      },
      {
        filename: "02-document-numbering-rules.md",
        title: "2. กฎการรันเลขที่เอกสาร (Document Numbering Architecture)",
        description: "รูปแบบรหัสเอกสาร การแยกสาขา และ Atomic Upsert Concurrency",
        content: `# 2. กฎการรันเลขที่เอกสาร (Document Numbering Architecture)

## 2.1 โครงสร้างรูปแบบเลขที่เอกสาร (Token Syntax)

| ประเภทเอกสาร (Document Type) | คำนำหน้า (Prefix) | โครงสร้างรูปแบบ (Format Pattern) | ตัวอย่างเลขที่เอกสาร |
| :--- | :---: | :--- | :--- |
| **ใบสั่งขาย (Sales Order)** | \`SO\` | \`{PREFIX}-{BRANCH}-{YYMM}-{SEQ:4}\` | \`SO-BKK01-2609-0001\` |
| **ใบเสร็จรับเงิน/ใบกำกับภาษี** | \`INV\` | \`{PREFIX}-{BRANCH}-{YYYYMM}-{SEQ:5}\` | \`INV-BKK01-202609-00001\` |
| **ใบเสร็จอย่างย่อ (POS Ticket)** | \`POS\` | \`{PREFIX}-{POS_ID}-{YYMMDD}-{SEQ:4}\` | \`POS-T01-260923-0001\` |
| **ใบปรับสต็อก (Stock Adjust)** | \`ADJ\` | \`{PREFIX}-{YYMM}-{SEQ:4}\` | \`ADJ-2609-0012\` |

> **ข้อกำหนดการ Concurrency:**
> ระบบต้องใช้ **PostgreSQL Atomic Upsert** เพื่อรับประกันว่าเลขที่เอกสารจะไม่เกิดการชนกัน (Zero Collision) แม้จะมีการบันทึกพร้อมกันจากหลายจุดขายหรือหลายเครื่องแคชเชียร์

<!-- pagebreak -->
`,
      },
      {
        filename: "03-roles-and-permissions.md",
        title: "3. สิทธิ์การทำงานและเมทริกซ์การอนุมัติ (Roles & Approval Matrix)",
        description: "การกำหนดสิทธิ์ตามตำแหน่งงานและเพดานวงเงินอนุมัติ",
        content: `# 3. สิทธิ์การทำงานและเมทริกซ์การอนุมัติ (Roles & Approval Matrix)

## 3.1 เมทริกซ์สิทธิ์การทำงานตามบทบาท (Role Matrix)

| ฟังก์ชัน / เมนูการทำงาน | พนักงานหน้าร้าน (Cashier) | หัวหน้าสาขา (Branch Supervisor) | ผู้จัดการฝ่ายบัญชี (Accountant) | ผู้บริหาร (Executive) |
| :--- | :---: | :---: | :---: | :---: |
| เปิดบิลขาย / รับชำระเงิน | [x] | [x] | [ ] | [ ] |
| ขอยกเลิกบิล / Void Transaction | [ ] | [x] | [ ] | [ ] |
| ให้ส่วนลดพิเศษเกิน 10% | [ ] | [x] | [ ] | [ ] |
| ปิดรอบกะประจำวัน (Daily Close) | [x] | [x] | [x] | [ ] |
| ดูรายงานกำไร-ขาดทุน และภาษี | [ ] | [ ] | [x] | [x] |
| อนุมัติปรับยอดสต็อกสูญหาย | [ ] | [ ] | [x] | [x] |
`,
      },
    ],
  },
  {
    id: "blank",
    name: "Blank Document (เอกสารเปล่า)",
    title: "Project Requirements & Technical Specifications",
    subtitle: "เอกสารสเปกระบบฉบับเริ่มต้น",
    category: "general",
    categoryLabel: "เอกสารเปล่า",
    badge: "เริ่มต้นเอง",
    description:
      "สร้างเล่มเอกสารเปล่าที่มีโครงสร้างพื้นฐานสำหรับเริ่มเขียนสเปกด้วยตนเอง หรือพร้อมสำหรับการนำเข้าไฟล์ Markdown (.md) ภายนอก",
    documentNumberPrefix: "DOC-SYS",
    theme: {
      primaryColor: "#0f172a",
      accentColor: "#2563eb",
    },
    files: [
      {
        filename: "01-system-overview.md",
        title: "1. ภาพรวมและวัตถุประสงค์ (Overview)",
        description: "เริ่มต้นเขียนเนื้อหาบทนำของโครงการ",
        content: `# 1. ภาพรวมและวัตถุประสงค์ (Overview)

ยินดีต้อนรับสู่เอกสารสเปกของ **{{projectName}}**

- **Project:** {{projectName}}
- **Version:** v{{version}}
- **Author:** {{author}}
- **Date:** {{date}}

## 1.1 บทนำ (Introduction)
ระบุเนื้อหาภาพรวมของระบบและเป้าหมายที่ต้องการพัฒนา...

## 1.2 แผนภาพสถาปัตยกรรม (Architecture Flowchart)
\`\`\`mermaid
graph TD
  Client[User Application] --> Gateway[API Gateway]
  Gateway --> Service[Core Microservice]
  Service --> DB[(Database Cluster)]
\`\`\`

<!-- pagebreak -->

## 1.3 รายละเอียดระบบ (System Specifications)
| โมดูล (Module) | รายละเอียด (Description) | สถานะ (Status) |
| :--- | :--- | :--- |
| Core Engine | ประมวลผลและจัดการข้อมูลหลัก | กำลังพัฒนา |
| Security & Auth | การยืนยันตัวตนและการเข้าถึง | เสร็จสมบูรณ์ |
`,
      },
    ],
  },
];

/* ==========================================================================
   2. SECTION TEMPLATES (แม่แบบไฟล์ส่วนใหม่สำหรับเพิ่มใน Studio)
   ========================================================================== */

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: "sec-overview",
    title: "ภาพรวมและวัตถุประสงค์ (System Overview)",
    filename: "system-overview.md",
    category: "บทนำ",
    description: "บทนำ ความเป็นมา วัตถุประสงค์ และผู้มีส่วนได้ส่วนเสีย",
    content: `# ภาพรวมและวัตถุประสงค์ของระบบ (System Overview)

## 1. ความเป็นมาและวัตถุประสงค์ (Background & Goals)
ระบุรายละเอียดความเป็นมา ปัญหาเดิม และวัตถุประสงค์ที่ต้องการแก้ไขด้วยระบบนี้...

## 2. ขอบเขตของโครงการ (Project Scope)
- **In-Scope (สิ่งที่อยู่ในขอบเขต):**
  - ฟังก์ชัน ก...
  - ฟังก์ชัน ข...
- **Out-of-Scope (สิ่งที่ไม่อยู่ในขอบเขต):**
  - การเชื่อมต่อกับระบบภายนอก ค...

<!-- pagebreak -->
`,
  },
  {
    id: "sec-functional-req",
    title: "ตารางความต้องการทางฟังก์ชัน (Functional Requirements Matrix)",
    filename: "functional-requirements.md",
    category: "ข้อกำหนด",
    description: "ตารางสรุปความต้องการ รหัส REQ และระดับความสำคัญ P1-P3",
    content: `# ข้อกำหนดฟังก์ชันการทำงาน (Functional Requirements)

| รหัสข้อกำหนด | โมดูลระบบ | รายละเอียดความต้องการ | ระดับความสำคัญ | สถานะ |
| :--- | :--- | :--- | :---: | :---: |
| **REQ-MOD-01** | Core | รายละเอียดความต้องการแรก... | P1 | Approved |
| **REQ-MOD-02** | Core | รายละเอียดความต้องการที่สอง... | P2 | In Progress |
| **REQ-MOD-03** | Notification | การแจ้งเตือนผ่านช่องทางต่างๆ | P3 | Planned |

<!-- pagebreak -->
`,
  },
  {
    id: "sec-req-confirmation",
    title: "สเปกยืนยันความต้องการพร้อมกล่องพิจารณา (Requirement & Review Box)",
    filename: "requirement-confirmation.md",
    category: "ยืนยันความต้องการ",
    description: "หัวข้อฟังก์ชัน พฤติกรรมที่คาดหวัง และกล่องลงความเห็นสำหรับตรวจรับ",
    content: `### REQ-XXX — [ชื่อฟังก์ชัน / หัวข้อความต้องการ]

**Requirement จากการประชุม**  
ระบุรายละเอียดความต้องการที่ได้รับจากผู้ใช้งานหรือลูกค้า...

**พฤติกรรมที่คาดหวัง (Expected Behavior)**
1. เงื่อนไขและขั้นตอนการทำงานข้อที่ 1...
2. เงื่อนไขและขั้นตอนการทำงานข้อที่ 2...

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
    id: "sec-api-spec",
    title: "สเปกการเชื่อมต่อ API (API Endpoint Specification)",
    filename: "api-specifications.md",
    category: "ทางเทคนิค",
    description: "โครงสร้าง Request/Response, Headers, Schema, และ Error Codes",
    content: `# ข้อกำหนดการเชื่อมต่อ API (API Specifications)

## \`POST /api/v1/resource-name\`

**คำอธิบาย:** สร้างข้อมูลใหม่ในระบบ

### Headers
\`\`\`http
Authorization: Bearer <access_token>
Content-Type: application/json
\`\`\`

### Request Payload (JSON)
\`\`\`json
{
  "title": "Example Item",
  "status": "ACTIVE"
}
\`\`\`

### Response Payload (\`200 OK\`)
\`\`\`json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Example Item",
    "status": "ACTIVE"
  }
}
\`\`\`

<!-- pagebreak -->
`,
  },
  {
    id: "sec-data-dictionary",
    title: "พจนานุกรมข้อมูล (Database Schema & Dictionary)",
    filename: "data-dictionary.md",
    category: "ฐานข้อมูล",
    description: "ตาราง Database Schema, Field Names, Data Types, Constraints",
    content: `# พจนานุกรมข้อมูล (Data Dictionary)

### ตาราง \`main_entities\` (คำอธิบายตาราง)

| ชื่อฟิลด์ (Field) | ประเภท (Type) | Nullable | Default | คำอธิบาย (Description) |
| :--- | :--- | :---: | :--- | :--- |
| \`id\` | UUID | No | \`gen_random_uuid()\` | Primary Key ระบุเอกลักษณ์ |
| \`code\` | VARCHAR(30) | No | - | รหัสอ้างอิงเฉพาะ (Unique) |
| \`name\` | VARCHAR(255) | No | - | ชื่อของข้อมูล |
| \`status\` | VARCHAR(20) | No | \`'DRAFT'\` | สถานะของข้อมูล |
| \`created_at\` | TIMESTAMPTZ | No | \`NOW()\` | วันที่เวลาที่สร้าง |

<!-- pagebreak -->
`,
  },
  {
    id: "sec-architecture",
    title: "สถาปัตยกรรมและผังระบบ (Architecture & Flowcharts)",
    filename: "architecture-and-flows.md",
    category: "สถาปัตยกรรม",
    description: "Mermaid Flowchart และ Sequence Diagram",
    content: `# สถาปัตยกรรมและผังระบบ (Architecture & Flows)

## 1. แผนภาพสถาปัตยกรรมระบบ (Architecture Diagram)
\`\`\`mermaid
graph TD
  Web[Web Client] --> APIGW[API Gateway]
  APIGW --> AuthSvc[Authentication Service]
  APIGW --> CoreSvc[Core Business Service]
  CoreSvc --> DB[(Primary Database)]
\`\`\`

## 2. ลำดับการทำงาน (Sequence Flow)
\`\`\`mermaid
sequenceDiagram
  autonumber
  actor User as ผู้ใช้งาน
  participant App as Application UI
  participant API as API Server
  participant DB as Database

  User->>App: กรอกข้อมูลและกดยืนยัน
  App->>API: ส่ง POST Request
  API->>DB: บันทึกข้อมูล
  DB-->>API: ยืนยันผลลัพธ์
  API-->>App: HTTP 200 OK
  App-->>User: แสดงข้อความแจ้งเตือนสำเร็จ
\`\`\`

<!-- pagebreak -->
`,
  },
  {
    id: "sec-signoff",
    title: "ตารางลงนามอนุมัติ (Sign-off & Approval Section)",
    filename: "sign-off-acceptance.md",
    category: "ตรวจรับ",
    description: "ตารางลงนาม 2 ฝ่ายระหว่างผู้ว่าจ้างและผู้พัฒนา",
    content: `# การลงนามยืนยันขอบเขตความต้องการ (Scope Sign-off)

เอกสารฉบับนี้มีผลผูกพันเพื่อใช้เป็นหลักฐานยืนยันความถูกต้องของขอบเขตงานและข้อกำหนดทางเทคนิค

**ฝั่งผู้ว่าจ้าง (Client Confirmation)**  
(ชื่อบริษัทผู้ว่าจ้าง)  
ลายเซ็น: ____________________________________  
ชื่อ-นามสกุล: ________________________________  
ตำแหน่ง: ___________________________________  
วันที่: ________ / ________ / _______________  

**ฝั่งผู้พัฒนา (Developer Acknowledgment)**  
(ชื่อบริษัทผู้พัฒนา)  
ลายเซ็น: ____________________________________  
ชื่อ-นามสกุล: ________________________________  
ตำแหน่ง: ___________________________________  
วันที่: ________ / ________ / _______________  
`,
  },
];

/* ==========================================================================
   3. SNIPPET TEMPLATES (แม่แบบแทรกในเนื้อหา Markdown Editor)
   ========================================================================== */

export const EDITOR_SNIPPET_TEMPLATES: EditorSnippetTemplate[] = [
  {
    id: "snip-review-box",
    title: "กล่องผลการพิจารณา REQ (Review Box)",
    category: "tables",
    categoryLabel: "การพิจารณา & อนุมัติ",
    description: "กล่องสถานะพิจารณา ยืนยันตามข้อเสนอ / ขอแก้ไข พร้อมหมายเหตุ",
    snippet: `\n**ผลการพิจารณา:**\n- [ ] ยืนยันตามข้อเสนอ\n- [ ] ขอแก้ไข\n- [ ] ไม่อยู่ในขอบเขต\n- [ ] รอหารือเพิ่ม\n**หมายเหตุลูกค้า:** -\n\n---\n`,
  },
  {
    id: "snip-signoff-table",
    title: "ตารางลงนาม 2 ฝั่ง (Sign-off Table)",
    category: "approval",
    categoryLabel: "การพิจารณา & อนุมัติ",
    description: "ตารางลายเซ็น ผู้ว่าจ้าง และ ผู้พัฒนา",
    snippet: `\n## การลงนามยืนยันขอบเขตความต้องการ\n\n**ฝั่งผู้ว่าจ้าง (Client Confirmation)**  \n(บริษัท ผู้ว่าจ้าง จำกัด)  \nลายเซ็น: ____________________________________  \nชื่อ-นามสกุล: ________________________________  \nตำแหน่ง: ___________________________________  \nวันที่: ________ / ________ / _______________  \n\n**ฝั่งผู้พัฒนา (Developer Acknowledgment)**  \n(บริษัท ผู้พัฒนา จำกัด)  \nลายเซ็น: ____________________________________  \nชื่อ-นามสกุล: ________________________________  \nตำแหน่ง: ___________________________________  \nวันที่: ________ / ________ / _______________  \n`,
  },
  {
    id: "snip-version-control",
    title: "ตารางควบคุมเอกสาร (ส่วนที่ 1: Document Control)",
    category: "structure",
    categoryLabel: "โครงสร้างเอกสาร",
    description: "ตารางข้อมูลโครงการ เลขที่เอกสาร ผู้จัดทำ และสถานะ",
    snippet: `\n## ส่วนที่ 1: ข้อมูลเอกสารและการควบคุมเวอร์ชัน\n\n* **รหัสโครงการ** : PROJECT-NAME\n* **เลขที่เอกสาร** : DOC-PRJ-2026-001\n* **เวอร์ชันเอกสาร** : v1.0.0\n* **วันที่จัดทำ** : 2026-09-23\n* **ผู้จัดทำ (Author)** : Tan Architecture Team\n* **สถานะเอกสาร** : อยู่ระหว่างการพิจารณา\n\n---\n`,
  },
  {
    id: "snip-glossary",
    title: "ตารางคำนิยามคำศัพท์ (ส่วนที่ 2: Glossary Table)",
    category: "structure",
    categoryLabel: "โครงสร้างเอกสาร",
    description: "ตารางนิยามคำศัพท์เฉพาะและคำย่อในระบบ",
    snippet: `\n## ส่วนที่ 2: คำนิยามและคำศัพท์เฉพาะ (Glossary & Definitions)\n\n* **Term A** : คำอธิบายความหมายของคำศัพท์ที่ 1\n* **Term B** : คำอธิบายความหมายของคำศัพท์ที่ 2\n* **Term C** : คำอธิบายความหมายของคำศัพท์ที่ 3\n\n---\n`,
  },
  {
    id: "snip-api-endpoint",
    title: "บล็อกข้อกำหนด API Endpoint",
    category: "api",
    categoryLabel: "API & ข้อมูล",
    description: "Method, Route, Headers, Request Body, Response 200/400",
    snippet: `\n### \`POST /api/v1/items\`\n\n**คำอธิบาย:** [ระบุการทำงานของ Endpoint]\n\n**Request Headers:**\n\`\`\`http\nAuthorization: Bearer <token>\nContent-Type: application/json\n\`\`\`\n\n**Request Body:**\n\`\`\`json\n{\n  "title": "Item Name",\n  "quantity": 1\n}\n\`\`\`\n\n**Response 200 OK:**\n\`\`\`json\n{\n  "success": true,\n  "data": { "id": "123", "status": "ACTIVE" }\n}\n\`\`\`\n`,
  },
  {
    id: "snip-mermaid-flowchart",
    title: "Mermaid Flowchart แผนภาพการทำงาน",
    category: "mermaid",
    categoryLabel: "แผนภาพ Mermaid",
    description: "แผนภาพ Flowchart เริ่มต้น -> ดำเนินการ -> ตัดสินใจ -> สิ้นสุด",
    snippet: `\n\`\`\`mermaid\ngraph TD\n  Start([เริ่มต้น]) --> Process[ประมวลผลข้อมูล]\n  Process --> Decision{ตรวจสอบเงื่อนไข?}\n  Decision -- \"ผ่าน\" --> Success([เสร็จสมบูรณ์])\n  Decision -- \"ไม่ผ่าน\" --> Error([ส่งข้อความแจ้งเตือน])\n\`\`\`\n`,
  },
  {
    id: "snip-mermaid-sequence",
    title: "Mermaid Sequence Diagram ลำดับการทำงาน",
    category: "mermaid",
    categoryLabel: "แผนภาพ Mermaid",
    description: "ลำดับการรับส่งข้อมูลระหว่าง User, Frontend, Backend, Database",
    snippet: `\n\`\`\`mermaid\nsequenceDiagram\n  autonumber\n  actor User as ผู้ใช้งาน\n  participant Client as Web / App\n  participant Server as API Server\n  participant DB as Database\n\n  User->>Client: ส่งคำขอการทำงาน\n  Client->>Server: HTTP POST /api/action\n  Server->>DB: บันทึกข้อมูลแบบ Transaction\n  DB-->>Server: สำเร็จ\n  Server-->>Client: HTTP 200 OK พร้อมข้อมูล\n  Client-->>User: แสดงผลสำเร็จ\n\`\`\`\n`,
  },
  {
    id: "snip-mermaid-er",
    title: "Mermaid ER Diagram ความสัมพันธ์ของฐานข้อมูล",
    category: "mermaid",
    categoryLabel: "แผนภาพ Mermaid",
    description: "แบบจำลองความสัมพันธ์ Entity-Relationship",
    snippet: `\n\`\`\`mermaid\nerDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ ORDER_ITEM : contains\n  PRODUCT ||--o{ ORDER_ITEM : ordered_in\n\n  CUSTOMER {\n    uuid id PK\n    string name\n    string email UK\n  }\n  ORDER {\n    uuid id PK\n    uuid customer_id FK\n    decimal total_amount\n    string status\n  }\n\`\`\`\n`,
  },
  {
    id: "snip-pagebreak",
    title: "ตัวแบ่งหน้าสำหรับ PDF (<!-- pagebreak -->)",
    category: "structure",
    categoryLabel: "โครงสร้างเอกสาร",
    description: "ขึ้นหน้าใหม่สำหรับการพิมพ์และ Export PDF",
    snippet: `\n<!-- pagebreak -->\n`,
  },
];

/* ==========================================================================
   4. HELPER FUNCTIONS
   ========================================================================== */

export function getAllTemplates(): DocumentTemplate[] {
  return WORKSPACE_TEMPLATES;
}

export function getTemplateById(id: string): DocumentTemplate | undefined {
  return WORKSPACE_TEMPLATES.find((t) => t.id === id);
}

export function getAllSectionTemplates(): SectionTemplate[] {
  return SECTION_TEMPLATES;
}

export function getSectionTemplateById(id: string): SectionTemplate | undefined {
  return SECTION_TEMPLATES.find((s) => s.id === id);
}

export function getAllSnippetTemplates(): EditorSnippetTemplate[] {
  return EDITOR_SNIPPET_TEMPLATES;
}
