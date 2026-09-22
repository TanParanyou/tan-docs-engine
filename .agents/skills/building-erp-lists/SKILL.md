---
name: building-erp-lists
description: คู่มือและมาตรฐานการสร้างหรือปรับปรุงหน้าตารางรายการ ERP (List/Table Pages) สำหรับโปรเจกต์ tan-erp ครอบคลุม 2-Tier Header, ListToolbar, Table-Preserved DataTable, useListState (URL Synced), useRowSelection, useCsvExport, Safety Confirmation Modal, Drawer/Detail Navigation และ Atelier Architectural Navy Sharp Design System
---

# Building ERP Lists (tan-erp Frontend Standards)

## 🎯 Overview
เมื่อต้องพัฒนาหรือปรับปรุงแก้ไขหน้าแสดงรายการข้อมูล (List Pages / Data Grids) ในระบบ **tan-erp** (เช่น ลูกค้า, โอกาสทางการขาย, ไซต์งาน, โครงการ, ใบเสนอราคา หรือรายการสินค้า) ต้องปฏิบัติตามมาตรฐานในคู่มือนี้อย่างเคร่งครัด เพื่อรักษาความเสถียรของ State, ป้องกัน Layout Shift, รองรับการสืบค้นและแบ่งปันผ่าน URL, รองรับการ Export ข้อมูล, ความปลอดภัยในการดำเนินการ (Safety Confirmation Modals) และความสอดคล้องกับมาตรฐานการออกแบบ **Atelier Architectural Navy Sharp**

---

## 🏛️ 1. Core Architecture & Layout Composition Blueprint

หน้าตารางรายการ ERP ประกอบด้วยเลเยอร์องค์ประกอบที่เป็นทางการ 5 ชั้น โดยห้ามสลับตำแหน่งหรือตัดส่วนกรอบโครงสร้างตารางออก:

```text
+------------------------------------------------------------------------------------+
| 1. PageHeader (2-Tier Architectural Header)                                        |
|    - Eyebrow breadcrumb / module tag                                               |
|    - Title & Active item count badge                                               |
|    - Primary Action Button (e.g. + Create Customer with PermissionGuard)           |
+------------------------------------------------------------------------------------+
| 2. ListToolbar (Multi-Control Search, Filters & Bulk Operations)                   |
|    - Search Input (Debounced 300ms + Instant Enter/Clear)                          |
|    - Multi-Filter Selects (Status, Type, Categories)                               |
|    - Export CSV Button (Full Dataset Unpaginated Fetch)                            |
|    - ActiveFilterChips Bar (Dismissible filter tokens with Clear All)              |
+------------------------------------------------------------------------------------+
| 3. Table-Preserved Main Content Area                                               |
|    - True Zero Entity Check -> High-affordance EmptyState with primary CTA         |
|    - In-Flight / Filtered / Error / Normal Data -> DataTable stays MOUNTED:       |
|      * Sticky Lock-Scroll Action Column (Rightmost)                                |
|      * Row Checkboxes (Multi-Selection with Select-All)                            |
|      * Inline Loading Overlay or minimal MonoSpinner inside <tbody>                |
|      * Inline Error Banner with Retry inside <tbody> (Table Header Preserved)      |
|      * Inline Filtered Empty State inside <tbody> (Table Header Preserved)         |
|      * Integrated Dense Pagination Footer (Page, Limit, Total, Quick Jump)        |
+------------------------------------------------------------------------------------+
| 4. BulkActionToolbar (Floating bottom docked when selectedCount > 0)               |
|    - Selection count indicator ("X รายการที่เลือก")                                |
|    - Export Selected CSV button                                                    |
|    - Batch Action Buttons (e.g. Bulk Delete / Status Change)                       |
|    - Clear Selection trigger                                                       |
+------------------------------------------------------------------------------------+
| 5. Action Overlays & Modals                                                        |
|    - Safety Confirmation Modal (Delete / Void / Deactivate) with Double-Submit Lock|
|    - Quick View / Edit Slide-over Drawer                                           |
+------------------------------------------------------------------------------------+
```

