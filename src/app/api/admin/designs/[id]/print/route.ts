import { isAdmin } from "@/lib/auth/admin";
import { query } from "@/lib/database/db";
import { getFileStorage } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  context: RouteContext<"/api/admin/designs/[id]/print">,
) {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await context.params;
    const row = (
      await query<{ print_path: string }>(
        "SELECT print_path FROM designs WHERE id=$1",
        [id],
      )
    ).rows[0];
    if (!row) {
      return new Response("Not found", { status: 404 });
    }

    const storedFile = await getFileStorage().loadFile(row.print_path);
    if (!storedFile) {
      return new Response("Not found", { status: 404 });
    }

    const responseBody = new Uint8Array(storedFile.bytes).buffer;
    return new Response(responseBody, {
      headers: {
        "content-type": storedFile.contentType || "image/png",
        "content-disposition": `attachment; filename="cupstory-${id}.png"`,
      },
    });
  } catch (error) {
    console.error("Unable to load print file", error);
    return new Response("Unable to load print file", { status: 500 });
  }
}
