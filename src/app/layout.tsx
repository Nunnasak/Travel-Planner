import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Mitr, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/ui/sidebar";
import Topbar from "@/components/ui/topbar";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="th" className={`${mitr.variable} ${notoSansThai.variable}`}>
      <body>
        <Topbar/>
        <Sidebar user={user ? { name: user.name, email: user.email, id: user.id } : null} />
        <div className="app-content">{children}</div>
      </body>
    </html>
  );
}