### Table-Preserved Architecture (กฎเหล็กห้ามสลับ Layout)
⚠️ **ข้อห้ามสำคัญ:** ในระบบ ERP ห้ามใช้การตัดสลับทั้งคอมโพเนนต์ภายนอกแบบนี้เด็ดขาด:
```tsx
// ❌ WRONG: ทำให้ Header ตารางกระตุกหายไป เกิด Layout Shift และสับสนบริบท
{isError ? <ErrorState /> : !data.length ? <EmptyState /> : <DataTable />}
```
**ให้ใช้ Table-Preserved Architecture เสมอ:**
- หากยังไม่เคยมีข้อมูลในระบบเลยตั้งแต่เริ่มต้น (`isZeroEntities === true` โดยไม่มีฟิลเตอร์หรือคำค้นหา): ให้แสดง `<EmptyState icon="empty" title={...} actionLabel={...} />` เพื่อเชิญชวนให้สร้างข้อมูลชิ้นแรก
- หากเกิด Error ระหว่างโหลดข้อมูล หรือผลการค้นหาไม่พบข้อมูล: **ต้องคง `<DataTable />` ไว้บนหน้าจอเสมอ** โดยส่ง props `isLoading`, `isError`, `error`, `onRetry`, `emptyTitle`, `emptyDescription` เข้าไปยัง `DataTable` เพื่อให้เรนเดอร์ Error Banner หรือ Filtered Empty ภายใน `<tbody>` ใต้หัวตารางที่ตรึงอยู่คงที่

---

## 🎛️ 2. State Management & Specialized Hooks

หน้ารายการใน tan-erp ต้องใช้ Reusable Hooks ส่วนกลาง เพื่อความสอดคล้องของการทำงาน:

### A. URL-Synced Query & Filter State (`useListState`)
จัดการสถานะ Search, Filter, Sort และ Pagination ซิงค์เข้ากับ URL Search Parameters โดยอัตโนมัติ เพื่อให้ผู้ใช้กด Refresh, ย้อนกลับ หรือคัดลอก URL ส่งต่อให้เพื่อนร่วมงานแล้วได้ผลลัพธ์เดิม:
- นำเข้าจาก: `@/hooks/useListState`
- **ฟังก์ชันและความสามารถ:**
  - Search Debounce (300ms) พร้อม `draftSearch` และปุ่มเคลียร์/ส่งค่าทันที
  - เพิ่ม/ลบ Filter Tokens รองรับแบบ Single และ Array
  - รีเซ็ตหน้ากลับไปเป็น `page: 1` อัตโนมัติเมื่อมีการค้นหาหรือเปลี่ยนฟิลเตอร์
  - ซิงค์ Sorting key และ order (`asc` / `desc`)

```tsx
import { useListState, type ListFilterRecord } from "@/hooks/useListState";

interface MyFilters extends ListFilterRecord {
  status?: string;
  category?: string;
}

const listState = useListState<MyFilters>({
  defaultLimit: 20,
  defaultSort: "createdAt",
  defaultOrder: "desc",
});

// การใช้งานร่วมกับ UI:
<ListSearchInput
  value={listState.draftSearch}
  isDebouncing={listState.isDebouncing}
  onChange={(val) => listState.actions.setSearch(val)}
  onClear={() => listState.actions.setSearch("", true)}
  onSubmit={(val) => listState.actions.setSearch(val, true)}
/>
```

### B. Multi-Row Selection (`useRowSelection`)
จัดการการเลือกแถว Checkbox รายตัวและการเลือกทั้งหมด (Select All):
- นำเข้าจาก: `@/hooks/useRowSelection`
- รองรับการเลือกทั้งชุด (`selectAll(allRowIds)`)
- ซิงค์จำนวนที่เลือกเพื่อแสดงผลบน `BulkActionToolbar`

```tsx
import { useRowSelection } from "@/hooks/useRowSelection";

const {
  selectedIds,
  selectedCount,
  isSelected,
  toggleSelection,
  selectAll,
  clearSelection,
} = useRowSelection();
```

### C. Large Dataset CSV Export (`useCsvExport` & `exportToCsv`)
การส่งออกข้อมูลไฟล์ CSV ต้องรองรับทั้ง **ส่งออกทั้งหมด (Unpaginated Fetch)** และ **ส่งออกเฉพาะแถวที่เลือก (Selected Rows)**:
- Core Utility: `@/lib/export/export-csv` (รองรับ UTF-8 BOM ภาษาไทยไม่เพี้ยนใน MS Excel)
- Hook: `@/hooks/useCsvExport`
- **หลักการทำงาน:**
  - `exportAll`: หากข้อมูลมีหลายหน้า ให้กำหนดฟังก์ชัน `fetchAll` ไปเรียก API ด้วย `limit: 1000` (หรือจนครบ) เพื่อดึงข้อมูลชุดสมบูรณ์มาสร้างไฟล์ ไม่ใช่ส่งออกแค่หน้าปัจจุบัน
  - `exportSelected`: กรองเฉพาะแถวที่ `selectedIds` มีอยู่แล้วดาวน์โหลดทันที
  - ปุ่มส่งออกต้องมี `isLoading={isExporting}` และ `disabled` เมื่อไม่มีข้อมูล

