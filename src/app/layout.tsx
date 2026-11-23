import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/bai-jamjuree/thai-500.css";
import "@fontsource/bai-jamjuree/thai-600.css";
import "@fontsource/bai-jamjuree/thai-700.css";
import "@fontsource/bai-jamjuree/latin-500.css";
import "@fontsource/bai-jamjuree/latin-600.css";
import "@fontsource/bai-jamjuree/latin-700.css";
import "@fontsource/ibm-plex-sans-thai-looped/thai-400.css";
import "@fontsource/ibm-plex-sans-thai-looped/thai-500.css";
import "@fontsource/ibm-plex-sans-thai-looped/thai-600.css";
import "@fontsource/ibm-plex-sans-thai-looped/latin-400.css";
import "@fontsource/ibm-plex-sans-thai-looped/latin-500.css";
import "@fontsource/ibm-plex-sans-thai-looped/latin-600.css";
import "./globals.css";
import Navbar from "@/components/ui/navbar";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  icons:{icon: '/icon.svg',},
  title: "ไปเรื่อย",
  description: "วางแผนเที่ยวทั่วไทยทีละวัน แล้วแชร์ให้เพื่อนช่วยกันแก้",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="th">
      <body>
        <Navbar user={user ? { name: user.name, email: user.email, id: user.id } : null} />
        {children}
      </body>
    </html>
  );
}