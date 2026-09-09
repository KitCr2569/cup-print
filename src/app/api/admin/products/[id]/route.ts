import { isAdmin } from "@/lib/auth/admin";
import { query } from "@/lib/database/db";
import { parseProductInput } from "@/lib/catalog/product-input";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!await isAdmin())return Response.json({error:"Unauthorized"},{status:401});
  try{const {id}=await params;const product=parseProductInput({...await request.json(),id});if(product.status==="AVAILABLE"){const ready=(await query("SELECT 1 FROM product_templates WHERE product_id=$1 LIMIT 1",[id])).rowCount;if(!ready)return Response.json({error:"ยังไม่มี template งานผลิต จึงเปิดขายไม่ได้"},{status:409})}const result=await query("UPDATE products SET slug=$1,name=$2,description=$3,price_satang=$4,category_id=$5,status=$6,sort_order=$7,editor_type=$8,accent=$9,badge=$10,active=$11,updated_at=now() WHERE id=$12",[product.slug,product.name,product.description,product.priceSatang,product.categoryId,product.status,product.sortOrder,product.editorType,product.accent,product.badge,product.status!=="HIDDEN",id]);return result.rowCount?Response.json({ok:true}):Response.json({error:"ไม่พบสินค้า"},{status:404})}catch(error){console.error(error);return Response.json({error:error instanceof Error?error.message:"แก้สินค้าไม่สำเร็จ"},{status:400})}
}
