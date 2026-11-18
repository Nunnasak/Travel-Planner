import Link from "next/link";

export function ScheduleTopBar({ q }: { q: string }) {
  return (
    <header className="topbar">
      <span />
      <form action="/schedules" className="searchbar" role="search">
        <input name="q" defaultValue={q} placeholder="Search my plans…" aria-label="Search my plans" />
        <button type="submit" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </form>
      <Link href="/schedules/new" className="btn-coral topbar-end">Create Schedule</Link>
    </header>
  );
}

export function BackTopBar({ href = "/schedules" }: { href?: string }) {
  return (
    <header className="topbar-detail">
      <Link href={href} className="back-btn">← BACK</Link>
      <span />
    </header>
  );
}
