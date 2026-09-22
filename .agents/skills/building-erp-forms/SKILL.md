---
name: building-erp-forms
description: คู่มือและมาตรฐานการสร้างหรือแก้ไขหน้าฟอร์ม ERP (Create/Edit/View Forms) สำหรับโปรเจกต์ tan-erp ครอบคลุม Single Dynamic Route [id], Drawer-based workflows, React Hook Form Controller, TanStack Query, Zod validation, Deferred Upload, Loading States, Safety Confirmation Modals และ Atelier Architectural Navy Sharp Design System
---

# Building ERP Forms (tan-erp Frontend Standards)

## 🎯 Overview
เมื่อต้องพัฒนา หรือปรับปรุงแก้ไขหน้าฟอร์มในระบบ **tan-erp** (เช่น ข้อมูลลูกค้า, โครงการ, ใบเสนอราคา, การสั่งซื้อ, ผู้ใช้งาน หรือการตั้งค่า) ต้องปฏิบัติตามมาตรฐานนี้อย่างเคร่งครัด เพื่อให้สถาปัตยกรรม โครงสร้างโค้ด และประสบการณ์ผู้ใช้ (UX/UI) เป็นไปในทิศทางเดียวกัน สอดคล้องกับแนวคิด **Atelier Architectural Navy Sharp**

---

## 🏗️ 1. File Structure & Colocation (โครงสร้างไฟล์)

ใน `tan-erp` เราจัดโครงสร้างตาม **Business Features** (`src/features/<feature>/`) ควบคู่กับ Next.js App Router:

- **Full-page Route Pattern:**
  `src/app/[locale]/(erp)/[feature]/[id]/page.tsx`
- **Feature Colocation Rules:**
  - Logic ของฟอร์ม, DTOs, Zod schemas, และ Sub-components ต้องอยู่ภายในโฟลเดอร์ `src/features/<feature>/`
  - คอมโพเนนต์ UI พื้นฐาน (เช่น Button, Input, Modal) ให้ดึงจาก `src/components/ui/`
  - **โครงสร้างไฟล์ตัวอย่าง:**
    ```text
    frontend/src/
    ├── app/[locale]/(erp)/customers/
    │   ├── [id]/
    │   │   └── page.tsx                 # Dynamic Route รับทั้ง "create" และ ID จริง
    │   └── page.tsx                     # หน้าตารางรายการหลัก (DataTable)
    └── features/customers/
        ├── api/                         # TanStack Query hooks & query keys
        │   ├── useCustomer.ts
        │   └── useCustomerMutations.ts
        ├── components/
        │   ├── CustomerEditor.tsx       # คอมโพเนนต์หลักรวม Logic ฟอร์ม (ทั้ง Create และ Edit)
        │   ├── CustomerDrawer.tsx       # Quick edit/view drawer
        │   └── CustomerFormFields.tsx   # ฟิลด์อินพุตของฟอร์ม
        ├── schemas/
        │   └── customerSchema.ts        # Zod validation schema
        └── index.ts                     # Public exports ของ Feature
    ```

---

## 🛠️ 2. Form State & Management (การจัดการ State)

### A. Dual-Mode Resolution & PermissionGuard (`[id]/page.tsx`)
ในระดับ Dynamic Route Page (`src/app/[locale]/(erp)/[feature]/[id]/page.tsx`) ต้องใช้คอมโพเนนต์กลาง `<PermissionGuard>` จาก `@/components/auth` ครอบทั้งโหมด Create และ Detail/Edit เพื่อให้การตรวจสอบสิทธิ์สอดคล้องกันทั่วทั้งระบบ:

```tsx
"use client";

import React, { use } from "react";
import { notFound } from "next/navigation";
import { isSupportedLocale } from "@/lib/i18n/locales";
import { CustomerEditor } from "@/features/customers/components/customer-editor";
import { CustomerDetail } from "@/features/customers/components/customer-detail";
import { PermissionGuard } from "@/components/auth";
import { PERMISSIONS } from "@/lib/permissions/permissions";
import { useTranslations } from "next-intl";

interface DynamicPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function EntityDynamicPage({ params }: DynamicPageProps) {
  const { locale, id } = use(params);

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const t = useTranslations("customers");
  const isCreateMode = id === "create" || id === "add";

  if (isCreateMode) {
    return (
      <PermissionGuard
        permission={PERMISSIONS.CUSTOMERS_CREATE}
        title={t("errors.accessDeniedTitle")}
        detail={t("errors.createAccessDeniedDetail")}
      >
        <CustomerEditor />
      </PermissionGuard>
    );
  }

  // Detail / Edit mode
  return (
    <PermissionGuard
      permission={PERMISSIONS.CUSTOMERS_READ}
      title={t("errors.accessDeniedTitle")}
      detail={t("errors.readAccessDeniedDetail")}
    >
      <CustomerDetail customerId={id} />
    </PermissionGuard>
  );
}
```