```tsx
import { useCsvExport } from "@/hooks/useCsvExport";
import type { CsvColumn } from "@/lib/export/export-csv";

const csvColumns = useMemo<CsvColumn<MyItemType>[]>(() => [
  { header: t("code"), accessor: (item) => item.code },
  { header: t("name"), accessor: (item) => item.name },
  { header: t("status"), accessor: (item) => resolveStatusLabel(item.status) },
], [t]);

const { exportAll, exportSelected, isExporting } = useCsvExport<MyItemType>({
  filename: "items-export",
  columns: csvColumns,
  data: items,
  selectedIds,
  getId: (item) => item.id,
  fetchAll: async () => {
    const res = await apiClient.listAllItems({ ...listState.params, limit: 1000 });
    return res.items;
  },
});
```

### D. Dialog & Modal State (`useDisclosure`)
ใช้ควบคุมการเปิด/ปิด Drawer, Detail Dialog หรือ Safety Confirmation Modal:
- นำเข้าจาก: `@/hooks/useDisclosure`

```tsx
import { useDisclosure } from "@/hooks/useDisclosure";

const deleteModal = useDisclosure();
const [targetItem, setTargetItem] = useState<MyItemType | null>(null);

const handleOpenDelete = (item: MyItemType) => {
  setTargetItem(item);
  deleteModal.open();
};
```

---

## 🛡️ 3. Safety Confirmation Modal Standards

ทุกการดำเนินการที่มีผลกระทบสูง (เช่น การลบ Delete, การยกเลิก Void/Cancel, หรือการเปลี่ยนสถานะปิดใช้งาน Deactivate):
1. **ต้องมี Confirmation Modal เสมอ** (ห้ามยิงคำสั่งลบโดยตรงเด็ดขาด)
2. **Double Submit Protection:** ปุ่มยืนยันใน Modal ต้องมี `isLoading` และถูก Disable ทันทีขณะส่งคำขอ
3. ใช้คอมโพเนนต์กลาง `ConfirmationModal` จาก `@/components/ui/ConfirmationModal`

```tsx
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

<ConfirmationModal
  isOpen={deleteModal.isOpen}
  onClose={deleteModal.close}
  onConfirm={async () => {
    if (!targetItem) return;
    await executeDelete(targetItem.id);
    deleteModal.close();
  }}
  title={t("deleteTitle")}
  message={t("deleteConfirmationMessage", { name: targetItem?.name })}
  confirmText={tCommon("actions.delete")}
  cancelText={tCommon("actions.cancel")}
  variant="danger"
  isLoading={isDeleting}
/>
```

---

## 🎨 4. Design System Standards (Atelier Architectural Navy Sharp)

ทุกหน้าตารางรายการใน tan-erp ต้องปฏิบัติตามมาตรฐานการออกแบบ *Atelier Architectural Navy Sharp*:

1. **Strict Zero-Radius:** `border-radius: 0px !important`
   - ตาราง, ปุ่ม, ชิปตัวกรอง, อินพุต, แบดจ์, โมดอล และดรอปดาวน์ **ต้องมีขอบเหลี่ยมคมชัด** ไม่มีความโค้งมน
2. **Solid Navy Accent:** `#0B3056`
   - ใช้เป็นสีหลักของ Header, แถว Active/Hover, Focus Ring, และ Action Toolbar
3. **Sticky Action Column:**
   - คอลัมน์การดำเนินการ (ปุ่มแก้ไข/ดูรายละเอียด/ลบ) ด้านขวาสุด ต้องเปิดใช้งาน `stickyActionColumn={true}` บน `<DataTable />` เสมอ เพื่อให้ผู้ใช้กดใช้งานได้สะดวกแม้เลื่อนดูตารางในหน้าจอแนวนอนที่มีหลายคอลัมน์
4. **Dense High-Contrast Grid:**
   - เส้นขอบตารางใช้ `border-erp-border` (`#E2E8F0` / Dark `#1E293B`)
   - ตัวอักษรคมชัด สอดคล้องกับเกณฑ์ WCAG AA คอนทราสต์ไม่ต่ำกว่า 4.5:1
