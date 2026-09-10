import {clearAdminSession} from "@/lib/auth/admin";import {hasSameOrigin} from "@/lib/security/request";
export async function POST(request:Request){if(!hasSameOrigin(request))return Response.json({error:"Forbidden"},{status:403});await clearAdminSession();return Response.json({ok:true})}
