import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DesignWorkspace from "@/components/design-workspace";
import { findAvailableProductBySlug } from "@/lib/catalog/product-repository";
import { getAvailableProductById } from "@/lib/design/product-config";

export async function generateMetadata({ params }: { params: Promise<{ productSlug: string }> }): Promise<Metadata> {
  const product = await findAvailableProductBySlug((await params).productSlug);
  return product ? { title: `ออกแบบ${product.name} | Cup Story`, description: product.description } : {};
}

export default async function ProductDesignPage({ params }: { params: Promise<{ productSlug: string }> }) {
  const product = await findAvailableProductBySlug((await params).productSlug);
  if (!product || !product.hasTemplate) notFound();
  const capability = getAvailableProductById(product.id);
  if (!capability) notFound();
  const template = { ...capability, slug: product.slug, name: product.name, category: product.categoryName, description: product.description, price: product.priceSatang / 100, accent: product.accent, badge: product.badge };
  return <DesignWorkspace template={template} />;
}
