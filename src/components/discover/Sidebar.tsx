"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo"; // keep your existing import line

const links = [
  { href: "/discover", label: "Discover", letter: "D" },
  { href: "/schedules", label: "My Schedule", letter: "S" },
];

export default function Sidebar({ userName = "Guest" }: { userName?: string }) {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <Link href="/discover" className="sidebar-logo" aria-label="ไปเรื่อย"><Logo /></Link>
        <hr className="sidebar-rule" />
        <nav className="sidebar-nav">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-item" title={l.label} aria-label={l.label}
              aria-current={path.startsWith(l.href) ? "page" : undefined}>
              {l.letter}
            </Link>
          ))}
        </nav>
      </div>
      <div className="avatar-frame" title={userName}>
        <span className="avatar">{userName[0]?.toUpperCase()}</span>
      </div>
    </aside>
  );
}