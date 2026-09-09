# Cup Story

เว็บขายแก้วเซรามิกสั่งพิมพ์ลาย พร้อม Fabric.js editor, 3D preview, PostgreSQL orders, PromptPay และ Admin production desk

## เปิดใช้งานในเครื่อง

1. คัดลอก `.env.example` เป็น `.env.local` และเปลี่ยน `ADMIN_PASSWORD`, `AUTH_SECRET`, `PROMPTPAY_ID`
2. เปิด PostgreSQL แล้วสร้างฐานข้อมูล จากนั้นรัน `database/schema.sql`
3. ติดตั้งและเปิดเว็บ

```powershell
npm install
npm run dev
```

- หน้าร้าน: http://localhost:3000
- ออกแบบแก้ว: http://localhost:3000/design
- Admin: http://localhost:3000/admin

## PostgreSQL ด้วย Docker

```powershell
docker compose up -d postgres
```

Schema จะถูกสร้างอัตโนมัติใน container ใหม่จาก `database/schema.sql`

## โมเดลแก้ว

- Runtime GLB: `public/models/mug-11oz.glb`
- Blender source: `assets/blender/mug-11oz.blend`
- สร้าง GLB ใหม่: `npm run generate:mug`
- ตรวจชื่อ mesh/material/UV: `npm run validate:mug`

Mesh หลักคือ `MugBodyPrint`, `MugCeramic`, `MugHandle`

## Cloudflare R2

ไฟล์แบบแก้ว ไฟล์พิมพ์ และสลิปเก็บใน private R2 bucket ผ่าน S3-compatible API

1. เปิด Cloudflare Dashboard → **R2 Object Storage** แล้วสร้าง bucket `cup-print-production`
2. เปิด **Manage R2 API Tokens** แล้วสร้าง token แบบ **Object Read & Write** จำกัดเฉพาะ bucket นี้
3. เพิ่มตัวแปรต่อไปนี้ใน `.env.local` และ Vercel Project Settings → Environment Variables:

```text
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=cup-print-production
```

4. Redeploy บน Vercel หลังเพิ่มตัวแปร ห้าม commit หรือส่งค่า token ผ่านแชต
5. ทดสอบสร้างแบบและตรวจ object ใน `designs/<design-id>/`
6. ทดสอบสร้างออเดอร์ อัปโหลดสลิป และตรวจ object ใน `payments/<order-id>/`
7. ทดสอบ Admin ดาวน์โหลดไฟล์พิมพ์ได้ โดย bucket ไม่ต้องเปิด public access

## Production checklist

- ใช้ PostgreSQL managed database และรัน schema ผ่านช่องทางส่วนตัว
- สุ่ม `AUTH_SECRET` อย่างน้อย 32 bytes และตั้งรหัส Admin ใหม่
- ใส่ PromptPay ID ของร้านจริง
- จำกัด R2 API token เฉพาะ bucket และหมุน token เมื่อสงสัยว่ารั่ว
- เปิด HTTPS, backup ฐานข้อมูล และ object-storage lifecycle/versioning
- ทดสอบไฟล์พิมพ์กับเครื่องจริงและยืนยัน UV ด้วยแก้วตัวอย่างก่อนรับออเดอร์
