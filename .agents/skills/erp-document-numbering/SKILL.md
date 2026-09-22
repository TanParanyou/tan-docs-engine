---
name: erp-document-numbering
description: คู่มือและมาตรฐานสถาปัตยกรรมระบบรันเลขที่เอกสารและรหัสข้อมูลหลัก (Document Numbering & Master Data Sequences) สำหรับโปรเจกต์ tan-erp ครอบคลุม PostgreSQL Atomic Upsert Concurrency (Zero Collision), การแยกประเภท Master Data vs Transactional Documents, Token Syntax, Multi-Branch Isolation, การตั้งค่าคอนฟิก และแนวทางการขยายโมดูลใหม่
---

# ERP Document Numbering & Sequence Architecture (tan-erp)

## 🎯 Overview
คู่มือและมาตรฐานสถาปัตยกรรมสำหรับระบบสร้างเลขที่เอกสาร (Document Numbering Engine) และรหัสข้อมูลหลัก (Master Data Codes) ในโปรเจกต์ **tan-erp** (Project ERP) เพื่อรับประกันความถูกต้องตามหลักการบัญชี การทำงานแบบ Concurrency สูงสุด ปราศจากปัญหาเลขซ้ำ (Zero Collision Under High Concurrency) และความสะดวกในการขยายโมดูลใหม่ในอนาคต (Extensible Core Platform Service)

---

## 🏛️ 1. Architecture Blueprint & Concurrency Guarantee

ระบบใช้สถาปัตยกรรม **Generic Atomic Sequence Engine** ขับเคลื่อนด้วย PostgreSQL โดยมีองค์ประกอบหลัก:

```text
┌─────────────────────────────────────────────────────────────┐
│  Domain Layer: DocumentTypes, Tokens, ResetPeriod Enum      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  Application: IDocumentNumberGenerator, ISequenceCounter    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  Infrastructure: DocumentNumberGenerator, SequenceCounter   │
│  - PostgreSQL Atomic UPSERT with Row-Level Lock             │
│  - Table: common.sequence_counters                          │
│  - Table: common.document_sequence_definitions             │
└─────────────────────────────────────────────────────────────┘
```

### Concurrency & Atomic Guarantee (Zero Collision)
การเพิ่มค่าตัวนับลำดับ (Sequence Counter) ใช้คำสั่ง **PostgreSQL Atomic UPSERT** ในระดับคำสั่ง SQL เดี่ยว:

```sql
INSERT INTO common.sequence_counters (
    organization_id,
    document_type,
    branch_id,
    period_key,
    current_val,
    updated_at_utc
)
VALUES (
    @organizationId,
    @documentType,
    @branchId,
    @periodKey,
    1,
    clock_timestamp()
)
ON CONFLICT (organization_id, document_type, branch_id, period_key)
DO UPDATE SET
    current_val = common.sequence_counters.current_val + 1,
    updated_at_utc = clock_timestamp()
RETURNING current_val;
```

**กฎเหล็ก Concurrency:**
- ห้ามดึงค่าล่าสุดมาบวกหนึ่งที่ Application (`SELECT MAX(...) + 1`) เด็ดขาด เพราะจะเกิดปัญหาเลขชนกันทันทีเมื่อมีผู้ใช้ทำงานพร้อมกัน (Race Condition)
- คำสั่ง Upsert ข้างต้นจะล็อกเฉพาะแถวที่เกี่ยวข้องในระดับ PostgreSQL Row Lock ทำให้การออกเลขรวดเร็ว ปลอดภัย และเลขเรียงต่อกันอย่างถูกต้องเสมอ

---

## 📋 2. Master Data vs Transactional Documents Separation

ในการสร้างเอกสารหรือข้อมูลใหม่ ต้องแยกประเภทให้ชัดเจนตามกฎ 2 กลุ่มนี้:

| หมวดหมู่ (Category) | ตัวอย่างในระบบ | รูปแบบโครงสร้าง (Pattern) | รอบการเริ่มนับใหม่ (Reset Cycle) | เหตุผลและมาตรฐาน |
| :--- | :--- | :--- | :--- | :--- |
| **Master Data Codes** | • ลูกค้า (`customers`)<br>• ผู้ขาย/คู่ค้า (`vendors`)<br>• สินค้า/วัตถุดิบ (`items`)<br>• พนักงาน (`employees`) | `{PREFIX}{SEQ:5}`<br>เช่น `CUS-00001`, `VEN-00001`, `MAT-00001` | **`Never` (ต่อเนื่องตลอดไป)** | รหัสประจำตัวของข้อมูลหลักต้องคงอยู่ถาวรตลอดอายุระบบ **ห้ามรีเซ็ตตามปีหรือเดือนเด็ดขาด** |
| **Transactional Documents** | • ใบเสนอราคา (`quotations`)<br>• ใบประเมินราคา (`estimates`)<br>• ใบสั่งซื้อ (`purchase_orders`)<br>• ใบกำกับภาษี (`tax_invoices`) | `{PREFIX}{BB}{MM}-{SEQ:4}`<br>หรือ `{PREFIX}-{BRANCH}-{YYYY}{MM}-{SEQ:5}`<br>เช่น `QT6909-0001`, `EST-HQ-202609-00001` | **`Monthly` หรือ `Yearly`** | เอกสารทางธุรกรรมต้องรีเซ็ตตามรอบปีภาษี/เดือนบัญชี เพื่อความเป็นระเบียบและการตรวจสอบบัญชี |

---

## 🔤 3. Token Syntax & Format Rules

ระบบรองรับ Token ดังต่อไปนี้ในการประกอบเป็นเลขที่เอกสาร:

