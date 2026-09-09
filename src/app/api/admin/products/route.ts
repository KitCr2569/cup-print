import { isAdmin } from "@/lib/auth/admin";
import { query } from "@/lib/database/db";
import { parseProductInput } from "@/lib/catalog/product-input";

export async function POST(request:Request){
  if(!await isAdmin())return Response.json({error:"Unauthorized"},{status:401});
  try{const product=parseProductInput(await request.json());if(product.status==="AVAILABLE")return Response.json({error:"สินค้าใหม่ต้องสร้าง template ก่อนเปิดขาย"},{status:409});await query("INSERT INTO products(id,slug,name,description,price_satang,category_id,status,sort_order,editor_type,accent,badge,active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true)",[product.id,product.slug,product.name,product.description,product.priceSatang,product.categoryId,product.status,product.sortOrder,product.editorType,product.accent,product.badge]);return Response.json({ok:true},{status:201})}catch(error){console.error(error);return Response.json({error:error instanceof Error?error.message:"เพิ่มสินค้าไม่สำเร็จ"},{status:400})}
}
