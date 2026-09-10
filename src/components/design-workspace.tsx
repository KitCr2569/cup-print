"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import DesignEditor from "@/components/editor/design-editor";
import { DesignProvider, useDesign } from "@/components/editor/design-provider";
import type { ProductTemplate } from "@/lib/design/product-config";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEFAULT_PRINT_OPTIONS, type PrintOptionType, type PrintPlacement } from "@/lib/design/print-option";

const MugViewer = dynamic(() => import("@/components/mug-3d/mug-viewer"), { ssr: false, loading: () => <section className="viewer-panel loading-3d">กำลังเตรียม 3D Preview…</section> });

function SaveDesignButton({ template, printOption, placement }: { template: ProductTemplate; printOption: PrintOptionType; placement: PrintPlacement | null }) {
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
       form.set("printOption", printOption);
       if (placement) form.set("printPlacement", placement);
      form.set("fabricJson", JSON.stringify({ ...artifacts.fabricJson, mugPreview: { centerOffsetDeg } }));
      form.set("preview", artifacts.preview, "preview.png");
      form.set("print", artifacts.print, "print.png");
      const response = await fetch("/api/designs", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.push(`/review/${result.id}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "บันทึกไม่สำเร็จ");
      setIsSaving(false);
    }
  }
  return <div className="save-design"><button className="primary" onClick={save} disabled={!exportArtifacts || isSaving}><ShoppingBag/>{isSaving ? "กำลังเตรียมไฟล์…" : "สั่งซื้อแบบนี้"}</button>{error && <small>{error}</small>}</div>;
}

export default function DesignWorkspace({ template }: { template: ProductTemplate }) {
  const options=template.printOptions?.filter(option=>option.isEnabled) ?? DEFAULT_PRINT_OPTIONS;
  const [printOption,setPrintOption]=useState<PrintOptionType>(options[0].type);
  const [placement,setPlacement]=useState<PrintPlacement>("FRONT");
  const selected=options.find(option=>option.type===printOption) ?? options[0];
  const editorTemplate={...template,price:selected.priceSatang/100,print:{...template.print,widthCm:selected.widthCm,heightCm:selected.heightCm}};
  return <DesignProvider>
    <style jsx global>{`
      .two-side-guides { position: absolute; inset: 12%; display: grid; grid-template-columns: 1fr 20% 1fr; pointer-events: none; }
      .two-side-guides span { display: grid; place-items: center; border: 2px dashed #e89a6a; color: #9e4f2d; font-size: 11px; font-weight: 800; background: #fff4ed55; }
      .two-side-guides i { border-left: 1px dashed #8e8e8e; border-right: 1px dashed #8e8e8e; }
    `}</style>
    <div className="designer-page"><header className="designer-nav"><Link href="/" className="brand"><span className="brand-dot">C</span><span>Cup Story</span></Link><div className="steps"><span><b>1</b> เลือกสินค้า</span><i/><span className="active"><b>2</b> ออกแบบ</span><i/><span><b>3</b> สั่งซื้อ</span></div><Link href="/design" className="ghost-button"><ArrowLeft/> เปลี่ยนสินค้า</Link></header><main className="designer-main"><section className="designer-heading"><div><p className="eyebrow">CUSTOM DESIGN STUDIO</p><h1>สร้าง{template.name}ของคุณ</h1><p>ออกแบบลาย พร้อมดูตัวอย่างบนสินค้าแบบ 360° ได้ทันที</p></div><div className="product-chip"><span>{template.mug.capacityOz}<br/><small>OZ</small></span><div><b>{template.name}</b><small>พื้นที่พิมพ์ {selected.widthCm} × {selected.heightCm} ซม.</small></div></div></section><div className="print-option-panel"><div>{options.map(option=><button type="button" className={option.type===printOption?"active":""} key={option.type} onClick={()=>setPrintOption(option.type)}><b>{option.label}</b><span>฿{(option.priceSatang/100).toLocaleString("th-TH")}</span></button>)}</div>{printOption==="ONE_SIDE"&&<label>เลือกตำแหน่ง<select value={placement} onChange={event=>setPlacement(event.target.value as PrintPlacement)}><option value="FRONT">ด้านหน้า</option><option value="LEFT">ด้านซ้าย</option><option value="RIGHT">ด้านขวา</option></select></label>}</div><div className="studio-grid"><DesignEditor key={`${printOption}-${placement}`} template={editorTemplate} printOption={printOption} placement={placement} /><MugViewer template={editorTemplate}/></div><section className="design-order"><div><Check/><p><b>พร้อมสั่งผลิตเมื่อคุณพอใจกับแบบ</b><br/>ระบบจะใช้ไฟล์ความละเอียดสูงสำหรับงานพิมพ์จริง</p></div><div><strong>฿{editorTemplate.price}</strong><SaveDesignButton template={editorTemplate} printOption={printOption} placement={placement}/></div></section></main></div></DesignProvider>;
}
