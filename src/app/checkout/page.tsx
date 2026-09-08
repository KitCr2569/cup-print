import {Suspense} from "react";import CheckoutClient from "./checkout-client";
export default function CheckoutPage(){return <Suspense fallback={<main className="checkout-page">กำลังโหลด…</main>}><CheckoutClient/></Suspense>}