- **ห้ามเขียนกล่องเตือน Access Denied (`role="alert"`) หรือเรียกฟังก์ชัน `can(...)` แบบ manual ซ้ำซ้อนในหน้าระดับ Page:** ให้ครอบด้วย `<PermissionGuard>` เสมอ
- **ใช้ Permission Constants:** ใช้ค่าจาก `PERMISSIONS.*` จาก `@/lib/permissions/permissions` แทนการใช้ String ดิบ
- **รองรับ Multi-Permission:** หากต้องการสิทธิ์มากกว่าหนึ่ง สามารถส่ง Array เช่น `permission={[PERMISSIONS.CUSTOMERS_CREATE, PERMISSIONS.CUSTOMER_CONTACTS_MANAGE]}` และกำหนด `requireAll={true}` ได้


### B. React Hook Form & Controller
- **Controller Binding Focus (ครอบด้วย `<Controller>`):**
  - คอมโพเนนต์อินพุตทั้งหมด โดยเฉพาะ Custom UI Components (เช่น Custom Select, MultiLangInput, ImageUpload) **ต้องถูกครอบด้วย `<Controller>` จาก `react-hook-form` เสมอ**
  - ผูกค่าผ่าน `field.value` และ `field.onChange` ในฟังก์ชัน `render` เพื่อความเสถียรในการผูก State และป้องกันปัญหา Uncontrolled Input
- **Zod Schema Validation:**
  - ใช้ `zod` ร่วมกับ `@hookform/resolvers/zod`
  - ข้อความแจ้งเตือน Error ของการ Validate รองรับ 2 ภาษา (`th` เป็นค่าเริ่มต้น และ `en`) โดยดึงจาก `messages/`
- **FormProvider:** ครอบฟอร์มทั้งหมดด้วย `<FormProvider {...methods}>` เพื่อให้ Sub-components ดึง Form Context ได้โดยตรง ไม่ต้องทำ Prop Drilling
- **Dirty State Indicator:** ตรวจสอบ `methods.formState.isDirty` เพื่อแสดงข้อความเตือนเมื่อมีข้อมูลที่ยังไม่ได้บันทึก (`"คุณมีข้อมูลที่ยังไม่ได้บันทึก"`)
- **Double Submit Protection:** ปุ่ม บันทึก/Submit **ต้อง** ถูกปิดใช้งานและแสดงสถานะ Loading (`isLoading={isSubmitting}`) ขณะยิง API เพื่อป้องกันการส่งข้อมูลซ้ำ

---

## 🎨 3. Design System Standards (Atelier Architectural Navy Sharp)

ทุกฟอร์มในระบบ ERP ต้องยึดมั่นใน Design Tokens และ UI constraints ของโปรเจกต์อย่างเข้มงวด:

- **Border Radius:** `border-radius: 0px !important` (เหลี่ยม คมชัด ตามแบบสถาปัตยกรรมระดับองค์กร)
- **สีหลัก (Primary Color):** Solid Navy `#0B3056` สำหรับ Header, Primary Buttons, Active Tabs และ Focus Rings
- **Icons:** Pure SVG Stroke Icons (`strokeWidth={1.5}` หรือ `2px`) ห้ามใช้ Icon pack ภายนอกหรือ CDN
- **Form Sections / Cards:** จัดกลุ่มฟิลด์ในฟอร์มด้วย `<FormSection title={...}>` เสมอ ห้ามเขียนโครงสร้างการ์ด `.erp-card` และหัวข้อ `h2` ดิบซ้ำซ้อน
- **Error & Status Banners:** การแสดงข้อความผิดพลาดระดับฟอร์ม (`errorBanner`) หรือคำเตือนสถานะ ให้ใช้คอมโพเนนต์ `<Alert variant="danger" | "warning" | "success" | "info">` เสมอ
- **Spacing & Contrast:** ความสูงสัมผัสขั้นต่ำ 44px สำหรับ Touch targets, อัตราส่วนคอนทราสต์ที่ผ่านเกณฑ์ WCAG AA
- **Minimal Mono Loading:** ในขณะดึงข้อมูลเดิมในโหมด Edit ให้แสดง Minimal Loading Indicator ในคอนเทนเนอร์ (ไม่ใช้ Skeleton loader ที่กระพริบหลอกตา)

