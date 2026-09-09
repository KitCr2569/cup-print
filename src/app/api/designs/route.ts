import { randomUUID } from "node:crypto";
import { query } from "@/lib/database/db";
import { CERAMIC_MUG_11OZ } from "@/lib/design/product-config";
import { getFileStorage } from "@/lib/storage";

export const runtime = "nodejs";
const MAX_DESIGN_FILE_SIZE = 20_000_000;

function isValidDesignFile(value: FormDataEntryValue | null): value is File {
  return (
    value instanceof File &&
    value.type === "image/png" &&
    value.size > 0 &&
    value.size <= MAX_DESIGN_FILE_SIZE
  );
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const preview = form.get("preview");
    const print = form.get("print");

    if (!isValidDesignFile(preview) || !isValidDesignFile(print)) {
      return Response.json(
        { error: "Design files must be PNG images no larger than 20 MB" },
        { status: 400 },
      );
    }

    let fabricJson: unknown;
    try {
      fabricJson = JSON.parse(String(form.get("fabricJson") || "{}"));
    } catch {
      return Response.json({ error: "Invalid design data" }, { status: 400 });
    }

    const template = await query<{ id: string }>(
      "SELECT id FROM product_templates WHERE product_id=$1 ORDER BY version DESC LIMIT 1",
      [CERAMIC_MUG_11OZ.productId],
    );
    if (!template.rows[0]) {
      return Response.json({ error: "Product template not found" }, { status: 409 });
    }

    const id = randomUUID();
    const storage = getFileStorage();
    const [previewPath, printPath] = await Promise.all([
      storage.storeFile(`designs/${id}`, preview, "png"),
      storage.storeFile(`designs/${id}`, print, "png"),
    ]);

    await query(
      "INSERT INTO designs(id,product_id,template_id,fabric_json,asset_refs,print_width_cm,print_height_cm,dpi,preview_path,print_path) VALUES($1,$2,$3,$4,'[]',$5,$6,$7,$8,$9)",
      [
        id,
        CERAMIC_MUG_11OZ.productId,
        template.rows[0].id,
        fabricJson,
        CERAMIC_MUG_11OZ.print.widthCm,
        CERAMIC_MUG_11OZ.print.heightCm,
        CERAMIC_MUG_11OZ.print.dpi,
        previewPath,
        printPath,
      ],
    );

    return Response.json({ id, previewUrl: `/api/designs/${id}/preview` }, { status: 201 });
  } catch (error) {
    console.error("Unable to save design", error);
    return Response.json({ error: "Unable to save design" }, { status: 500 });
  }
}
