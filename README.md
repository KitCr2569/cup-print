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

## Production checklist

- เปลี่ยน local storage ใน `src/lib/storage/local.ts` เป็น Cloudflare R2/S3
- ใช้ PostgreSQL managed database และรัน schema ผ่านช่องทางส่วนตัว
- สุ่ม `AUTH_SECRET` อย่างน้อย 32 bytes และตั้งรหัส Admin ใหม่
- ใส่ PromptPay ID ของร้านจริง
- เปิด HTTPS, backup ฐานข้อมูล และ object-storage lifecycle/versioning
- ทดสอบไฟล์พิมพ์กับเครื่องจริงและยืนยัน UV ด้วยแก้วตัวอย่างก่อนรับออเดอร์
