"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { DISCOVER_FILTER_KEYS } from "@/lib/discovery";

type SearchPage = {
  placeholder: string;
  keep: readonly string[];
};

const SEARCH_PAGES: Record<string, SearchPage> = {
  "/discover": {
    placeholder: "ค้นหาแผน สถานที่ หรือจังหวัด",
    keep: DISCOVER_FILTER_KEYS,
  },
  "/schedules": {
    placeholder: "ค้นหาแผนของฉัน",
    keep: [],
  },
};

export function hasSearch(pathname: string) {
  return pathname in SEARCH_PAGES;
}

export function NavSearchFallback() {
  return <div className="nav-search" aria-hidden="true" />;
}

export default function NavSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = SEARCH_PAGES[pathname];
  if (!page) return null;

  const searchText = searchParams.get("q") ?? "";
  const filters = page.keep.flatMap((name) => {
    const value = searchParams.get(name);
    return value ? [[name, value] as const] : [];
  });

  return (
    <form action={pathname} className="nav-search" role="search">
      {filters.map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <input
        key={searchText}
        name="q"
        defaultValue={searchText}
        placeholder={page.placeholder}
        aria-label="ค้นหา"
      />
      <button type="submit" aria-label="ค้นหา">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}
