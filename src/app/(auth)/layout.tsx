import Link from "next/link";
import type { ReactNode } from "react";
import Sidebar from "@/components/ui/sidebar";

export default function AuthLayout({ children }: { children: ReactNode }) {
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