---

## 🔗 4. API & Deferred File Upload

### A. TanStack Query Integration
- **Server Data:** ดึงข้อมูลเดิมด้วย TanStack Query (`useQuery`) โดยมี Query Key ที่ชัดเจน
- **Form Population:** เมื่อดึงข้อมูล Edit สำเร็จ ให้เรียก `methods.reset(data)`
- **Cache Invalidation:** เมื่อบันทึกสำเร็จ ให้ Invalidate Query Key ที่เกี่ยวข้อง เพื่อให้ตารางหรือหน้าอื่นๆ ดึงข้อมูลใหม่

### B. Deferred Upload Flow (อัปโหลดจริงตอนกดเซฟเท่านั้น)
เพื่อป้องกันไฟล์ขยะค้างในระบบ Storage เมื่อผู้ใช้กดยกเลิก:
1. เมื่อผู้ใช้เลือกไฟล์ (เช่น เอกสารแนบ, สลิป หรือรูปถ่ายหน้างาน): ให้เก็บออบเจกต์ `File` ไว้ใน Local/Form State และแสดง Local Preview
2. **ห้ามอัปโหลดทันทีที่เลือกไฟล์**
3. เมื่อผู้ใช้กดปุ่ม "บันทึก" (ใน `onSubmit`):
   - ทำการอัปโหลดไฟล์จริงไปยัง Storage Endpoint ก่อน
   - ได้ URL หรือ Document ID กลับมา
   - ผสาน URL/ID นั้นเข้ากับ Payload หลัก
   - ยิง API บันทึกข้อมูลธุรกิจ

---

## 📍 5. Address & Geographic Area Standards (มาตรฐานการจัดการที่อยู่)

เมื่อฟอร์มใดๆ ในระบบ ERP ต้องมีการกรอกที่อยู่ (เช่น สถานที่ตั้งหน้างาน Site, ที่อยู่ลูกค้า Customer, หรือสาขา Branch) ต้องปฏิบัติตามมาตรฐานนี้:

### A. Centralized Area Component (`AddressAreaField`)
- **ห้ามสร้าง Input Free-text แยก 4 ช่อง (ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์) เด็ดขาด:** เพื่อป้องกันข้อผิดพลาดจากการสะกดคำ และป้องกันความรกของหน้าจอ
- **ใช้คอมโพเนนต์กลาง:** นำเข้า `<AddressAreaField />` จาก `@/components/forms`
  - **ก่อนเลือก:** แสดงช่องค้นหาด่วน `AddressAutocomplete` ที่ค้นหาได้ทั้งรหัสไปรษณีย์ 5 หลักและชื่อตำบล
  - **หลังเลือก:** เปลี่ยนเป็น **Selected Location Summary Card** คม เหลี่ยม ไร้ขอบมน ความสูงมาตรฐาน 44px (`min-h-[44px]`) พร้อมปุ่ม "เปลี่ยนที่อยู่"

### B. Height Uniformity & Touch Target (ความสูงช่องอินพุตเท่ากัน 44px)
- อินพุตและ Summary Card ทุกตัวต้องยึดมาตรฐานความสูง `--erp-min-touch` (44px) สอดคล้องกับ `.erp-input` ใน `erp-theme.css`
- ป้องกันการใช้ custom `py-2` หรือ padding ดิบที่ทำให้ความสูงของช่องค้นหา/การ์ดเหลื่อมล้ำกับช่องกรอกทั่วไป (`Input`, `Select`)

### C. Snapshot Immutability Principle
- แม้ระบบจะมี Geographic Master Data แต่เมื่อบันทึกลงใน Entity ของฟอร์ม (เช่น `crm.sites` หรือ `crm.customers`) **ต้องบันทึกเป็น Snapshot Values (String)** เสมอ เพื่อรักษาความถูกต้องของหลักฐานทางกฎหมายและ Audit Trail ย้อนหลัง

---

## 🚪 6. Drawer-Based Workflows vs Full Page (`[id]`)

- **ใช้ Drawer:** สำหรับฟอร์มขนาดเล็ก-ปานกลาง, Quick Action หรือการดูรายละเอียดด่วน เพื่อรักษา Context ของตารางหลักไว้
- **ใช้ Full Page (`[id]`):** สำหรับฟอร์มที่มีฟิลด์จำนวนมาก มีหลายหมวดหมู่/หลายแท็บ หรือต้องการพื้นที่ตารางรายการย่อย (Master-Detail)

