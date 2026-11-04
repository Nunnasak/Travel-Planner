import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <div className="blob blob-teal" />
      <div className="blob blob-yellow" />
      <div className="blob blob-coral" />

      <main className="auth-inner">
        <Link href="/" className="auth-brand" aria-label="ไปเรื่อย home">
          <Logo />
          <span>ไปเรื่อย</span>
        </Link>
        {children}
      </main>
    </div>
  );
}