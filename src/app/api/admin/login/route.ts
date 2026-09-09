import {timingSafeEqual} from "node:crypto";import {createAdminSession} from "@/lib/auth/admin";
function normalize(value:unknown){return String(value??"").trim().normalize("NFKC")}
function equal(a:string,b:string){const aa=Buffer.from(normalize(a)),bb=Buffer.from(normalize(b));return aa.length===bb.length&&timingSafeEqual(aa,bb)}
export async function POST(request:Request){const {password}=await request.json();const expected=process.env.ADMIN_PASSWORD;if(!expected){console.error("ADMIN_PASSWORD is not configured");return Response.json({error:"ระบบ Admin ยังไม่ได้ตั้งค่า"},{status:503})}if(!equal(String(password||""),expected))return Response.json({error:"รหัสผ่านไม่ถูกต้อง"},{status:401});await createAdminSession();return Response.json({ok:true})}
