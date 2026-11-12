"use client";

import { useState } from "react";
import { GlobeIcon, CalendarIcon } from "./icon";
import { Logo } from "@/components/ui/logo";

const items = [
  { key: "D", label: "Discover", icon: GlobeIcon },
  { key: "S", label: "My Schedule", icon: CalendarIcon },
];

export default function Sidebar() {
    const [open, setOpen] = useState(false);
    const [locked, setLocked] = useState(false); // กันเปิดกลับทันทีหลังกดหุบ
    const [active, setActive] = useState("D");
    const [menuOpen, setMenuOpen] = useState(false);

    const collapse = () => {
        setOpen(false);
        setLocked(true);
        setMenuOpen(false);
    };

    const collapseByOverlay = () => {
        setOpen(false);
        setMenuOpen(false);
    };

    return (
        <>
            <div
                className={`sb-overlay ${open ? "is-open" : ""}`}
                onClick={collapseByOverlay}
            />

            <aside
                className={`sb ${open ? "is-open" : ""}`}
                onMouseEnter={() => {
                    if (!locked) setOpen(true);   // ใช้ locked ตรงนี้
                }}
                onMouseLeave={() => setLocked(false)} // เมาส์ออก ปลดล็อก
            >
                {/* ส่วนหัว */}
                <div className="sb-head">
                    {open ? (
                        <>
                            <div className="sb-brand">
                                <Logo className="sb-brand-title"/>
                                <div className="sb-brand-sub">ไปเรื่อย</div>
                            </div>
                            <button
                                className="sb-collapse"
                                aria-label="Collapse sidebar"
                                onClick={collapse}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M9 3v18" />
                                </svg>
                            </button>
                        </>
                    ) : (
                        <Logo className="sb-logo-mini"/>
                    )}
                </div>

                <div className="sb-divider" />

                {/* เมนู */}
                <nav className="sb-nav">
                    {items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.key}
                                className={`sb-item ${active === item.key ? "is-active" : ""}`}
                                onClick={() => setActive(item.key)}
                            >
                                <Icon className="sb-icon" />
                                {open && <span className="sb-label">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* ผู้ใช้ */}
                <div className="sb-user-wrap">
                    {open && menuOpen && (
                        <div className="sb-menu">
                            <button>mail</button>
                            <button>Account</button>
                            <div className="sb-menu-line" />
                            <button className="strong">Logout</button>
                        </div>
                    )}

                    <button
                        className="sb-user"
                        onClick={() => open && setMenuOpen(!menuOpen)}
                    >
                        <span className="sb-avatar">U</span>
                        {open && <span className="sb-username">user name</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}