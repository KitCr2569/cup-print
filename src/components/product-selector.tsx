import Link from "next/link";
import { ArrowLeft, ArrowRight, Box, Clock3, Shirt, Sparkles } from "lucide-react";
import { PRODUCT_CATALOG } from "@/lib/design/product-config";

const PRODUCT_ICONS = { MUG_3D: Box, APPAREL_2D: Shirt } as const;

export default function ProductSelector() {
  return (
    <div className="product-select-page">
      <header className="designer-nav">
        <Link href="/" className="brand"><span className="brand-dot">C</span><span>Cup Story</span></Link>
        <div className="steps"><span className="active"><b>1</b> เลือกสินค้า</span><i/><span><b>2</b> ออกแบบ</span><i/><span><b>3</b> สั่งซื้อ</span></div>
        <Link href="/" className="ghost-button"><ArrowLeft/> กลับหน้าร้าน</Link>
      </header>
      <main className="product-select-main">
        <section className="product-select-hero">
          <div><p className="eyebrow"><Sparkles size={15}/> DESIGN STUDIO</p><h1>เลือกชิ้นงาน<br/><em>ที่เป็นคุณ</em></h1></div>
          <p>เริ่มจากสินค้าที่ชอบ แล้วสร้างลายพร้อมดู Live Preview ก่อนส่งผลิตทุกชิ้น</p>
        </section>
        <section className="design-product-grid" aria-label="สินค้าสำหรับออกแบบ">
          {PRODUCT_CATALOG.map((product, index) => {
            const Icon = PRODUCT_ICONS[product.editorType];
            const isAvailable = product.status === "AVAILABLE";
            return (
              <article className={`design-product-card ${isAvailable ? "available" : "coming-soon"}`} key={product.productId} style={{ "--card-accent": product.accent } as React.CSSProperties}>
                <div className="design-product-visual"><span>0{index + 1}</span><Icon/><small>{product.editorType === "MUG_3D" ? "360° PREVIEW" : "FRONT / BACK"}</small></div>
                <div className="design-product-copy"><div><small>{product.category}</small><span className="status-badge">{isAvailable ? <Sparkles/> : <Clock3/>}{product.badge}</span></div><h2>{product.name}</h2><p>{product.description}</p><footer><strong>฿{product.price.toLocaleString("th-TH")}</strong>{isAvailable ? <Link id={`design-${product.slug}`} href={`/design/${product.slug}`}>เริ่มออกแบบ <ArrowRight/></Link> : <span>กำลังเตรียมสินค้า</span>}</footer></div>
              </article>
            );
          })}
        </section>
        <aside className="production-note"><b>ทุก Preview อิงพื้นที่พิมพ์จริง</b><span>สินค้าที่ asset ยังไม่ผ่านการตรวจผลิตจะไม่เปิดรับออเดอร์</span></aside>
      </main>
    </div>
  );
}
