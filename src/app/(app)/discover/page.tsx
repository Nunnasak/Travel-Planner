import PlanCard from "@/components/discover/PlanCard";
import FilterPanel from "@/components/discover/FilterPanel";
import Pagination from "@/components/discover/Pagination";
import { SearchTopBar } from "@/components/discover/TopBar";
import { api, type DiscoveryPage, type Province } from "@/lib/discovery";

type SP = Promise<Record<string, string | string[] | undefined>>;
const KEYS = ["q", "province_id", "category", "days"] as const;

export default async function DiscoverPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");

  const filters = new URLSearchParams();
  KEYS.forEach((k) => get(k) && filters.set(k, get(k)));

  const query = new URLSearchParams(filters);
  query.set("page", get("page") || "1");
  query.set("page_size", "12");

  const [data, provinces] = await Promise.all([
    api<DiscoveryPage>(`/api/discovery?${query}`),
    api<Province[]>("/api/provinces"),
  ]);

  const hidden = Object.fromEntries(
    KEYS.filter((k) => k !== "q" && get(k)).map((k) => [k, get(k)])
  );

  return (
    <>
      <SearchTopBar q={get("q")} hidden={hidden} />
      <div className="page-content">
        <div className="page-header">
          <h1>Discover</h1>
          <FilterPanel provinces={provinces ?? []} />
        </div>

        {!data ? (
          <p className="empty">Couldn't load plans. Please try again.</p>
        ) : data.items.length === 0 ? (
          <p className="empty">No plans match your search.</p>
        ) : (
          <>
            <section className="plan-grid">
              {data.items.map((p) => <PlanCard key={p.schedule_id} plan={p} />)}
            </section>
            <Pagination page={data.page} totalPages={data.total_pages} params={filters} />
          </>
        )}
      </div>
    </>
  );
}