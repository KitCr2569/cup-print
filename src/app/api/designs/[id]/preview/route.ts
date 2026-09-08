import { query } from "@/lib/database/db";import { loadFile } from "@/lib/storage/local";
export const runtime="nodejs";
export async function GET(_:Request,ctx:RouteContext<"/api/designs/[id]/preview">){const {id}=await ctx.params;const result=await query<{preview_path:string}>("SELECT preview_path FROM designs WHERE id=$1",[id]);if(!result.rows[0])return new Response("Not found",{status:404});const bytes=await loadFile(result.rows[0].preview_path);return new Response(bytes,{headers:{"content-type":"image/png","cache-control":"private, max-age=3600"}})}
