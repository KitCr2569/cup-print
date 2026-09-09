export const PRODUCT_STATUSES = ["DRAFT", "COMING_SOON", "AVAILABLE", "HIDDEN"] as const;
export const EDITOR_TYPES = ["MUG_3D", "APPAREL_2D"] as const;
export type ProductStatus = typeof PRODUCT_STATUSES[number];
export type EditorType = typeof EDITOR_TYPES[number];
export type ProductInput = { id: string; slug: string; name: string; description: string; priceSatang: number; categoryId: string; status: ProductStatus; sortOrder: number; editorType: EditorType; accent: string; badge: string };

export function parseProductInput(value: unknown): ProductInput {
  if (!value || typeof value !== "object") throw new Error("ข้อมูลสินค้าไม่ถูกต้อง");
  const input = value as Record<string, unknown>;
  const product: ProductInput = { id: text(input.id), slug: text(input.slug), name: text(input.name), description: text(input.description), priceSatang: Number(input.priceSatang), categoryId: text(input.categoryId), status: text(input.status) as ProductStatus, sortOrder: Number(input.sortOrder), editorType: text(input.editorType) as EditorType, accent: text(input.accent), badge: text(input.badge) };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug)) throw new Error("ID และ slug ใช้ตัวพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น");
  if (!product.name || product.name.length > 100 || product.description.length > 500 || product.badge.length > 40) throw new Error("ชื่อหรือรายละเอียดสินค้ายาวเกินกำหนด");
  if (!Number.isInteger(product.priceSatang) || product.priceSatang < 0 || product.priceSatang > 100_000_000) throw new Error("ราคาไม่ถูกต้อง");
  if (!Number.isInteger(product.sortOrder) || product.sortOrder < 0 || product.sortOrder > 10000) throw new Error("ลำดับไม่ถูกต้อง");
  if (!PRODUCT_STATUSES.includes(product.status) || !EDITOR_TYPES.includes(product.editorType)) throw new Error("สถานะหรือประเภท editor ไม่ถูกต้อง");
  if (!/^#[0-9a-fA-F]{6}$/.test(product.accent)) throw new Error("สีต้องเป็น Hex 6 หลัก");
  if (!/^[0-9a-fA-F-]{36}$/.test(product.categoryId)) throw new Error("หมวดสินค้าไม่ถูกต้อง");
  return product;
}
function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
