import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const thai = IBM_Plex_Sans_Thai({ variable: "--font-thai", weight: ["300","400","500","600","700"], subsets: ["thai","latin"] });
const display = Cormorant_Garamond({ variable: "--font-display", weight: ["500","600","700"], subsets: ["latin"] });
export const metadata: Metadata = { title: "CupCraft — แก้วที่เป็นคุณ", description: "ร้านแก้วดีไซน์และแก้วสั่งทำ" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="th" className={`${thai.variable} ${display.variable}`}><body>{children}</body></html>; }
