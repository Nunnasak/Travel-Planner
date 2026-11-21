"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DISCOVER_FILTER_KEYS } from "@/lib/discovery";

type SearchPage = {
  placeholder: string;
  keep: readonly string[]; // filter ที่ต้องคงไว้ตอนค้นหาใหม่ (ไม่รวม q และ page)
};

const SEARCH_PAGES: Record<string, SearchPage> = {
  "/discover": {
    placeholder: "Search plans, places, provinces…",
    keep: DISCOVER_FILTER_KEYS,
  },
  "/schedules": {
    placeholder: "Search my schedules…",
    keep: [], // ใส่ชื่อ filter ของหน้า My Schedules ถ้ามี
  },
};

export default function Topbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = SEARCH_PAGES[pathname]; // undefined = หน้านี้ไม่มีช่องค้นหา
  if (!page) return <header className="topbar" />;

  const searchText = searchParams.get("q") ?? "";

  const filters = page.keep.flatMap((name) => {
    const value = searchParams.get(name);
    return value ? [[name, value] as const] : [];
  });

  return (
    <header className="topbar">
      <form action={pathname} className="topbar-search" role="search">
        {filters.map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <input
          key={searchText}
          name="q"
          defaultValue={searchText}
          placeholder={page.placeholder}
          aria-label="Search"
        />
        <button type="submit" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </form>
      <Link href="/schedules/new" className="btn-coral topbar-end">Create Schedule</Link>
    </header>
  );
}