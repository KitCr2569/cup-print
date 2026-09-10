import type { PrintOption } from "./print-option";

export type ProductStatus = "AVAILABLE" | "COMING_SOON";
export type EditorType = "MUG_3D" | "APPAREL_2D";

export type ProductTemplate = {
  productId: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  status: ProductStatus;
  editorType: EditorType;
  accent: string;
  badge: string;
  printOptions?: PrintOption[];
  mug: { capacityOz: number; diameterCm: number; heightCm: number };
  print: { widthCm: number; heightCm: number; dpi: number; safeMarginCm: number; bleedCm: number };
  model: { path: string; printMaterial: string; ceramicMaterial: string; handleMaterial: string };
  uv: { offsetX: number; offsetY: number; repeatX: number; repeatY: number; rotation: number };
};

export const CERAMIC_MUG_11OZ: ProductTemplate = {
  productId: "ceramic-mug-11oz", slug: "ceramic-mug-11oz", name: "แก้วเซรามิก 11 oz",
  category: "แก้ว", description: "แก้วขาวคลาสสิก พิมพ์ลายรอบใบ พร้อมดูตัวอย่าง 3D 360°",
  price: 299, status: "AVAILABLE", editorType: "MUG_3D", accent: "#dce8d5", badge: "พร้อมออกแบบ",
  mug: { capacityOz: 11, diameterCm: 8.4, heightCm: 9.5 },
  print: { widthCm: 20, heightCm: 9, dpi: 300, safeMarginCm: 0.3, bleedCm: 0.2 },
  model: { path: "/models/mug-11oz.glb?v=7", printMaterial: "MugBodyPrint", ceramicMaterial: "MugCeramic", handleMaterial: "MugHandle" },
  uv: { offsetX: 0.25, offsetY: 0, repeatX: 1, repeatY: 1, rotation: 0 },
};

export type ProductSummary = Pick<ProductTemplate, "productId" | "slug" | "name" | "category" | "description" | "price" | "status" | "editorType" | "accent" | "badge">;

export const PRODUCT_CATALOG: ProductSummary[] = [
  CERAMIC_MUG_11OZ,
  { productId: "yeti-tumbler-20oz", slug: "yeti-tumbler-20oz", name: "แก้วเยติ 20 oz", category: "แก้วเก็บอุณหภูมิ", description: "พื้นที่ใหญ่ เก็บความเย็นนาน เตรียมรองรับ Live Preview 3D", price: 499, status: "COMING_SOON", editorType: "MUG_3D", accent: "#d5e4e7", badge: "เร็ว ๆ นี้" },
  { productId: "classic-t-shirt", slug: "classic-t-shirt", name: "เสื้อยืด Classic", category: "เสื้อ", description: "ออกแบบลายหน้าและหลัง พร้อมภาพจำลองขนาดพิมพ์จริง", price: 399, status: "COMING_SOON", editorType: "APPAREL_2D", accent: "#eadccc", badge: "เร็ว ๆ นี้" },
];

export function getProductBySlug(slug: string): ProductTemplate | undefined {
  return slug === CERAMIC_MUG_11OZ.slug ? CERAMIC_MUG_11OZ : undefined;
}

export function getAvailableProductById(productId: string): ProductTemplate | undefined {
  return productId === CERAMIC_MUG_11OZ.productId ? CERAMIC_MUG_11OZ : undefined;
}

export function printPixels(template: ProductTemplate) {
  return { width: Math.round((template.print.widthCm / 2.54) * template.print.dpi), height: Math.round((template.print.heightCm / 2.54) * template.print.dpi) };
}
