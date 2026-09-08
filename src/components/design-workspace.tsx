"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import DesignEditor from "@/components/editor/design-editor";
import { DesignProvider } from "@/components/editor/design-provider";
import { CERAMIC_MUG_11OZ } from "@/lib/design/product-config";
import { useDesign } from "@/components/editor/design-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MugViewer = dynamic(() => import("@/components/mug-3d/mug-viewer"), { ssr: false, loading: () => <section className="viewer-panel loading-3d">กำลังเตรียม 3D Preview…</section> });

function SaveDesignButton(){const {exportArtifacts,centerOffsetDeg}=useDesign();const router=useRouter();const [saving,setSaving]=useState(false);const [error,setError]=useState("");async function save(){if(!exportArtifacts||saving)return;setSaving(true);setError("");try{const a=await exportArtifacts();const form=new FormData();form.set("fabricJson",JSON.stringify({...a.fabricJson,mugPreview:{centerOffsetDeg}}));form.set("preview",a.preview,"preview.png");form.set("print",a.print,"print.png");const response=await fetch("/api/designs",{method:"POST",body:form});const result=await response.json();if(!response.ok)throw new Error(result.error);router.push(`/checkout?design=${result.id}`)}catch(e){setError(e instanceof Error?e.message:"บันทึกไม่สำเร็จ");setSaving(false)}}return <div className="save-design"><button className="primary" onClick={save} disabled={!exportArtifacts||saving}><ShoppingBag/>{saving?"กำลังเตรียมไฟล์…":"สั่งซื้อแบบนี้"}</button>{error&&<small>{error} — กรุณาตรวจว่าเปิดฐานข้อมูลแล้ว</small>}</div>}
export default function DesignWorkspace(){return <DesignProvider><div className="designer-page"><header className="designer-nav"><Link href="/" className="brand"><span className="brand-dot">C</span><span>Cup Story</span></Link><div className="steps"><span className="active"><b>1</b> ออกแบบ</span><i/><span><b>2</b> ตรวจสอบ</span><i/><span><b>3</b> สั่งซื้อ</span></div><Link href="/" className="ghost-button"><ArrowLeft/> กลับหน้าร้าน</Link></header><main className="designer-main"><section className="designer-heading"><div><p className="eyebrow">CUSTOM MUG STUDIO</p><h1>สร้างแก้วใบพิเศษของคุณ</h1><p>ออกแบบลาย พร้อมดูตัวอย่างบนแก้วแบบ 360° ได้ทันที</p></div><div className="product-chip"><span>11<br/><small>OZ</small></span><div><b>{CERAMIC_MUG_11OZ.name}</b><small>พื้นที่พิมพ์ {CERAMIC_MUG_11OZ.print.widthCm} × {CERAMIC_MUG_11OZ.print.heightCm} ซม.</small></div></div></section><div className="studio-grid"><DesignEditor/><MugViewer/></div><section className="design-order"><div><Check/><p><b>พร้อมสั่งผลิตเมื่อคุณพอใจกับแบบ</b><br/>ระบบจะใช้ไฟล์ความละเอียดสูงสำหรับงานพิมพ์จริง</p></div><div><strong>฿{CERAMIC_MUG_11OZ.price}</strong><SaveDesignButton/></div></section></main></div></DesignProvider>}
