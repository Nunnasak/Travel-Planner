import Link from "next/link";

export function SearchTopBar({ q, hidden }: { q: string; hidden: Record<string, string> }) {
  return (
    <header className="topbar">
      <span />
      <form action="/discover" className="searchbar" role="search">
        {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <input name="q" defaultValue={q} placeholder="Search plans, places, provinces…" aria-label="Search" />
        <button type="submit" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </form>
      <Link href="/schedule/new" className="btn-coral topbar-end">Create Schedule</Link>
    </header>
  );
}

export function DetailTopBar() {
  return (
    <header className="topbar-detail">
      <Link href="/discover" className="back-btn">← BACK</Link>
      <Link href="/schedule/new" className="btn-coral">Create Schedule</Link>
    </header>
  );
}