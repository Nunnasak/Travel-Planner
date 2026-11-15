"use client";

import { useState } from "react";
import { GlobeIcon, CalendarIcon, UserIcon } from "./icon";
import { Logo } from "@/components/ui/logo";
import { pickFieldErrors, postJson } from "@/lib/api-client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type SidebarUser = {
    name: string;
    email: string;
    id: number;
} | null;

const items = [
    { key: "D", label: "Discover", icon: GlobeIcon, href: "/discover" },
    { key: "S", label: "My Schedule", icon: CalendarIcon, href: "/schdules" },
];

export default function Sidebar({ user }: { user: SidebarUser | null }) {
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const collapseByOverlay = () => {
        setOpen(false);
        setMenuOpen(false);
    };

    async function clickLogout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            const result = await postJson("/api/auth/logout", {});
            if (result.ok) {
                setMenuOpen(false);
                router.push("/login");
                router.refresh();
            }
        } catch {
            // เชื่อมต่อไม่ได้
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <>
            <div
                className={`sb-overlay ${open ? "is-open" : ""}`}
                onClick={collapseByOverlay}
            />

            <aside
                className={`sb ${open ? "is-open" : ""}`}
                onMouseEnter={() => {
                    setOpen(true);   // ใช้ locked ตรงนี้
                }}
                onMouseLeave={() => setOpen(false)} // เมาส์ออก ปลดล็อก
            >
                {/* ส่วนหัว */}
                <Link href="/discover" className="sb-head" aria-label="Go to home">
                    <Logo className="sb-logo" />
                    <div className="sb-brand-sub">ไปเรื่อย</div>
                </Link>

                <div className="sb-divider" />

                {/* เมนู */}
                <nav className="sb-nav">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + "/");

                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`sb-item ${isActive ? "is-active" : ""}`}
                            >
                                <Icon className="sb-icon" />
                                {open && <span className="sb-label">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* ผู้ใช้ */}
                <div className="sb-user-wrap">
                    {user ? (
                        <>
                            {open && menuOpen && (
                                <div className="sb-menu">
                                    <div className="sb-menu-info">{user.email}</div>
                                    <Link href="/account" className="sb-menu-link">Account</Link>
                                    <div className="sb-menu-line" />
                                    <button
                                        onClick={clickLogout}
                                        disabled={loggingOut}
                                        className="strong">
                                        {loggingOut ? "Logging out..." : "Logout"}
                                    </button>
                                </div>
                            )}

                            <button className="sb-user" onClick={() => open && setMenuOpen(!menuOpen)}>
                                <span className="sb-avatar"><UserIcon /></span>
                                <span className="sb-username">{user.name}  <span className="sb-userid">#{String(user.id).padStart(6, '0')}</span></span>
                            </button>
                        </>
                    ) : (
                        <>
                            {open && menuOpen && (
                                <div className="sb-menu">
                                    <Link href="/login" className="sb-menu-link">Log in</Link>
                                    <div className="sb-menu-line" />
                                    <Link href="/register" className="sb-menu-link">Sign up</Link>
                                </div>
                            )}

                            <button className="sb-user" onClick={() => open && setMenuOpen(!menuOpen)}>
                                <span className="sb-avatar"><UserIcon /></span>
                                <span className="sb-username">Guest</span>
                            </button>
                        </>
                    )}
                </div>
            </aside>
        </>
    );
}