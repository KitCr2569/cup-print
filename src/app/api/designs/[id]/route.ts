import { query } from "@/lib/database/db";

export type DesignSummaryRow = {
  id: string;
  product_id: string;
  name: string;
  description: string;
  price_satang: number;
  print_width_cm: string;
  print_height_cm: string;
  dpi: number;
};

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const design = (await query<DesignSummaryRow>(
    "SELECT d.id,d.product_id,p.name,p.description,p.price_satang,d.print_width_cm,d.print_height_cm,d.dpi FROM designs d JOIN products p ON p.id=d.product_id WHERE d.id=$1 AND p.active=true",
    [id],
  )).rows[0];
  if (!design) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({
    id: design.id,
    productId: design.product_id,
    name: design.name,
    description: design.description,
    priceSatang: design.price_satang,
    printWidthCm: Number(design.print_width_cm),
    printHeightCm: Number(design.print_height_cm),
    dpi: design.dpi,
    previewUrl: `/api/designs/${design.id}/preview`,
  });
}
