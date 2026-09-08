import {timingSafeEqual} from "node:crypto";import {createAdminSession} from "@/lib/auth/admin";
function equal(a:string,b:string){const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb)}
export async function POST(request:Request){const {password}=await request.json();const expected=process.env.ADMIN_PASSWORD;if(!expected||!equal(String(password||""),expected))return Response.json({error:"รหัสผ่านไม่ถูกต้อง"},{status:401});await createAdminSession();return Response.json({ok:true})}
