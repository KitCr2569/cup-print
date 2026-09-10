"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { parseQuantity } from "@/lib/orders/quantity";

export type ReviewDesign = {
  id: string;
  productId: string;
  name: string;
  description: string;
  priceSatang: number;
  printWidthCm: number;
  printHeightCm: number;
  dpi: number;
  previewUrl: string;
  printOption: string;
  printPlacement: string | null;
};

export default function DesignReview({ design }: { design: ReviewDesign }) {
  const [quantity, setQuantity] = useState(1);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const printLabel=design.printOption==="ONE_SIDE"?`1 ด้าน · ${{FRONT:"ด้านหน้า",LEFT:"ด้านซ้าย",RIGHT:"ด้านขวา"}[design.printPlacement||""]||""}`:design.printOption==="TWO_SIDES"?"2 ด้าน · ซ้าย + ขวา":"รอบแก้ว";
  const subtotalSatang = design.priceSatang * quantity;
  const shippingSatang = subtotalSatang >= 99_900 ? 0 : 6_000;
  const totalSatang = subtotalSatang + shippingSatang;
  const setSafeQuantity = (value: number) => setQuantity(parseQuantity(value));

  return (
    <div className="review-page">
      <header className="designer-nav"><Link href="/" className="brand"><span className="brand-dot">C</span><span>Cup Story</span></Link><div className="steps"><span><b>1</b> เลือกสินค้า</span><i/><span><b>2</b> ออกแบบ</span><i/><span className="active"><b>3</b> ตรวจแบบ</span><i/><span><b>4</b> ชำระเงิน</span></div><Link href={`/design/${design.productId}`} className="ghost-button"><ArrowLeft/> ออกแบบใหม่</Link></header>
      <main className="review-main">
        <section className="review-heading"><div><p className="eyebrow">FINAL ARTWORK REVIEW</p><h1>ตรวจแบบให้มั่นใจ<br/>ก่อนส่งผลิต</h1></div><p>สีบนหน้าจออาจต่างจากงานพิมพ์จริงเล็กน้อย กรุณาตรวจข้อความ ตำแหน่ง และขนาดให้ครบ</p></section>
        <div className="review-grid">
          <section className="review-artwork"><div className="review-artwork-head"><span>แบบของคุณ</span><small>DESIGN #{design.id.slice(0, 8).toUpperCase()}</small></div><div className="review-image-frame"><Image src={design.previewUrl} alt={`แบบพิมพ์ ${design.name}`} fill sizes="(max-width: 900px) 100vw, 60vw" unoptimized/></div><div className="review-specs"><span><small>พื้นที่พิมพ์</small><b>{design.printWidthCm} × {design.printHeightCm} ซม.</b></span><span><small>ความละเอียด</small><b>{design.dpi} DPI</b></span><span><small>รูปแบบ</small><b>{printLabel}</b></span></div></section>
          <aside className="review-summary"><p className="eyebrow">ORDER SUMMARY</p><h2>{design.name}</h2><p>{design.description}</p><div className="review-unit"><span>ราคาต่อชิ้น</span><b>฿{(design.priceSatang / 100).toLocaleString("th-TH")}</b></div><div className="review-quantity"><span>จำนวน</span><div><button type="button" onClick={() => setSafeQuantity(quantity - 1)} aria-label="ลดจำนวน"><Minus/></button><input aria-label="จำนวนสินค้า" type="number" min="1" max="100" value={quantity} onChange={(event) => setSafeQuantity(Number(event.target.value))}/><button type="button" onClick={() => setSafeQuantity(quantity + 1)} aria-label="เพิ่มจำนวน"><Plus/></button></div></div><div className="review-price"><p><span>สินค้า</span><b>฿{(subtotalSatang / 100).toLocaleString("th-TH")}</b></p><p><span>ค่าจัดส่ง</span><b>{shippingSatang ? `฿${shippingSatang / 100}` : "ฟรี"}</b></p><div><span>ยอดรวม</span><strong>฿{(totalSatang / 100).toLocaleString("th-TH")}</strong></div></div><label className="review-confirm"><input type="checkbox" checked={hasConfirmed} onChange={(event) => setHasConfirmed(event.target.checked)}/><span><b><Check/> ตรวจสอบแบบแล้ว</b><small>ยืนยันว่าข้อความ สี ตำแหน่ง และขนาดถูกต้อง</small></span></label><Link id="continue-to-checkout" className={`primary review-continue ${hasConfirmed ? "" : "disabled"}`} aria-disabled={!hasConfirmed} tabIndex={hasConfirmed ? 0 : -1} href={hasConfirmed ? `/checkout?design=${design.id}&quantity=${quantity}` : "#"}>ดำเนินการชำระเงิน <ArrowRight/></Link><Link className="review-edit" href={`/design/${design.productId}`}><ArrowLeft/> กลับไปออกแบบใหม่</Link><div className="review-security"><ShieldCheck/><span><b>ไฟล์งานเก็บอย่างปลอดภัย</b><small>ใช้เฉพาะสำหรับผลิตคำสั่งซื้อของคุณ</small></span></div></aside>
        </div>
      </main>
    </div>
  );
}