| โทเคน (Token) | ความหมาย | ตัวอย่างผลลัพธ์ |
| :--- | :--- | :--- |
| `{PREFIX}` | คำนำหน้าเอกสารที่กำหนด (เช่น `QT`, `CUS-`, `EST`) | `QT` |
| `{BRANCH}` | รหัสสาขา (กรณีเปิดใช้งาน `IsBranchSpecific`) | `HQ`, `B01` |
| `{BBBB}` | ปี พ.ศ. 4 หลัก | `2569` |
| `{BB}` | ปี พ.ศ. 2 หลัก | `69` |
| `{YYYY}` | ปี ค.ศ. 4 หลัก | `2026` |
| `{YY}` | ปี ค.ศ. 2 หลัก | `26` |
| `{MM}` | เดือน 2 หลัก (01-12) | `09` |
| `{DD}` | วัน 2 หลัก (01-31) | `21` |
| `{SEQ:N}` | ลำดับตัวเลขรันอัตโนมัติ เติมเลขศูนย์ข้างหน้าตามจำนวนหลัก `N` (เช่น `{SEQ:4}` -> 4 หลัก, `{SEQ:5}` -> 5 หลัก) | `0001`, `00001` |

### กฎการตรวจสอบ Format Pattern:
1. ทุกรูปแบบต้องมี `{SEQ:...}` หรือ `{SEQ}` **ตรงกันเพียง 1 ตัวเท่านั้น**
2. สำหรับ `next-intl` ใน Frontend: ข้อความที่มีเครื่องหมายปีกกาตรงตัวต้อง escape ด้วย Single Quote เช่น `'{TOKEN}'` หรือ `'{SEQ}'` เพื่อป้องกัน `FORMATTING_ERROR`

---

## 🚀 4. Step-by-Step Extension Guide (คู่มือเพิ่มประเภทเอกสาร/รหัสใหม่)

เมื่อต้องการเพิ่มประเภทเอกสารหรือ Master Data ใหม่ (เช่น `vendors`, `purchase_orders`):

### Step 1: เพิ่ม Constant ใน Domain Layer (`TanErp.Domain`)
แก้ไข [`DocumentNumberingValues.cs`](file:///Users/syaco/Documents/development/tan-erp/backend/src/TanErp.Domain/DocumentNumbering/DocumentNumberingValues.cs):
```csharp
public static class DocumentTypes
{
    // ...
    public const string Vendors = "vendors";

    public static readonly IReadOnlyCollection<string> All = new[]
    {
        Estimates,
        Surveys,
        Opportunities,
        Quotations,
        Customers,
        Vendors // เพิ่มที่นี่
    };
}
```

### Step 2: กำหนดค่า Default Fallback ใน Application & Infrastructure
1. ใน [`DocumentNumberGenerator.cs`](file:///Users/syaco/Documents/development/tan-erp/backend/src/TanErp.Infrastructure/Persistence/DocumentNumbering/DocumentNumberGenerator.cs):
```csharp
if (normalizedDocType == DocumentTypes.Vendors)
{
    prefix = "VEN-";
    formatPattern = "{PREFIX}{SEQ:5}";
    resetPeriod = ResetPeriod.Never;
    padding = 5;
    isBranchSpecific = false;
}
```
2. ใน [`ListDocumentSequencesHandler.cs`](file:///Users/syaco/Documents/development/tan-erp/backend/src/TanErp.Application/DocumentNumbering/ListDocumentSequences/ListDocumentSequencesHandler.cs): กำหนด default projection เช่นเดียวกัน

### Step 3: เรียกใช้งานใน Creation Handler (`TanErp.Application`)
ฉีด `IDocumentNumberGenerator` เข้าไปใน Handler ของฟีเจอร์นั้นๆ:
```csharp
var vendorCode = await _documentNumberGenerator.GenerateAsync(
    access.OrganizationId,
    DocumentTypes.Vendors,
    branchId: null,
    timestamp: now,
    cancellationToken: cancellationToken);

var vendor = Vendor.Create(..., vendorCode);
```

### Step 4: เพิ่มคำแปลภาษา (i18n) ใน Frontend
เพิ่มคำแปลใน `frontend/src/messages/th.json` และ `en.json`:
```json
// th.json -> documentNumbering.types
"vendors": "รหัสผู้ขาย / ซัพพลายเออร์ (Vendor Code)"

// en.json -> documentNumbering.types
"vendors": "Vendor Code"
```

---

## 🛡️ 5. Definition of Done & Verification Checklist

ก่อนส่งมอบงานที่เกี่ยวข้องกับ Document Numbering ทุกครั้ง ต้องผ่านการตรวจสอบดังนี้:
1. [ ] Domain Type มีอยู่ใน `DocumentTypes.All`
2. [ ] มีการระบุ Reset Cycle ถูกต้อง (Master Data = `Never`, Transaction = `Monthly`/`Yearly`)
3. [ ] ใน Handler มีการเรียก `_documentNumberGenerator.GenerateAsync` ก่อนบันทึก
4. [ ] มี Unit Tests ทดสอบการสร้าง Code และ Handler
5. [ ] มีคำแปลภาษาครบถ้วนทั้ง `th.json` และ `en.json` (Key Parity 100%)
6. [ ] ผ่าน Gate Verification:
   ```bash
   dotnet build backend/src/TanErp.Api/TanErp.Api.csproj
   dotnet test backend/tests/TanErp.UnitTests/TanErp.UnitTests.csproj
   npm test (ใน frontend/)
   npm run lint (ใน frontend/)
   ```
