import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DesignReview, { type ReviewDesign } from "@/components/design-review";
import { query } from "@/lib/database/db";

export const metadata: Metadata = {
  title: "ตรวจสอบแบบ | Cup Story",
  description: "ตรวจแบบสินค้า จำนวน และยอดรวมก่อนดำเนินการชำระเงิน",
};

type ReviewRow = {
  id: string; product_id: string; name: string; description: string;
  price_satang: number; unit_price_satang: number; print_option: string; print_placement: string | null; print_width_cm: string; print_height_cm: string; dpi: number;
};

export default async function ReviewPage({ params }: { params: Promise<{ designId: string }> }) {
  const { designId } = await params;
  const row = (await query<ReviewRow>("SELECT d.id,d.product_id,p.name,p.description,p.price_satang,d.unit_price_satang,d.print_option,d.print_placement,d.print_width_cm,d.print_height_cm,d.dpi FROM designs d JOIN products p ON p.id=d.product_id WHERE d.id=$1 AND p.active=true", [designId])).rows[0];
  if (!row) notFound();
  const design: ReviewDesign = { id: row.id, productId: row.product_id, name: row.name, description: row.description, priceSatang: row.unit_price_satang, printOption: row.print_option, printPlacement: row.print_placement, printWidthCm: Number(row.print_width_cm), printHeightCm: Number(row.print_height_cm), dpi: row.dpi, previewUrl: `/api/designs/${row.id}/preview` };
  return <DesignReview design={design}/>;
}
