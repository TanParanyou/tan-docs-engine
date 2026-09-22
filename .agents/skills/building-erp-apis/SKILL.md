---
name: building-erp-apis
description: คู่มือและมาตรฐานสถาปัตยกรรมและการสร้าง API แบบ End-to-End สำหรับโปรเจกต์ tan-erp ครอบคลุม .NET 9 Clean Architecture (CQRS Handlers, RequestContext, Permission Authorization), RFC 9457 Problem Details พร้อม Error Codes และ Localized .resx, Parameterized Search/Filters, Deterministic Pagination (Offset & Keyset Cursor), OpenAPI Contract Generation, และ Frontend Integration (Generated Types, Central ApiClient, TanStack Query, Strict Error Mapping)
---

# Building ERP APIs (tan-erp End-to-End API Standards)

## 🎯 Overview
คู่มือและระเบียบปฏิบัติตามมาตรฐานสถาปัตยกรรมสำหรับงานพัฒนา API ในระบบ **tan-erp** (Project ERP) ครอบคลุมตั้งแต่การออกแบบ Contract, การพัฒนา Backend (.NET 9 Clean Architecture), การสืบค้นและแบ่งหน้า (Search & Pagination), ระบบจัดการ Error และข้อความหลายภาษา (RFC 9457 Problem Details & `.resx`), การสร้าง OpenAPI Types ไปจนถึงการบริโภค API ฝั่ง Frontend (Next.js & TanStack Query)

---

## 🏛️ 1. Architecture Blueprint & Layer Responsibilities

ระบบ API ใช้ **Clean Architecture 4 โครงการย่อย** ผสานกับการจัดโครงสร้างแบบ **Vertical Feature Slices** ภายใน Modular Monolith:

```text
TanErp.Api ───────► TanErp.Application ───────► TanErp.Domain
     │                       ▲                       ▲
     └── composition ────────┴── TanErp.Infrastructure
                                  ├─ EF Core (Writes & Transactions)
                                  ├─ Dapper / Raw SQL (Complex Reads)
                                  ├─ Firebase Authentication Adapter
                                  └─ Audit & Persistence Stores
```

### หน้าที่และความรับผิดชอบของแต่ละ Layer
1. **Domain (`TanErp.Domain`):**
   - Entity, Value Objects, Aggregates, Domain Enums และ Business Invariants
   - **กฎเหล็ก:** ปราศจากการพึ่งพา Framework ใดๆ ทั้งสิ้น (POCO ล้วน)
2. **Application (`TanErp.Application`):**
   - Use Cases แบ่งตามโฟลเดอร์ฟีเจอร์ (`Command`, `Query`, `Handler`, `Validator`, `Result`)
   - Ports & Interfaces (`ICustomerReadStore`, `IRequestAccessResolver`, `IClock`)
   - **กฎเหล็ก:** ห้ามเปิดเผย `DbContext`, `DbSet`, `NpgsqlConnection` ออกมาเด็ดขาด
3. **Infrastructure (`TanErp.Infrastructure`):**
   - Data Access: EF Core (`AppDbContext`), EF Entity Configurations, Migrations
   - Complex Read Stores (LINQ หรือ Dapper + Parameterized Raw SQL ตาม Raw SQL Policy)
   - Identity: Firebase Token Verifier, Current User Mapping, Audit Logger
4. **Api (`TanErp.Api`):**
   - Thin Controllers / Endpoints, OpenAPI Definitions (`OpenApiConfiguration`)
   - Request Context Extraction (`RequestContextReader`), Problem Details Mapping (`ProblemDetailsMapper`)
   - Composition Root (IoC / Dependency Injection)

---

## 📡 2. HTTP Conventions & Request Pipeline