5. **Pure SVG Icons Only:**
   - ใช้ SVG Stroke จาก `@/components/common/Icons` (`strokeWidth={1.5}` หรือ `2px`)
   - ห้ามใช้ icon library ภายนอกหรือโหลดจาก CDN
6. **Standardized Button Sizes (design.md 4.4):**
   - ปุ่มหลักบน PageHeader: ต้องใช้ `<Button size="md" />` ($44\text{px}$) เท่านั้น ห้ามใช้ `<Link>` หรือ `<button>` แต่งคลาสเอง
   - ปุ่มในแถบ ListToolbar (เช่น ปุ่ม Export CSV): ใช้ `<Button size="sm" variant="outline" />` ($36\text{px}$) ห้าม override ด้วย `min-h-[40px]` หรือ `h-10`
   - ปุ่มใน BulkActionToolbar: ใช้ขนาดมาตรฐานที่สอดคล้องกัน

---

## 🧩 5. Complete Implementation Reference (Standard List Example)

โครงสร้างคอมโพเนนต์ List สมบูรณ์แบบที่เป็นแม่แบบอ้างอิง:

```tsx
"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { ListSearchInput } from "@/components/ui/ListSearchInput";
import { ListFilterSelect } from "@/components/ui/ListFilterSelect";
import { ActiveFilterChips } from "@/components/ui/ActiveFilterChips";
import { TableEntityCell } from "@/components/ui/TableEntityCell";
import { TableAction, TableActionGroup } from "@/components/ui/TableAction";
import { BulkActionToolbar, BulkActionButton } from "@/components/ui/BulkActionToolbar";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { IconPlus, IconDownload, IconTrash, IconEye } from "@/components/common/Icons";
import { useListState } from "@/hooks/useListState";
import { useRowSelection } from "@/hooks/useRowSelection";
import { useCsvExport } from "@/hooks/useCsvExport";
import { useDisclosure } from "@/hooks/useDisclosure";
import { can } from "@/lib/permissions/can";
import { useSelectedMembership } from "@/lib/membership/selected-membership-context";

export function StandardItemListView() {
  const t = useTranslations("items");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { selectedMembership } = useSelectedMembership();

  // 1. URL-Synced List State
  const listState = useListState({
    defaultLimit: 20,
    defaultSort: "createdAt",
    defaultOrder: "desc",
  });

  // 2. Data Fetching via TanStack Query
  const { data, isLoading, isError, error, refetch } = useItemQuery({
    ...listState.params,
  });

  const items = data?.items ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = Math.ceil(totalItems / listState.params.limit);
  const isZeroItems = !isLoading && !isError && totalItems === 0 && !listState.params.search;

  // 3. Selection & CSV Export
  const { selectedIds, selectedCount, toggleSelection, selectAll, clearSelection } = useRowSelection();
  const { exportAll, exportSelected, isExporting } = useCsvExport({
    filename: "items",
    columns: csvColumns,
    data: items,
    selectedIds,
    getId: (i) => i.id,
    fetchAll: fetchAllUnpaginatedItems,
  });

  // 4. Modal State
  const deleteModal = useDisclosure();

  // 5. Columns Definition
  const columns = useMemo<Column<ItemType>[]>(() => [
    {
      id: "details",
      header: tCommon("fields.name"),
      sortable: true,
      accessorKey: "name",
      cell: (_v, item) => (
        <TableEntityCell
          title={item.name}
          code={item.code}
          href={`/${locale}/items/${item.id}`}
        />
      ),
    },
    {
      id: "actions",
      header: tCommon("table.actions"),
      className: "w-[120px] text-right",
      cell: (_v, item) => (
        <TableActionGroup align="right">
          <TableAction
            icon={<IconEye size={15} />}
            label={tCommon("actions.view")}
            onClick={() => router.push(`/${locale}/items/${item.id}`)}
          />
          <TableAction
            icon={<IconTrash size={15} />}
            label={tCommon("actions.delete")}
            variant="danger"
            onClick={() => deleteModal.open()}
          />
        </TableActionGroup>
      ),
    },
  ], [locale, router, tCommon, deleteModal]);

  return (
    <div className="space-y-6">
      {/* 2-Tier Architectural Header */}
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        badge={totalItems > 0 ? `${totalItems} รายการ` : undefined}
        action={
          <Button
            variant="primary"
            icon={<IconPlus size={16} />}
            onClick={() => router.push(`/${locale}/items/create`)}
          >
            {t("createItem")}
          </Button>
        }
      />

      {/* List Toolbar */}
      <ListToolbar
        activeFilters={
          <ActiveFilterChips
            filters={activeChips}
            onRemove={handleRemoveChip}
            onClear={listState.actions.clearFilters}
          />
        }
      >
        <div className="flex flex-wrap items-end gap-3">
          <ListSearchInput
            value={listState.draftSearch}
            isDebouncing={listState.isDebouncing}
            placeholder={t("searchPlaceholder")}
            onChange={(v) => listState.actions.setSearch(v)}
            onClear={() => listState.actions.setSearch("", true)}
            onSubmit={(v) => listState.actions.setSearch(v, true)}
          />
          <ListFilterSelect
            label={t("statusLabel")}
            value={listState.params.filters.status || ""}
            onChange={(v) => listState.actions.setFilter("status", v || undefined)}
            options={statusOptions}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<IconDownload size={15} />}
          isLoading={isExporting}
          disabled={totalItems === 0}
          onClick={exportAll}
        >
          {t("exportCsv")}
        </Button>
      </ListToolbar>

      {/* Main Content Area (Table-Preserved Architecture) */}
      {isZeroItems ? (
        <EmptyState
          icon="empty"
          title={t("emptyTitle")}
          description={t("emptyDetail")}
          actionLabel={t("createItem")}
          onAction={() => router.push(`/${locale}/items/create`)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable<ItemType>
            columns={columns}
            data={items}
            isLoading={isLoading}
            isError={isError}
            error={isError ? error?.message : null}
            onRetry={() => refetch()}
            emptyTitle={tCommon("table.noData")}
            emptyDescription={t("searchPlaceholder")}
            selectable={true}
            selectedIds={selectedIds}
            onSelect={toggleSelection}
            onSelectAll={selectAll}
            sorting={{
              key: listState.params.sort || null,
              order: listState.params.order,
            }}
            onSort={(k) => listState.actions.setSort(k)}
            pagination={{
              page: listState.params.page,
              limit: listState.params.limit,
              totalPages,
              totalItems,
            }}
            onPageChange={(p) => listState.actions.setPage(p)}
            onLimitChange={(l) => listState.actions.setLimit(l)}
            stickyActionColumn={true}
          />

          {/* Floating Bulk Actions */}
          <BulkActionToolbar selectedCount={selectedCount} onClear={clearSelection}>
            <BulkActionButton
              icon={<IconDownload size={15} />}
              label={t("exportSelected", { count: selectedCount })}
              onClick={exportSelected}
            />
          </BulkActionToolbar>
        </div>
      )}

      {/* Safety Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleConfirmDelete}
        title={t("confirmDeleteTitle")}
        message={t("confirmDeleteMessage")}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
```

