import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Mitr, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const mitr = Mitr({
  subsets: ["thai", "latin"],
  weight: ["500", "600"],
  variable: "--font-mitr",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ไปเรื่อย",
  description: "Plan your trip around Thailand",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${mitr.variable} ${notoSansThai.variable}`}>
      <body>{children}</body>
    </html>
  );
}