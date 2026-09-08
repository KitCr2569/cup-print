"use client";import {useSearchParams} from "next/navigation";import CheckoutForm from "@/components/checkout-form";
export default function CheckoutClient(){const id=useSearchParams().get("design");return id?<CheckoutForm designId={id}/>:<main className="checkout-page">ไม่พบแบบแก้ว</main>}