### Drawer Safety & Loading
- **Unsaved Changes Guard:** เมื่อผู้ใช้ปิด Drawer หาก `formState.isDirty === true` ต้องแสดง Confirmation Modal ยืนยันก่อนปิด เพื่อป้องกันข้อมูลสูญหาย
- **Action Buttons:** มีสถานะ `isLoading` ล็อกปุ่มเสมอขณะประมวลผล

---

## 🛡️ 7. Dangerous Actions & Safety Confirmation Modals

- **การกระทำอันตราย:** การลบข้อมูล (Delete), การยกเลิกเอกสาร (Void/Cancel) หรือการแก้ไขข้อมูลสำคัญ (Critical Edit) **ต้องมี Confirmation Modal ยืนยันก่อนดำเนินการเสมอ**
- **Loading State บนปุ่มยืนยัน:** ปุ่มกดยืนยันใน Modal (เช่น ปุ่ม "ยืนยันการลบ") **ต้องมีสถานะ `isLoading={isDeleting}` เสมอ** เพื่อล็อกปุ่มไม่ให้ผู้ใช้กดซ้ำขณะระบบกำลังประมวลผล
- **Permission Guard:** ซ่อนหรือล็อกปุ่มตามสิทธิ์ของผู้ใช้ (เช่น `PermissionGuard` หรือ `can('customers', 'delete')`) โดย Backend ต้องตรวจสิทธิ์ซ้ำเสมอ

---

## 📑 8. Tabbed Form Architecture & Error Navigation (`FormTabs` & `useFormTabErrors`)

เมื่อหน้าฟอร์มมีฟิลด์จำนวนมาก (หลายสิบฟิลด์) หรือต้องการลดการเลื่อนหน้าจอ (Zero-Scroll Form) ให้จัดกลุ่มเป็น **Tabbed Form** โดยใช้คอมโพเนนต์กลาง `<FormTabs />` และ Hook `useFormTabErrors` จาก `@/components/forms`:

### A. กฎเหล็ก 4 ประการของ Tabbed Forms
1. **Error Indicator บนหัวแท็บ (Red Dot Badge):**
   - หากมีฟิลด์ใดในแท็บนั้นที่กรอกไม่ผ่านการ validate ให้แสดงจุดเตือนสีแดง (`bg-erp-danger animate-pulse`) บนปุ่มหัวแท็บทันที เพื่อให้ผู้ใช้ทราบว่ามีข้อผิดพลาดอยู่ในแท็บใด
2. **Auto-Switch ไปแท็บที่มี Error:**
   - เมื่อผู้ใช้กดปุ่ม Submit ขณะที่กำลังอยู่แท็บอื่น แต่มีฟิลด์บังคับในแท็บก่อนหน้าที่ยังไม่ผ่าน ระบบต้องสลับแท็บกลับไปยังแท็บแรกที่มี Error ทันทีโดยอัตโนมัติ (ผ่าน `handleSubmit(onSubmit, handleFormError)`)
3. **อิสระในการคลิกสลับแท็บ (Unrestricted Tab Switching):**
   - ผู้ใช้ต้องสามารถคลิกสลับแท็บไปมาเพื่อดูหรือกรอกข้อมูลส่วนใดก่อนก็ได้ **ห้ามบล็อกหรือบังคับลำดับ (No Forced Wizard)**
4. **DOM Preservation (CSS `hidden` แทนการ Unmount):**
   - **ห้ามใช้เงื่อนไข `{activeTab === "..." && <Section />}` ที่ทำการ Unmount DOM เด็ดขาด** เพราะจะทำให้ React Hook Form เสียการลงทะเบียนของ Input (`input unregistration`)
   - **ให้ใช้การสลับ Class `hidden` เสมอ:** เช่น `className={cn("flex flex-col gap-6", activeTab !== "tabId" && "hidden")}` พร้อมกำหนด Accessibility `role="tabpanel"` และ `aria-labelledby="tab-id"`