### A. Routing & Resource Naming
- Base path: `/api/v1`
- ใช้คำนามพหูพจน์ (Plural Nouns) ในรูปแบบ Kebab-case หรือ Lowercase เช่น `/api/v1/customers`, `/api/v1/opportunities`, `/api/v1/sites`
- JSON fields ใช้ **`camelCase`**; Identifier ทั้งหมดใช้ **UUID v7 / GUID**
- วันที่และเวลาใช้มาตรฐาน **ISO 8601 UTC** (`YYYY-MM-DDTHH:mm:ssZ`)
- Action Endpoints: ใช้เมื่อเป็นการเปลี่ยนสถานะทางธุรกิจ (State Machine Transition) เช่น `POST /api/v1/customers/{id}/activate`
- **Structured Projections / Nested Objects (JsonDocument Rule):**
  - **ห้ามส่งคืนเฉพาะ Foreign Key UUID ดิบ** สำหรับ Entity ที่ต้องแสดงผลบนหน้าจอ (เช่น ผู้รับผิดชอบ, สถานที่, ลูกค้า)
  - ข้อมูลความสัมพันธ์ต้องถูกโปรเจกต์ (Join / Denormalize) ออกมาเป็น Nested Object ใน Response DTO เช่น `owner: { id, displayName, email }`, `assignedSurveyor: { id, displayName, email }`, `site: { id, label, addressLine1 }`
  - **Frontend กฎเหล็ก:** ห้ามเขียน logic `array.find(x => x.id === targetId)` หรือ fetch query หลายตัวมาจับคู่กันเองที่ Frontend เด็ดขาด ทุกอย่างต้องพร้อมแสดงผลจาก Response ของ Backend โดยตรง
  - **No Loose / Arbitrary Fallback Chains:** ห้ามทำ Fallback ต่อกันเป็นลูกโซ่เด็ดขาด (เช่น `valA || valB || valC` หรือเดา field อื่นมาสังเคราะห์ string แสดงแทน) ต้องยึด Single Source of Truth ตาม Structured Contract เท่านั้น หากไม่มีข้อมูลให้แสดงสถานะว่างตามมาตรฐาน (`-`) ห้ามเดาสุ่มเพื่อเอาใจเทสต์


### B. Request Context & Security Headers
ทุก Request ที่เข้าสู่ระบบต้องผ่านการตรวจสอบ Context ดังนี้:
1. `Authorization: Bearer <firebase_jwt_token>` (บังคับสำหรับทุก Endpoint ยกเว้น Public Healthcheck)
2. `X-Membership-Id: <uuid>`: บ่งชี้บริบทองค์กร/สาขาที่ผู้ใช้กำลังดำเนินการ
3. `Idempotency-Key: <string>`: บังคับสำหรับ Mutating Request (`POST` สร้างข้อมูลใหม่) เพื่อป้องกันการกดเบิ้ล
4. `If-Match: "<rowVersion>"`: บังคับสำหรับการแก้ไข/เปลี่ยนสถานะ เพื่อป้องกัน Lost Updates (Concurrency Control)
5. `Accept-Language: th` หรือ `en`: ควบคุมภาษาของข้อความ Error และคำอธิบายจากระบบ

```csharp
// ตัวอย่างการสกัดข้อมูลใน Controller:
var contextResult = RequestContextReader.ReadIdempotentRequest(HttpContext);
if (contextResult.IsFailure)
{
    return ProblemDetailsMapper.CreateProblemResult(contextResult.Error.Code, HttpContext);
}
var auth = contextResult.Value!;
```

---

## 🔍 3. Parameter Search, Filters & Sorting Standards

การสืบค้นข้อมูลใน List Endpoints ต้องเป็นไปตามมาตรฐานเดียวกันทั้งระบบ:

### A. Parameter Structure (`GET /api/v1/<resources>`)
| Query Param | Type | คำอธิบาย |
| :--- | :--- | :--- |
| `search` | `string?` | คำค้นหาทั่วไป (ชื่อ, รหัส, เลขที่เอกสาร) Trim เสมอ |
| `status` | `string?` | กรองตามสถานะทางธุรกิจ (เช่น `draft`, `active`) |
| `[specificType]` | `string?` | กรองเฉพาะฟิลด์ เช่น `customerType`, `stage` |
| `sortBy` | `string?` | ชื่อฟิลด์ที่ต้องการจัดเรียง เช่น `code`, `createdAt`, `name` |
| `sortOrder` | `string?` | ลำดับการจัดเรียง: `asc` หรือ `desc` (Default: `desc`) |
| `page` | `int?` | เลขหน้า (1-indexed) สำหรับ Offset Pagination |
| `limit` | `int` | จำนวนรายการต่อหน้า (Default: 25, Min: 1, Max: 100) |
| `cursor` | `string?` | Opaque Token สำหรับ Keyset Cursor Pagination |

### B. Validation & Normalization ใน Use Case Handler
- ตรวจสอบ `search`: ตัดช่องว่างหัวท้าย (`Trim()`) หากเป็นสตริงว่างให้เป็น `null`
- ตรวจสอบ `sortBy` และ `sortOrder` เทียบกับ Whitelist Domain Constants ป้องกัน SQL Injection / Query Break
- คุมขอบเขต `limit`: บังคับ `if (limit < 1) limit = 25; if (limit > 100) limit = 100;`

```csharp
// ตัวอย่างการตรวจสอบใน Application Handler:
if (!string.IsNullOrWhiteSpace(query.SortBy))
{
    var trimmed = query.SortBy.Trim();
    if (!CustomerSortKey.IsValid(trimmed))
    {
        return Result<ListCustomersResult>.Failure(
            new Error("CUSTOMER_SORT_INVALID", "Invalid customer sort key."));
    }
    sortBy = trimmed;
}
```

---

## 📑 4. Deterministic Pagination Standards

ระบบรองรับ Pagination 2 รูปแบบ โดยต้องมี **Stable Tie-breaker** (เช่น `id`) เสมอเพื่อป้องกันข้อมูลตกหล่น:

### A. Standard Nested Pagination Structure
ทุก List Endpoint ใช้สัญญาโครงสร้างมาตรฐานเดียวกัน โดยห่อหุ้ม Metadata การแบ่งหน้าไว้ในออบเจกต์ `pagination`:
- Request: `?page=2&limit=25` หรือ `?limit=25&cursor=eyJ2YWx1ZSI6...`
- Response Payload Structure:
  ```json
  {
    "items": [ ... ],
    "pagination": {
      "page": 2,
      "pageSize": 25,
      "totalCount": 142,
      "totalPages": 6,
      "nextCursor": "eyJuYW1lIjoiQWNtZSIsImlkIjoiMDFhZGMw...==\""
    }
  }
  ```
- ในกรณีใช้ **Offset-based Pagination**: ค่า `nextCursor` จะเป็น `null` และส่งคืน `totalCount`, `totalPages`, `page`, `pageSize`
- ในกรณีใช้ **Keyset / Cursor-based Pagination**: ค่า `nextCursor` จะส่ง Base64Url token สำหรับเรียกหน้าถัดไป พร้อม `totalCount` จาก Query ทั้งหมด

### C. EF Core Implementation (CustomerReadStore Pattern)
```csharp
// การคำนวณใน Read Store:
var totalCount = await query.CountAsync(cancellationToken);
var skip = (currentPage - 1) * limit;

var items = await query
    .Skip(skip)
    .Take(limit)
    .ToListAsync(cancellationToken);

return new CustomerPage(items, nextCursor, totalCount, currentPage, limit);
```

---

## 🛑 5. RFC 9457 Problem Details & Error Codes

เมื่อเกิดความผิดพลาด Backend จะไม่ส่งข้อความ Error ดิบ แต่จะส่งตามมาตรฐาน **RFC 9457 Problem Details** พร้อม Content-Type `application/problem+json`:

### A. Schema ของ Problem Details
```json
{
  "type": "https://tan-erp.local/problems/customer-version-conflict",
  "title": "ข้อมูลถูกเปลี่ยนแปลงแล้ว",
  "status": 409,
  "code": "CUSTOMER_VERSION_CONFLICT",
  "detail": "ข้อมูลลูกค้าถูกแก้ไขโดยผู้ใช้อื่นแล้ว กรุณารีเฟรชเพื่อดูข้อมูลล่าสุด",
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
  "instance": "/api/v1/customers/019a3cf8-96f0-7c9f-b207-93aa818f4a10",
  "errors": {}
}
```

### B. HTTP Status Code Mapping Matrix
| Status | การใช้งาน | ตัวอย่าง Error Code |
| :---: | :--- | :--- |
| **400** | Request ผิดพลาด, ขาด Context, รูปแบบไม่ถูกต้อง | `MEMBERSHIP_CONTEXT_REQUIRED`, `REQUEST_VALIDATION_FAILED`, `CUSTOMER_CURSOR_INVALID` |
| **401** | ไม่ระบุตัวตน หรือ Token ไม่ถูกต้อง/หมดอายุ | `AUTHENTICATION_REQUIRED`, `AUTHENTICATION_INVALID` |
| **403** | ยืนยันตัวตนแล้วแต่ไม่มีสิทธิ์ใน Resource หรือถูกระงับ | `PERMISSION_DENIED`, `USER_ACCESS_DISABLED`, `ACTIVE_MEMBERSHIP_REQUIRED` |
| **404** | ไม่พบข้อมูล หรือข้อมูลอยู่นอก Scope ของ Organization | `RESOURCE_NOT_FOUND` |
| **409** | Concurrency Conflict หรือ State Machine ไม่ถูกต้อง | `CUSTOMER_VERSION_CONFLICT`, `CUSTOMER_INVALID_STATE`, `IDEMPOTENCY_KEY_REUSED` |
| **422** | ละเมิดกฎธุรกิจ (Business Invariant Violation) | `CUSTOMER_FIELD_REQUIRED`, `ACTIVE_BRANCH_REQUIRED` |
| **428** | ขาด Header Concurrency Precondition | `IF_MATCH_REQUIRED` |
| **500** | ข้อผิดพลาดภายในระบบที่ไม่คาดคิด | `INTERNAL_SERVER_ERROR` |

### C. Localization Ownership (`.resx`)
- ข้อความ `Title` และ `Detail` ของ Error ต้องเก็บในไฟล์ทรัพยากร:
  - `src/TanErp.Api/Resources/Errors.resx` (ภาษาไทย - Default)
  - `src/TanErp.Api/Resources/Errors.en.resx` (ภาษาอังกฤษ)
- รูปแบบคีย์: `<CODE>_TITLE` และ `<CODE>_DETAIL`
- **กฎเหล็ก:** ห้ามแปลง Error Code ตามภาษา และฝั่ง Frontend ต้องใช้ `code` เป็นตัวตัดสินใจ ห้าม Parse ตรวจสอบจากข้อความ `detail` เด็ดขาด

---

## 🔄 6. OpenAPI & Contract Generation Flow

1. **ตกแต่ง Metadata ใน Controller:**
   ระบุ `[ProducesResponseType<T>]` ครบทุก Status Code ทั้ง Success และ Problem Details
2. **สร้าง OpenAPI Specification:**
   - Swagger ถูกลงทะเบียนผ่าน `OpenApiConfiguration.ConfigureSwaggerGen`
   - Contract JSON จะถูกบันทึกไว้ที่ `contracts/openapi/tan-erp.v1.json`
3. **Generate TypeScript Types สำหรับ Frontend:**
   - รันคำสั่งใน `frontend/`:
     ```bash
     npm run generate:api
     ```
   - ตรวจสอบความถูกต้องของ Contract:
     ```bash
     npm run check:api
     ```
   - Types จะถูกสร้างไว้ใน `src/generated/api/tan-erp.v1.ts`

---

## 💻 7. Frontend Integration & Consumption

