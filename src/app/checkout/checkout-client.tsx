"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CheckoutForm, { type DesignSummary } from "@/components/checkout-form";
import { parseQuantity } from "@/lib/orders/quantity";

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const designId = searchParams.get("design");
  const initialQuantity = parseQuantity(searchParams.get("quantity"));
  const [design, setDesign] = useState<DesignSummary | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(designId));

  useEffect(() => {
    if (!designId) return;
    const controller = new AbortController();
    fetch(`/api/designs/${designId}`, { signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : Promise.reject(new Error("ไม่พบแบบ")))
      .then(setDesign)
      .catch((error) => { if (error.name !== "AbortError") setDesign(null); })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [designId]);

  if (isLoading) return <main className="checkout-page">กำลังโหลดข้อมูลสินค้า…</main>;
  if (!design) return <main className="checkout-page"><div className="payment-card"><h1>ไม่พบแบบสินค้า</h1><Link className="primary" href="/design">เลือกสินค้าใหม่</Link></div></main>;
  return <CheckoutForm design={design} initialQuantity={initialQuantity} />;
}
