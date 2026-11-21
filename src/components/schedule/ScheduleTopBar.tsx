import Link from "next/link";

export function BackTopBar({ href = "/schedules" }: { href?: string }) {
  return (
    <header className="topbar-detail">
      <Link href={href} className="back-btn">← BACK</Link>
      <span />
    </header>
  );
}
