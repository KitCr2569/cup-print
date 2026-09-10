import "server-only";
import { query } from "@/lib/database/db";
import type { EditorType, ProductStatus } from "./product-input";
import { DEFAULT_PRINT_OPTIONS, type PrintOption } from "@/lib/design/print-option";

export type CatalogProduct = { id:string;slug:string;name:string;description:string;priceSatang:number;status:ProductStatus;sortOrder:number;editorType:EditorType;accent:string;badge:string;imagePath:string|null;categoryId:string;categoryName:string;categorySlug:string;categorySortOrder:number;hasTemplate:boolean;printOptions:PrintOption[] };
export type ProductCategory = { id:string;name:string;slug:string;sortOrder:number };
type ProductRow={id:string;slug:string;name:string;description:string;price_satang:number;status:ProductStatus;sort_order:number;editor_type:EditorType;accent:string;badge:string;image_path:string|null;category_id:string;category_name:string;category_slug:string;category_sort_order:number;has_template:boolean;print_options:PrintOption[]};
const PRODUCT_SELECT="SELECT p.id,p.slug,p.name,p.description,p.price_satang,p.status,p.sort_order,p.editor_type,p.accent,p.badge,p.image_path,p.print_options,c.id category_id,c.name category_name,c.slug category_slug,c.sort_order category_sort_order,EXISTS(SELECT 1 FROM product_templates pt WHERE pt.product_id=p.id) has_template FROM products p JOIN product_categories c ON c.id=p.category_id";
function map(row:ProductRow):CatalogProduct{return{id:row.id,slug:row.slug,name:row.name,description:row.description,priceSatang:row.price_satang,status:row.status,sortOrder:row.sort_order,editorType:row.editor_type,accent:row.accent,badge:row.badge,imagePath:row.image_path,categoryId:row.category_id,categoryName:row.category_name,categorySlug:row.category_slug,categorySortOrder:row.category_sort_order,hasTemplate:row.has_template,printOptions:Array.isArray(row.print_options)?row.print_options:DEFAULT_PRINT_OPTIONS}}
export async function listPublicProducts(){return(await query<ProductRow>(`${PRODUCT_SELECT} WHERE p.active=true AND p.status IN ('AVAILABLE','COMING_SOON') ORDER BY c.sort_order,p.sort_order,p.name`)).rows.map(map)}
export async function listAdminProducts(){return(await query<ProductRow>(`${PRODUCT_SELECT} ORDER BY c.sort_order,p.sort_order,p.name`)).rows.map(map)}
export async function listCategories(){return(await query<{id:string;name:string;slug:string;sort_order:number}>("SELECT id,name,slug,sort_order FROM product_categories ORDER BY sort_order,name")).rows.map(row=>({id:row.id,name:row.name,slug:row.slug,sortOrder:row.sort_order}))}
export async function findAvailableProductBySlug(slug:string){const row=(await query<ProductRow>(`${PRODUCT_SELECT} WHERE p.slug=$1 AND p.active=true AND p.status='AVAILABLE'`,[slug])).rows[0];return row?map(row):undefined}
