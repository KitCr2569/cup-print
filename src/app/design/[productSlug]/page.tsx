import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DesignWorkspace from "@/components/design-workspace";
import { getProductBySlug } from "@/lib/design/product-config";

export async function generateMetadata({ params }: { params: Promise<{ productSlug: string }> }): Promise<Metadata> {
  const product = getProductBySlug((await params).productSlug);
  return product ? { title: `ออกแบบ${product.name} | Cup Story`, description: product.description } : {};
}

export default async function ProductDesignPage({ params }: { params: Promise<{ productSlug: string }> }) {
  const product = getProductBySlug((await params).productSlug);
  if (!product) notFound();
  return <DesignWorkspace template={product} />;
}
