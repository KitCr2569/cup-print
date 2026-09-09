import ProductSelector from "@/components/product-selector";

export const metadata = {
  title: "เลือกสินค้าเพื่อออกแบบ | Cup Story",
  description: "เลือกแก้วหรือสินค้า แล้วสร้างลายพร้อม Live Preview ก่อนสั่งผลิต",
};

export default function DesignPage() {
  return <ProductSelector />;
}