### B. โค้ดตัวอย่างการใช้งาน `FormTabs` และ `useFormTabErrors`
```tsx
import { FormTabs, useFormTabErrors } from "@/components/forms";

type FormTab = "general" | "pricing";
const [activeTab, setActiveTab] = useState<FormTab>("general");

const { tabErrorMap, handleFormError } = useFormTabErrors<FormTab, MyFormValues>({
  tabFieldsMap: {
    general: ["code", "name", "category"],
    pricing: ["costPrice", "sellingPrice", "currency"],
  },
  errors: methods.formState.errors,
  setActiveTab,
});

return (
  <form onSubmit={handleSubmit(onSubmit, handleFormError)} noValidate>
    <FormTabs<FormTab>
      activeTab={activeTab}
      onChange={setActiveTab}
      ariaLabel="หมวดหมู่ฟอร์ม"
      tabs={[
        { id: "general", label: "ข้อมูลทั่วไป", hasError: tabErrorMap.general },
        { id: "pricing", label: "ราคาและการค้า", hasError: tabErrorMap.pricing },
      ]}
    />

    <div role="tabpanel" id="tabpanel-general" aria-labelledby="tab-general" className={cn(activeTab !== "general" && "hidden")}>
      {/* General fields */}
    </div>
    <div role="tabpanel" id="tabpanel-pricing" aria-labelledby="tab-pricing" className={cn(activeTab !== "pricing" && "hidden")}>
      {/* Pricing fields */}
    </div>
  </form>
);
```

---

## 📝 โค้ดตัวอย่างโครงสร้างฟอร์ม ERP (`CustomerEditor.tsx`)

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

// 1. Types & Schemas
import type { CustomerFormData, CustomerDetail } from "@/features/customers/types";
import { customerSchema } from "@/features/customers/schemas/customerSchema";

// 2. UI Components (Atelier Architectural Navy Sharp: border-radius 0px, Solid Navy #0B3056)
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PageLoading } from "@/components/ui/PageLoading";
import { useToast } from "@/hooks/useToast";

// 3. API & Query Hooks
import { useCustomer, useCustomerMutations } from "@/features/customers/api";

export function CustomerEditor({ id }: { id?: string }) {
  const t = useTranslations("Customers");
  const common = useTranslations("Common");
  const { showToast } = useToast();

  const isEdit = !!id && id !== "create";
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Safety Confirmation Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // TanStack Query for Data Fetching & Mutations
  const { data: customer, isLoading: isLoadingData } = useCustomer(id, { enabled: isEdit });
  const { createCustomer, updateCustomer, deleteCustomer, isSaving, isDeleting } = useCustomerMutations();

  const methods = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      code: "",
      name: "",
      tax_id: "",
      notes: "",
    },
  });

  const { control, handleSubmit, reset, formState: { isDirty, isSubmitting } } = methods;

  // Populate data in Edit mode
  useEffect(() => {
    if (customer) {
      reset(customer);
    }
  }, [customer, reset]);

  // Deferred Upload on Submit
  const onSubmit = async (values: CustomerFormData) => {
    try {
      let attachmentUrl = values.attachment_url;

      if (selectedFile) {
        // Upload deferred file here before saving entity
        attachmentUrl = await uploadDocument(selectedFile);
      }

      const payload = { ...values, attachment_url: attachmentUrl };

      if (isEdit && id) {
        await updateCustomer.mutateAsync({ id, data: payload });
        showToast(common("update_success"), "success");
      } else {
        await createCustomer.mutateAsync(payload);
        showToast(common("create_success"), "success");
      }
    } catch (error: any) {
      showToast(error.message || common("operation_failed"), "error");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteCustomer.mutateAsync(id);
      showToast(common("delete_success"), "success");
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      showToast(error.message || common("delete_failed"), "error");
    }
  };

  if (isLoadingData) {
    return <PageLoading />;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="min-h-[calc(100vh-8rem)] flex flex-col justify-between">
        <div className="space-y-6">
          <div className="border-b border-[#0B3056]/20 pb-4">
            <h1 className="text-xl font-bold text-[#0B3056]">
              {isEdit ? t("edit_title") : t("create_title")}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={control}
              name="code"
              render={({ field, fieldState }) => (
                <Input
                  label={t("fields.code")}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  label={t("fields.name")}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  required
                />
              )}
            />
          </div>
        </div>

        {/* Sticky Action Bar with Atelier Architectural styling (Aligned with main container padding) */}
        <FormActionBar
          isDirty={isDirty}
          isLoading={isSubmitting || isSaving}
          isEditMode={isEdit}
          onCancel={() => router.push(`/${locale}/customers`)}
          extraActions={
            isEdit && (
              <Button
                type="button"
                variant="danger"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isSubmitting || isSaving}
              >
                {common("delete")}
              </Button>
            )
          }
        />
      </form>

      {/* Safety Confirmation Modal with mandatory Loading state */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={t("confirm_delete_title")}
        description={t("confirm_delete_desc")}
      />
    </FormProvider>
  );
}
```
