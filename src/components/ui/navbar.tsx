"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/ui/logo";
import NavSearch, { NavSearchFallback, hasSearch } from "@/components/ui/nav-search";
import UserMenu, { type NavUser } from "@/components/ui/user-menu";
import { useSessionSync } from "@/components/ui/use-session-sync";

const LINKS = [
  { label: "สำรวจทริป", href: "/discover" },
  { label: "แผนของฉัน", href: "/schedules" },
];

const AUTH_PAGES = ["/login", "/register"];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar({ user }: { user: NavUser | null }) {
  const pathname = usePathname();
  const searchable = hasSearch(pathname);
  useSessionSync(user);

  return (
    <header className={`nav${searchable ? " has-search" : ""}`}>
      <Link href="/discover" className="nav-brand" aria-label="ไปเรื่อย ไปหน้าสำรวจทริป">
        <Logo className="nav-logo" />
        <span>ไปเรื่อย</span>
      </Link>

      <nav className="nav-links" aria-label="เมนูหลัก">
        {LINKS.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {searchable && (
        <Suspense fallback={<NavSearchFallback />}>
          <NavSearch />
        </Suspense>
      )}

      <div className="nav-end">
        {user ? (
          <>
            {pathname !== "/schedules/new" && (
              <Link href="/schedules/new" className="nav-create nav-create-compact" aria-label="สร้างแผนใหม่">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>สร้างแผนใหม่</span>
              </Link>
            )}
            <UserMenu user={user} />
          </>
        ) : (
          !AUTH_PAGES.includes(pathname) && (
            <>
              <Link href="/login" className="nav-link">เข้าสู่ระบบ</Link>
              <Link href="/register" className="nav-create nav-signup">สมัครสมาชิก</Link>
            </>
          )
        )}
      </div>
    </header>
  );
}
