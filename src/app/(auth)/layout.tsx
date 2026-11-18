import Link from "next/link";
import type { ReactNode } from "react";
import Sidebar from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (user) redirect("/discover");
  return (
    <div className="auth-page">
      <div className="blob blob-teal" />
      <div className="blob blob-yellow" />
      <div className="blob blob-coral" /> 
      <main className="auth-inner">   
        {children}
      </main>
    </div>
  );
}