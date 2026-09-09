import { query } from "@/lib/database/db";
import { getFileStorage } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  context: RouteContext<"/api/designs/[id]/preview">,
) {
  try {
    const { id } = await context.params;
    const result = await query<{ preview_path: string }>(
      "SELECT preview_path FROM designs WHERE id=$1",
      [id],
    );
    if (!result.rows[0]) {
      return new Response("Not found", { status: 404 });
    }

    const storedFile = await getFileStorage().loadFile(result.rows[0].preview_path);
    if (!storedFile) {
      return new Response("Not found", { status: 404 });
    }

    const responseBody = new Uint8Array(storedFile.bytes).buffer;
    return new Response(responseBody, {
      headers: {
        "content-type": storedFile.contentType || "image/png",
        "cache-control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Unable to load design preview", error);
    return new Response("Unable to load preview", { status: 500 });
  }
}
