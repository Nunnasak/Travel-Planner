"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { postJson } from "@/lib/api-client";
import { NETWORK_ERROR } from "@/lib/messages";

export type NavUser = { name: string; email: string; id: number };

function initialOf(name: string) {
  return Array.from(name.trim())[0]?.toUpperCase() ?? "?";
}

export default function UserMenu({ user }: { user: NavUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setError("");
    try {
      const result = await postJson("/api/auth/logout", {});
      if (result.ok) {
        setOpen(false);
        router.push("/login");
        router.refresh();
        return;
      }
      setError(result.data.message ?? "ออกจากระบบไม่สำเร็จ ลองอีกครั้ง");
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="nav-user" ref={wrapRef}>
      <button
        type="button"
        className="nav-avatar"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`เมนูบัญชีของ ${user.name}`}
        onClick={() => setOpen((value) => !value)}
      >
        {initialOf(user.name)}
      </button>

      {open && (
        <div className="nav-menu" role="menu">
          <div className="nav-menu-head">
            <strong>{user.name}</strong>
            <span>#{String(user.id).padStart(6, "0")}</span>
            <span>{user.email}</span>
          </div>
          <Link href="/account" role="menuitem" onClick={() => setOpen(false)}>
            บัญชีของฉัน
          </Link>
          <button type="button" role="menuitem" onClick={logout} disabled={loggingOut}>
            {loggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
          </button>
          {error && <p className="nav-menu-error" role="alert">{error}</p>}
        </div>
      )}
    </div>
  );
}
