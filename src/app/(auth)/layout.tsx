import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (user) redirect("/discover");
  return (
    <div className="auth-page">
      <aside className="auth-art">
        <p className="auth-art-title">
          <span>วางแผนเที่ยวทีละวัน</span> <span>แล้วแชร์ให้เพื่อน</span> <span>ช่วยกันแก้</span>
        </p>
        <svg className="auth-route" viewBox="0 0 360 150" aria-hidden="true">
          <path d="M12 120 C80 120 70 36 150 36 S230 116 282 86 S338 26 348 26" />
          <circle cx="12" cy="120" r="9" />
          <circle cx="150" cy="36" r="9" />
          <circle cx="282" cy="86" r="9" />
          <circle cx="348" cy="26" r="9" />
        </svg>
        <ul className="auth-points">
          <li>ค้นหาแผนเที่ยวทั่วไทยที่คนอื่นแชร์ไว้</li>
          <li>จัดจุดแวะและเวลาแยกตามวัน</li>
          <li>ดูเส้นทางแต่ละวันบนแผนที่</li>
        </ul>
      </aside>
      <main className="auth-inner">
        {children}
      </main>
    </div>
  );
}
