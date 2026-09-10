import { timingSafeEqual } from "node:crypto";
import { createAdminSession } from "@/lib/auth/admin";
import { checkRateLimit, clearRateLimit } from "@/lib/security/rate-limit";
import { getClientIp, rateLimitedResponse } from "@/lib/security/request";
const LOGIN_LIMIT = 5, LOGIN_WINDOW_MS = 15 * 60 * 1000;
function normalize(value: unknown) { return String(value ?? "").trim().normalize("NFKC"); }
function passwordsMatch(actual: string, expected: string) { const a=Buffer.from(normalize(actual)),b=Buffer.from(normalize(expected));return a.length===b.length&&timingSafeEqual(a,b); }
export async function POST(request: Request) {
  const clientKey=`admin-login:${getClientIp(request)}`,limit=checkRateLimit(clientKey,LOGIN_LIMIT,LOGIN_WINDOW_MS);
  if(!limit.isAllowed)return rateLimitedResponse(limit.retryAfterSeconds);
  let password="";try{const body=await request.json();password=typeof body?.password==="string"?body.password:""}catch{return Response.json({error:"??????????????"},{status:400})}
  const expected=process.env.ADMIN_PASSWORD;if(!expected){console.error("ADMIN_PASSWORD is not configured");return Response.json({error:"???? Admin ????????????????"},{status:503})}
  if(!passwordsMatch(password,expected))return Response.json({error:"??????????????????"},{status:401});
  try{await createAdminSession();clearRateLimit(clientKey);return Response.json({ok:true})}catch(error){console.error("Admin session creation failed",error);return Response.json({error:"????? Admin session ?????????"},{status:500})}
}