### A. Strict Type Usage
- **ห้ามสร้าง Interface หรือ Type เองด้วยมือสำหรับ API Request/Response**
- ให้ดึง Type มาจาก `components["schemas"]` หรือ `paths` ใน `tan-erp.v1.ts` เสมอ:
```typescript
import type { components, paths } from "@/generated/api/tan-erp.v1";

export type CustomerResponse = components["schemas"]["CustomerResponse"];
export type CustomerListResponse = components["schemas"]["CustomerListResponse"];
export type ListCustomersParams = NonNullable<
  paths["/api/v1/customers"]["get"]["parameters"]["query"]
>;
```

### B. Central ApiClient (`src/lib/api/api-client.ts`)
- ทุกการติดต่อ HTTP ต้องผ่าน `ApiClient` ตัวกลาง ห้ามใช้ `fetch` ดิบในคอมโพเนนต์
- แนบ `token`, `membershipId`, `idempotencyKey`, `ifMatch`, และ `locale` ให้ครบถ้วน
- สกัด RFC 9457 Problem Details ออกมาเป็นคลาส `ApiError`

### C. TanStack Query Pattern (Query Keys & Hooks)
- กำหนด Query Key แบบ Deterministic Array ที่มี namespace `["business", membershipId, locale, feature, action, ...params]`
- ตรวจสอบ Guard ก่อนยิง Query (`enabled: Boolean(membershipId)`)
- ดักจับ Error ด้วย `instanceof ApiError` และตรวจสอบ `error.code`

```typescript
export function customerListQueryKey(
  membershipId: string | null | undefined,
  locale: "th" | "en",
  params?: ListCustomersParams
) {
  return [
    "business",
    membershipId,
    locale,
    "customers",
    "list",
    params?.search ?? null,
    params?.status ?? null,
    params?.page ?? 1,
    params?.limit ?? 25,
  ] as const;
}

export function useCustomerList(params?: ListCustomersParams) {
  const locale = useSafeLocale();
  const { selectedMembership } = useSelectedMembership();
  const membershipId = selectedMembership?.id;

  return useQuery({
    queryKey: customerListQueryKey(membershipId, locale, params),
    queryFn: async ({ signal }) => {
      const token = await getAuthToken();
      if (!token) throw new AuthenticationRequiredError();
      if (!membershipId) throw new MembershipRequiredError();

      return apiClient.listCustomers({ token, membershipId, locale, signal }, params);
    },
    enabled: Boolean(membershipId),
  });
}
```

---

## 📋 8. Definition of Done (DoD) & Verification Checklist

ก่อนส่งมอบ API ใดๆ ต้องตรวจสอบผ่านเกณฑ์ทั้งหมดดังต่อไปนี้:

- [ ] **Clean Architecture:** Controller บาง, Logic ทั้งหมดอยู่ใน Application Handler และ Domain Entity
- [ ] **Security & Permissions:** มีการตรวจสอบ Bearer Token, Membership Context และ Permission Key ผ่าน `IRequestAccessResolver`
- [ ] **Search & Filters:** พารามิเตอร์ `search` มีการ Trim/Normalize; `sortBy` และ `sortOrder` มีการ Whitelist Validation
- [ ] **Pagination:** ข้อมูล List มีการจำกัด `limit` (สูงสุดไม่เกิน 100), รองรับ `page` หรือ `cursor`, และมี `id` เป็น Stable Tie-breaker
- [ ] **Error Handling:** ใช้ RFC 9457 Problem Details มี `code` ตรงตาม Contract และมีข้อความใน `.resx` ทั้งภาษาไทยและอังกฤษ
- [ ] **OpenAPI Updated:** เพิ่ม Endpoint ใน OpenAPI Spec และรัน `npm run generate:api` ผ่าน
- [ ] **Frontend Strictness:** ไม่มี Type `any`, ใช้งานผ่าน `ApiClient`, และดักจับ Error ด้วย `instanceof ApiError`
- [ ] **Verification Gates:**
  - Backend: `dotnet build && dotnet test`
  - Frontend: `npm run lint && npx tsc --noEmit && npm test && npm run build`
