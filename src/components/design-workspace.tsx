"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import DesignEditor from "@/components/editor/design-editor";
import { DesignProvider, useDesign } from "@/components/editor/design-provider";
import type { ProductTemplate } from "@/lib/design/product-config";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MugViewer = dynamic(() => import("@/components/mug-3d/mug-viewer"), { ssr: false, loading: () => <section className="viewer-panel loading-3d">กำลังเตรียม 3D Preview…</section> });

function SaveDesignButton({ template }: { template: ProductTemplate }) {
  const { exportArtifacts, centerOffsetDeg } = useDesign();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    if (!exportArtifacts || isSaving) return;
    setIsSaving(true); setError("");
    try {
      const artifacts = await exportArtifacts();
      const form = new FormData();
      form.set("productId", template.productId);
      form.set("fabricJson", JSON.stringify({ ...artifacts.fabricJson, mugPreview: { centerOffsetDeg } }));
      form.set("preview", artifacts.preview, "preview.png");
      form.set("print", artifacts.print, "print.png");
      const response = await fetch("/api/designs", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.push(`/checkout?design=${result.id}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "บันทึกไม่สำเร็จ");
      setIsSaving(false);
    }
  }
  return <div className="save-design"><button className="primary" onClick={save} disabled={!exportArtifacts || isSaving}><ShoppingBag/>{isSaving ? "กำลังเตรียมไฟล์…" : "สั่งซื้อแบบนี้"}</button>{error && <small>{error}</small>}</div>;
}

export default function DesignWorkspace({ template }: { template: ProductTemplate }) {
  return <DesignProvider><div className="designer-page"><header className="designer-nav"><Link href="/" className="brand"><span className="brand-dot">C</span><span>Cup Story</span></Link><div className="steps"><span><b>1</b> เลือกสินค้า</span><i/><span className="active"><b>2</b> ออกแบบ</span><i/><span><b>3</b> สั่งซื้อ</span></div><Link href="/design" className="ghost-button"><ArrowLeft/> เปลี่ยนสินค้า</Link></header><main className="designer-main"><section className="designer-heading"><div><p className="eyebrow">CUSTOM DESIGN STUDIO</p><h1>สร้าง{template.name}ของคุณ</h1><p>ออกแบบลาย พร้อมดูตัวอย่างบนสินค้าแบบ 360° ได้ทันที</p></div><div className="product-chip"><span>{template.mug.capacityOz}<br/><small>OZ</small></span><div><b>{template.name}</b><small>พื้นที่พิมพ์ {template.print.widthCm} × {template.print.heightCm} ซม.</small></div></div></section><div className="studio-grid"><DesignEditor template={template}/><MugViewer template={template}/></div><section className="design-order"><div><Check/><p><b>พร้อมสั่งผลิตเมื่อคุณพอใจกับแบบ</b><br/>ระบบจะใช้ไฟล์ความละเอียดสูงสำหรับงานพิมพ์จริง</p></div><div><strong>฿{template.price}</strong><SaveDesignButton template={template}/></div></section></main></div></DesignProvider>;
}
