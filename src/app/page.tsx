import Link from "next/link";
import { ArrowRight, Box, Check, Clock3, Shirt, Sparkles } from "lucide-react";
import { listPublicProducts } from "@/lib/catalog/product-repository";

const PRODUCT_ICONS = { MUG_3D: Box, APPAREL_2D: Shirt } as const;
export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await listPublicProducts();
  return (
    <main>
      <header className="nav shell">
        <Link href="/" className="brand"><span className="brand-dot">C</span><span>CupCraft</span></Link>
        <nav><a href="#products">เลือกสินค้า</a><a href="#how-it-works">วิธีสั่งซื้อ</a><a href="#about">เกี่ยวกับเรา</a></nav>
        <a className="ghost-button" href="#products">เริ่มออกแบบ <ArrowRight size={16}/></a>
      </header>

      <section className="hero shell">
        <div className="hero-copy"><p className="eyebrow"><Sparkles size={15}/> MADE BY YOU</p><h1>เลือกสินค้า<br/>แล้วสร้าง <em>ลายคุณ</em></h1><p className="hero-sub">เลือกชิ้นงานที่ชอบ ไปหน้าออกแบบทันที และดู Live Preview ก่อนตรวจแบบและชำระเงิน</p><div className="hero-actions"><a className="primary" href="#products">เลือกสินค้าเพื่อออกแบบ <ArrowRight size={18}/></a></div><div className="trust"><span><Check/> Preview ก่อนผลิต</span><span><Check/> ไฟล์พิมพ์ความละเอียดสูง</span><span><Check/> ส่งฟรีเมื่อครบ ฿999</span></div></div>
        <div className="hero-art"><div className="sun"/><div className="mug-scene mug-scene-large"><div className="mug-shadow"/><div className="mug-handle"/><div className="mug-body"><div className="mug-rim"/><div className="mug-design" style={{background:"linear-gradient(135deg,#315c50,#d99569)"}}><span>YOUR STORY</span></div><div className="mug-shine"/></div></div><div className="float-card"><span>ออกแบบออนไลน์</span><strong>เห็นภาพก่อนสั่งจริง</strong></div></div>
      </section>

      <section id="products" className="home-product-section">
        <div className="shell"><div className="section-head"><div><p className="eyebrow">STEP 01 — CHOOSE YOUR PRODUCT</p><h2>เลือกสินค้า<br/>เพื่อเริ่มออกแบบ</h2></div><p>แต่ละสินค้ามีพื้นที่พิมพ์และ Preview เฉพาะ กดสินค้าที่พร้อมเพื่อเข้าสู่สตูดิโอทันที</p></div>
          <div className="design-product-grid home-design-products" aria-label="เลือกสินค้าเพื่อออกแบบ">
            {products.map((product, index) => {
              const Icon = PRODUCT_ICONS[product.editorType];
              const isAvailable = product.status === "AVAILABLE";
              return <article className={`design-product-card ${isAvailable ? "available" : "coming-soon"}`} key={product.id} style={{"--card-accent":product.accent} as React.CSSProperties}><div className="design-product-visual"><span>0{index + 1}</span><Icon/><small>{product.editorType === "MUG_3D" ? "LIVE 3D PREVIEW" : "FRONT / BACK PREVIEW"}</small></div><div className="design-product-copy"><div><small>{product.categoryName}</small><span className="status-badge">{isAvailable ? <Sparkles/> : <Clock3/>}{product.badge}</span></div><h3>{product.name}</h3><p>{product.description}</p><footer><strong>฿{(product.priceSatang/100).toLocaleString("th-TH")}</strong>{isAvailable ? <Link id={`home-design-${product.slug}`} href={`/design/${product.slug}`}>เลือกและออกแบบ <ArrowRight/></Link> : <span>กำลังเตรียมสินค้า</span>}</footer></div></article>;
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="home-flow shell section"><p className="eyebrow">HOW IT WORKS</p><h2>สั่งงานง่ายใน 4 ขั้นตอน</h2><div><article><b>01</b><h3>เลือกสินค้า</h3><p>เลือกชนิดสินค้าจากหน้านี้</p></article><article><b>02</b><h3>ออกแบบ</h3><p>อัปโหลดรูป เพิ่มข้อความ ดู Preview</p></article><article><b>03</b><h3>ตรวจแบบ</h3><p>เช็กสี ตำแหน่ง ขนาด และจำนวน</p></article><article><b>04</b><h3>ชำระเงิน</h3><p>กรอกที่อยู่ จ่าย PromptPay และแนบสลิป</p></article></div></section>

      <footer id="about"><div className="shell footer"><div><Link href="/" className="brand"><span className="brand-dot">C</span><span>CupCraft</span></Link><p>งานพิมพ์ที่เริ่มจากไอเดียของคุณ</p></div><div><strong>เริ่มต้น</strong><a href="#products">เลือกสินค้า</a><a href="#how-it-works">วิธีสั่งซื้อ</a></div><div><strong>สำหรับร้าน</strong><Link href="/admin">เข้าสู่ระบบ Admin</Link><a href="mailto:hello@cupcraft.local">ติดต่อเรา</a></div></div></footer>
    </main>
  );
}
