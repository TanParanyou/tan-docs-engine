# 1. ขอบเขตความต้องการระบบ (Requirement Confirmation)

เอกสารฉบับนี้จัดทำขึ้นเพื่อยืนยันข้อตกลงและขอบเขตการพัฒนาระบบกระเป๋าเงินอิเล็กทรอนิกส์ (E-Wallet Platform) ระหว่างทีมสถาปัตยกรรมระบบและผู้มีส่วนได้ส่วนเสียทุกฝ่าย

## 1.1 สรุปภาพรวมและวัตถุประสงค์ (Executive Summary)
ระบบ E-Wallet มุ่งเน้นการให้บริการธุรกรรมทางการเงินที่มีความปลอดภัยสูงระดับ Bank-Grade รองรับการเติมเงิน โอนเงิน ชำระบิล และการเชื่อมต่อพร้อมเพย์ (PromptPay QR Code) แบบเรียลไทม์

> **ข้อกำหนดสำคัญด้านความปลอดภัย:**  
> ระบบต้องปฏิบัติตามมาตรฐาน PCI-DSS Level 1 และข้อบังคับของธนาคารแห่งประเทศไทย (BOT) ข้อมูลที่มีความสำคัญสูงต้องได้รับการเข้ารหัสผ่าน HSM (Hardware Security Module) ทั้งในระหว่างการส่ง (In-Transit) และการจัดเก็บ (At-Rest)

---

## 1.2 รายการฟังก์ชันและการตรวจสอบขอบเขตงาน (Scope Checklist)

รายการฟังก์ชันที่ได้รับการยืนยันและจัดทำเรียบร้อยแล้ว:

* [x] **การลงทะเบียนและยืนยันตัวตน (e-KYC)**: รองรับการสแกนบัตรประชาชน (OCR) และตรวจสอบใบหน้า (Liveness Detection)
* [x] **ระบบบัญชีแยกกระเป๋า (Multi-wallet Ledger)**: รองรับ Double-entry bookkeeping สำหรับบันทึกธุรกรรมแบบไม่มีข้อผิดพลาด
* [x] **PromptPay Integration**: ระบบสร้างและสแกน Dynamic QR Code มาตรฐาน EMVCo
* [ ] **Merchant Settlement Module**: ระบบตัดรอบชำระเงินร้านค้าแบบอัตโนมัติ (Automated Clearing House)
* [ ] **Biometric Payment Approval**: การยืนยันการทำรายการด้วย FaceID / TouchID

---

## 1.3 ตารางยืนยันความต้องการทางฟังก์ชัน (Functional Requirements Matrix)

| รหัสข้อกำหนด | โมดูลระบบ | รายละเอียดความต้องการ | ระดับความสำคัญ | สถานะการยืนยัน |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-WLT-01** | Account & KYC | ระบบลงทะเบียนและผูกเบอร์โทรศัพท์ด้วย OTP ภายใน 30 วินาที | Critical | Approved |
| **REQ-WLT-02** | Transaction | การทำรายการโอนเงินระหว่างกระเป๋าต้องเสร็จสิ้นภายใน 1.5 วินาที | High | Approved |
| **REQ-WLT-03** | Core Ledger | บันทึกบัญชีแยกประเภทแบบ Double Entry ห้ามแก้ไขข้อมูลย้อนหลัง | Critical | Approved |
| **REQ-WLT-04** | Top-Up Engine | รองรับการเติมเงินผ่าน PromptPay, Debit/Credit Card และ Direct Debit | High | In Progress |
| **REQ-WLT-05** | Audit & Log | จัดเก็บ Audit Trails ที่ป้องกันการแก้ไข (Tamper-proof Log) นาน 10 ปี | Compliance | Approved |

<!-- pagebreak -->
