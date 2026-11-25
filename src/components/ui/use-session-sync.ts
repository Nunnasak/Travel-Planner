"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { sessionChanged, type SessionSnapshot } from "@/lib/session-sync";

const CHECK_EVERY_MS = 30_000;

// Root layout ไม่ render ใหม่ตอนเปลี่ยนหน้า navbar จึงค้าง user เดิมไว้
// ถ้า session ถูกลบจากเครื่องอื่น ("ออกจากระบบทุกอุปกรณ์") hook นี้จะเช็คกับ server
// แล้ว refresh ให้ navbar และหน้าปัจจุบันตรงกับสถานะจริง
export function useSessionSync(shown: SessionSnapshot) {
  const router = useRouter();
  const pathname = usePathname();
  const shownRef = useRef(shown);
  const checkRef = useRef<() => void>(() => {});

  useEffect(() => {
    shownRef.current = shown;
  }, [shown]);

  useEffect(() => {
    let stopped = false;
    let checking = false;

    async function check() {
      if (stopped || checking || document.hidden) return;
      checking = true;
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (!res.ok) return;
        const { user } = (await res.json()) as { user: SessionSnapshot };
        if (stopped || !sessionChanged(shownRef.current, user)) return;
        shownRef.current = user;
        router.refresh();
      } catch {
        // network ล้ม ไว้เช็ครอบหน้า
      } finally {
        checking = false;
      }
    }
    checkRef.current = () => void check();

    const timer = setInterval(check, CHECK_EVERY_MS);
    const onVisible = () => {
      if (!document.hidden) void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [router]);

  // เช็คทุกครั้งที่เปลี่ยนหน้า
  useEffect(() => {
    checkRef.current();
  }, [pathname]);
}
