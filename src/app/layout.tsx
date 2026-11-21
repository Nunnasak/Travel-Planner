import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/mitr/thai-500.css";
import "@fontsource/mitr/thai-600.css";
import "@fontsource/mitr/latin-500.css";
import "@fontsource/mitr/latin-600.css";
import "@fontsource/noto-sans-thai/thai-400.css";
import "@fontsource/noto-sans-thai/thai-500.css";
import "@fontsource/noto-sans-thai/thai-600.css";
import "@fontsource/noto-sans-thai/latin-400.css";
import "@fontsource/noto-sans-thai/latin-500.css";
import "@fontsource/noto-sans-thai/latin-600.css";
import "./globals.css";
import Sidebar from "@/components/ui/sidebar";
import Topbar from "@/components/ui/topbar";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  icons:{icon: '/icon.svg',},
  title: "ไปเรื่อย",
  description: "Plan your trip around Thailand",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="th">
      <body>
        <Topbar/>
        <Sidebar user={user ? { name: user.name, email: user.email, id: user.id } : null} />
        {children}
      </body>
    </html>
  );
}