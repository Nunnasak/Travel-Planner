import Link from "next/link";
import DiscoverQuery from "@/components/discover/DiscoverQuery";
import PlanCard from "@/components/discover/PlanCard";
import Pagination from "@/components/discover/Pagination";
import { ZodError } from "zod";
import { discoveryService } from "@/infrastructure/container";
import { DISCOVER_FILTER_KEYS } from "@/lib/discovery";

// A bad query value (e.g. ?page=abc) or a database error shows the
// "Couldn't load plans" message instead of the Next.js error page.
async function orNull<T>(load: Promise<T>): Promise<T | null> {
  try {
    return await load;
  } catch (error) {
    if (!(error instanceof ZodError)) console.error(error);
    return null;
  }
}

type SP = Promise<Record<string, string | string[] | undefined>>;
const KEYS = ["q", ...DISCOVER_FILTER_KEYS] as const;

export default async function DiscoverPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");

  const filters = new URLSearchParams();
  KEYS.forEach((k) => get(k) && filters.set(k, get(k)));

  const query = new URLSearchParams(filters);
  query.set("page", get("page") || "1");
  query.set("page_size", "24");

  const [data, provinces] = await Promise.all([
    orNull(discoveryService.list(Object.fromEntries(query))),
    orNull(discoveryService.listProvinces()),
  ]);

  const filtered = filters.size > 0;
  const hasFilters = DISCOVER_FILTER_KEYS.some((k) => get(k));
  const clearHref = get("q") ? `/discover?${new URLSearchParams({ q: get("q") })}` : "/discover";

  return (
    <div className="page-content discover-page">
      <DiscoverQuery provinces={provinces ?? []} />

      <div className="results-bar">
        <p className="results-count">{data ? `${data.total} แผน` : ""}</p>
        {hasFilters && <Link href={clearHref} className="results-clear">ล้างตัวกรอง</Link>}
      </div>

      {!data ? (
        <p className="empty">โหลดแผนไม่สำเร็จ รีเฟรชหน้าแล้วลองอีกครั้ง</p>
      ) : data.items.length === 0 ? (
        <div className="empty">
          <p>{filtered ? "ไม่มีแผนที่ตรงกับที่ค้นหา" : "ยังไม่มีใครโพสต์แผนเที่ยว"}</p>
          {filtered && <Link href="/discover" className="empty-action">ล้างการค้นหา</Link>}
        </div>
      ) : (
        <>
          <section className="plan-grid">
            {data.items.map((p, i) => <PlanCard key={p.schedule_id} plan={p} eager={i < 4} />)}
          </section>
          <Pagination page={data.page} totalPages={data.total_pages} params={filters} />
        </>
      )}
    </div>
  );
}