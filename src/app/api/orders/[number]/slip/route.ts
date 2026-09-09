import { query } from "@/lib/database/db";
import { getFileStorage } from "@/lib/storage";

export const runtime = "nodejs";
const MAX_SLIP_SIZE = 10_000_000;
const SLIP_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

export async function POST(
  request: Request,
  context: RouteContext<"/api/orders/[number]/slip">,
) {
  try {
    const { number } = await context.params;
    const form = await request.formData();
    const slip = form.get("slip");
    const phone = String(form.get("phone") || "");
    const extension = slip instanceof File ? SLIP_EXTENSIONS[slip.type] : undefined;

    if (
      !(slip instanceof File) ||
      !extension ||
      slip.size === 0 ||
      slip.size > MAX_SLIP_SIZE
    ) {
      return Response.json(
        { error: "กรุณาใช้รูปสลิป JPG หรือ PNG ไม่เกิน 10 MB" },
        { status: 400 },
      );
    }

    const order = (
      await query<{ id: string; phone: string }>(
        "SELECT id,phone FROM orders WHERE order_number=$1",
        [number],
      )
    ).rows[0];
    if (!order || order.phone !== phone) {
      return Response.json({ error: "ข้อมูลออเดอร์ไม่ถูกต้อง" }, { status: 403 });
    }

    const storagePath = await getFileStorage().storeFile(
      `payments/${order.id}`,
      slip,
      extension,
    );
    await query(
      "UPDATE payments SET slip_path=$1,status='UNDER_REVIEW' WHERE order_id=$2",
      [storagePath, order.id],
    );

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Unable to upload payment slip", error);
    return Response.json({ error: "ไม่สามารถส่งสลิปได้" }, { status: 500 });
  }
}
