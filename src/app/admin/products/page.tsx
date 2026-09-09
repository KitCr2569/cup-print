import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth/admin";
import { listAdminProducts, listCategories } from "@/lib/catalog/product-repository";
import ProductManager from "@/components/admin/product-manager";
export const dynamic="force-dynamic";
export default async function AdminProductsPage(){if(!await isAdmin())redirect("/admin/login");const [products,categories]=await Promise.all([listAdminProducts(),listCategories()]);return <main className="admin-page"><aside className="admin-side"><Link href="/" className="brand"><span className="brand-dot">C</span><span>Cup Story</span></Link><p>ADMIN PANEL</p><div className="admin-links"><Link href="/admin">คำสั่งซื้อ</Link><Link className="active" href="/admin/products">สินค้า</Link></div><Link href="/">← กลับหน้าร้าน</Link></aside><section className="admin-content"><ProductManager products={products} categories={categories}/></section></main>}
