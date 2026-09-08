export type ProductTemplate = {
  productId: string;
  name: string;
  price: number;
  mug: { capacityOz: number; diameterCm: number; heightCm: number };
  print: { widthCm: number; heightCm: number; dpi: number; safeMarginCm: number; bleedCm: number };
  model: { path: string; printMaterial: string; ceramicMaterial: string; handleMaterial: string };
  uv: { offsetX: number; offsetY: number; repeatX: number; repeatY: number; rotation: number };
};

export const CERAMIC_MUG_11OZ: ProductTemplate = {
  productId: "ceramic-mug-11oz",
  name: "แก้วเซรามิก 11 oz",
  price: 299,
  mug: { capacityOz: 11, diameterCm: 8.4, heightCm: 9.5 },
  print: { widthCm: 20, heightCm: 9, dpi: 300, safeMarginCm: 0.3, bleedCm: 0.2 },
  model: { path: "/models/mug-11oz.glb?v=7", printMaterial: "MugBodyPrint", ceramicMaterial: "MugCeramic", handleMaterial: "MugHandle" },
  uv: { offsetX: 0.25, offsetY: 0, repeatX: 1, repeatY: 1, rotation: 0 },
};

export function printPixels(template: ProductTemplate) {
  return {
    width: Math.round((template.print.widthCm / 2.54) * template.print.dpi),
    height: Math.round((template.print.heightCm / 2.54) * template.print.dpi),
  };
}
