import { query } from "@/lib/database/db";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const design = (await query<{ id: string; product_id: string; name: string; description: string; price_satang: number }>(
    "SELECT d.id,d.product_id,p.name,p.description,p.price_satang FROM designs d JOIN products p ON p.id=d.product_id WHERE d.id=$1 AND p.active=true",
    [id],
  )).rows[0];
  if (!design) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ id: design.id, productId: design.product_id, name: design.name, description: design.description, priceSatang: design.price_satang, previewUrl: `/api/designs/${design.id}/preview` });
}
