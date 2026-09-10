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

const MugViewer = dynamic(() => import("@/components/mug-3d/mug-viewer"), { ssr: false, loading: () => <section className="viewer-panel loading-3d">α╕üα╕│α╕Ñα╕▒α╕çα╣Çα╕òα╕úα╕╡α╕óα╕í 3D PreviewΓÇª</section> });

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
      setError(saveError instanceof Error ? saveError.message : "α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê");
      setIsSaving(false);
    }
  }
  return <div className="save-design"><button className="primary" onClick={save} disabled={!exportArtifacts || isSaving}><ShoppingBag/>{isSaving ? "α╕üα╕│α╕Ñα╕▒α╕çα╣Çα╕òα╕úα╕╡α╕óα╕íα╣äα╕ƒα╕Ñα╣îΓÇª" : "α╕¬α╕▒α╣êα╕çα╕ïα╕╖α╣ëα╕¡α╣üα╕Üα╕Üα╕Öα╕╡α╣ë"}</button>{error && <small>{error}</small>}</div>;
}

export default function DesignWorkspace({ template }: { template: ProductTemplate }) {
  const options=template.printOptions?.filter(option=>option.isEnabled) ?? DEFAULT_PRINT_OPTIONS;
  const [printOption,setPrintOption]=useState<PrintOptionType>(options[0].type);
  const [placement,setPlacement]=useState<PrintPlacement>("FRONT");
  const selected=options.find(option=>option.type===printOption) ?? options[0];
  const editorTemplate={...template,price:selected.priceSatang/100,print:{...template.print,widthCm:selected.widthCm,heightCm:selected.heightCm}};
  return <DesignProvider>
    <style jsx global>{`
      .two-side-guides { position: absolute; inset: 5.555% 5%; display: grid; grid-template-columns: 40% 10% 40%; pointer-events: none; z-index: 12; }
      .two-side-guides > div { position: relative; border: 2px dashed #df8250; border-radius: 8px; background: #fff4ed22; }
      .two-side-guides > div > span { position: absolute; top: 6px; left: 50%; transform: translateX(-50%); color: #874224; background: #fff8f2e8; border-radius: 999px; padding: 3px 8px; font-size: 10px; font-weight: 800; white-space: nowrap; }
      .two-side-guides > div > b { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); color: #874224; text-align: center; font: 800 9px/1.35 sans-serif; white-space: nowrap; }
      .two-side-guides > div > b i,.two-side-guides > div > b i::after { position: absolute; content: ""; background: #df5f36; }
      .two-side-guides > div > b i { width: 28px; height: 1px; left: 50%; top: -7px; transform: translateX(-50%); }
      .two-side-guides > div > b i::after { width: 1px; height: 28px; left: 50%; top: -14px; }
      .two-side-guides > em { border-left: 1px dashed #89938e; border-right: 1px dashed #89938e; background: #1f3a3120; }
    `}</style>
    <div className="designer-page"><header className="designer-nav"><Link href="/" className="brand"><span className="brand-dot">C</span><span>Cup Story</span></Link><div className="steps"><span><b>1</b> α╣Çα╕Ñα╕╖α╕¡α╕üα╕¬α╕┤α╕Öα╕äα╣ëα╕▓</span><i/><span className="active"><b>2</b> α╕¡α╕¡α╕üα╣üα╕Üα╕Ü</span><i/><span><b>3</b> α╕¬α╕▒α╣êα╕çα╕ïα╕╖α╣ëα╕¡</span></div><Link href="/design" className="ghost-button"><ArrowLeft/> α╣Çα╕¢α╕Ñα╕╡α╣êα╕óα╕Öα╕¬α╕┤α╕Öα╕äα╣ëα╕▓</Link></header><main className="designer-main"><section className="designer-heading"><div><p className="eyebrow">CUSTOM DESIGN STUDIO</p><h1>α╕¬α╕úα╣ëα╕▓α╕ç{template.name}α╕éα╕¡α╕çα╕äα╕╕α╕ô</h1><p>α╕¡α╕¡α╕üα╣üα╕Üα╕Üα╕Ñα╕▓α╕ó α╕₧α╕úα╣ëα╕¡α╕íα╕öα╕╣α╕òα╕▒α╕ºα╕¡α╕óα╣êα╕▓α╕çα╕Üα╕Öα╕¬α╕┤α╕Öα╕äα╣ëα╕▓α╣üα╕Üα╕Ü 360┬░ α╣äα╕öα╣ëα╕ùα╕▒α╕Öα╕ùα╕╡</p></div><div className="product-chip"><span>{template.mug.capacityOz}<br/><small>OZ</small></span><div><b>{template.name}</b><small>α╕₧α╕╖α╣ëα╕Öα╕ùα╕╡α╣êα╕₧α╕┤α╕íα╕₧α╣î {selected.widthCm} ├ù {selected.heightCm} α╕ïα╕í.</small></div></div></section><div className="print-option-panel"><div>{options.map(option=><button type="button" className={option.type===printOption?"active":""} key={option.type} onClick={()=>setPrintOption(option.type)}><b>{option.label}</b><span>α╕┐{(option.priceSatang/100).toLocaleString("th-TH")}</span></button>)}</div>{printOption==="ONE_SIDE"&&<label>α╣Çα╕Ñα╕╖α╕¡α╕üα╕òα╕│α╣üα╕½α╕Öα╣êα╕ç<select value={placement} onChange={event=>setPlacement(event.target.value as PrintPlacement)}><option value="FRONT">α╕öα╣ëα╕▓α╕Öα╕½α╕Öα╣ëα╕▓</option><option value="LEFT">α╕öα╣ëα╕▓α╕Öα╕ïα╣ëα╕▓α╕ó</option><option value="RIGHT">α╕öα╣ëα╕▓α╕Öα╕éα╕ºα╕▓</option></select></label>}</div><div className="studio-grid"><DesignEditor key={`${printOption}-${placement}`} template={editorTemplate} printOption={printOption} placement={placement} /><MugViewer template={editorTemplate}/></div><section className="design-order"><div><Check/><p><b>α╕₧α╕úα╣ëα╕¡α╕íα╕¬α╕▒α╣êα╕çα╕£α╕Ñα╕┤α╕òα╣Çα╕íα╕╖α╣êα╕¡α╕äα╕╕α╕ôα╕₧α╕¡α╣âα╕êα╕üα╕▒α╕Üα╣üα╕Üα╕Ü</b><br/>α╕úα╕░α╕Üα╕Üα╕êα╕░α╣âα╕èα╣ëα╣äα╕ƒα╕Ñα╣îα╕äα╕ºα╕▓α╕íα╕Ñα╕░α╣Çα╕¡α╕╡α╕óα╕öα╕¬α╕╣α╕çα╕¬α╕│α╕½α╕úα╕▒α╕Üα╕çα╕▓α╕Öα╕₧α╕┤α╕íα╕₧α╣îα╕êα╕úα╕┤α╕ç</p></div><div><strong>α╕┐{editorTemplate.price}</strong><SaveDesignButton template={editorTemplate} printOption={printOption} placement={placement}/></div></section></main></div></DesignProvider>;
}
