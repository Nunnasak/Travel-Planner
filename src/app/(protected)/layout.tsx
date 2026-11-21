import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) { redirect("/login"); }

  return (
    <div className="protected-page">
      <main className="protected-inner">
        {children}
      </main>
    </div>
  );
}