---

## 📋 6. Definition of Done (DoD) & Verification Checklist

ก่อนสรุปว่าหน้าตารางรายการเสร็จสมบูรณ์ ต้องตรวจสอบและผ่านเกณฑ์ต่อไปนี้ทุกข้อ:

- [ ] **Strict TypeScript:** ไม่มี `any`, `as any` หรือ `@ts-ignore` (Type-safe 100%)
- [ ] **Table-Preserved Architecture:** ไม่ตัดสลับ `<DataTable />` ออกเมื่อเกิด Error หรือ Filter ว่าง (Header ยังตรึงอยู่กับที่)
- [ ] **URL Sync:** ค้นหา, กรอง, จัดเรียง หรือเปลี่ยนหน้าแล้วพารามิเตอร์ขึ้นใน URL อย่างถูกต้อง สามารถแชร์ลิงก์ได้
- [ ] **Dual-Language i18n:** ข้อความทั้งหมดดึงจาก `messages/th.json` และ `messages/en.json` ครบทั้ง 2 ภาษา
- [ ] **Double-Submit Protection:** ทุกปุ่ม Action ที่มีการยิง Request (เช่น Export CSV, Delete Confirmation) มี `isLoading` และ `disabled`
- [ ] **Visual Theme:** ขอบเหลี่ยมคมชัด `border-radius: 0px !important`, สี Solid Navy `#0B3056`, ไอคอน SVG Stroke แท้
- [ ] **Testing Verification:**
  - ผ่าน Unit Tests: `npm test`
  - ผ่าน Type Check: `npx tsc --noEmit`
  - ผ่าน Lint: `npm run lint`
  - ผ่าน Build: `npm run build`
