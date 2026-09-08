export type Product = { id: string; name: string; category: string; description: string; price: number; stock: number; badge?: string; tint: string; pattern: string; mark: string };
export const DEFAULT_PRODUCTS: Product[] = [
  { id:"classic",name:"Classic Cream",category:"แก้วเซรามิก",description:"โทนอุ่น เรียบง่าย เข้ากับทุกมุมโปรด",price:249,stock:32,badge:"ขายดี",tint:"#eee4cf",pattern:"linear-gradient(120deg,#273b30,#52745b)",mark:"slow morning" },
  { id:"terra",name:"Terra Studio",category:"แก้วเซรามิก",description:"ลายเส้นธรรมชาติ ให้ทุกวันดูพิเศษ",price:329,stock:18,badge:"ใหม่",tint:"#d8a681",pattern:"linear-gradient(135deg,#ad623d,#dc9a68)",mark:"TERRA" },
  { id:"bloom",name:"Bloom & Joy",category:"แก้วพิมพ์ลาย",description:"สีสันสดใส เติมพลังดี ๆ ให้วันของคุณ",price:299,stock:24,tint:"#d9dec8",pattern:"radial-gradient(circle at 25% 30%,#f5c95d 0 8%,transparent 9%),radial-gradient(circle at 70% 60%,#d96758 0 9%,transparent 10%),#94aa7a",mark:"BLOOM" },
  { id:"midnight",name:"Midnight Black",category:"แก้วพรีเมียม",description:"ผิวด้าน เรียบเท่ สำหรับกาแฟแก้วโปรด",price:389,stock:12,badge:"พรีเมียม",tint:"#c2b9ae",pattern:"linear-gradient(130deg,#111,#3e403c)",mark:"MAKE IT" },
  { id:"sunny",name:"Sunny Side",category:"แก้วพิมพ์ลาย",description:"ลายสดใส เหมาะเป็นของขวัญให้คนพิเศษ",price:319,stock:21,tint:"#ead5a0",pattern:"linear-gradient(120deg,#e9b73e,#eb7b4e)",mark:"GOOD DAY" },
  { id:"camp",name:"Camp Enamel",category:"แก้วพรีเมียม",description:"แข็งแรง น้ำหนักเบา พร้อมไปทุกทริป",price:359,stock:9,tint:"#bdc9c5",pattern:"linear-gradient(120deg,#315a57,#78958d)",mark:"OUTSIDE" }
];
export const baht=(v:number)=>new Intl.NumberFormat("th-TH",{style:"currency",currency:"THB",maximumFractionDigits:0}).format(v);
export function loadProducts():Product[]{try{const raw=localStorage.getItem("cupcraft-products");return raw?JSON.parse(raw):DEFAULT_PRODUCTS}catch{return DEFAULT_PRODUCTS}}
export function saveProducts(p:Product[]){localStorage.setItem("cupcraft-products",JSON.stringify(p))}
