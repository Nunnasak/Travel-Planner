"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { categoryInfo, CATEGORY_KEYS } from "@/lib/categories";
import type { Province } from "@/lib/discovery";

export default function FilterPanel({ provinces }: { provinces: Province[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(true);
  const [catQuery, setCatQuery] = useState("");

  const province = sp.get("province_id") ?? "";
  const category = sp.get("category") ?? "";
  const active = (province ? 1 : 0) + (category ? 1 : 0);

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(changes)) v ? next.set(k, v) : next.delete(k);
    next.delete("page");
    router.push(`/discover?${next}`);
  }

  const q = catQuery.trim().toLowerCase();
  const cats = CATEGORY_KEYS.filter(
    (k) => !q || k.toLowerCase().includes(q) || categoryInfo(k).label.includes(q)
  );

  return (
    <>
      <button type="button" className="filter-trigger" onClick={() => setOpen(true)}>
        Filter{active ? ` (${active})` : ""}
      </button>

      {open && (
        <aside className="filter-panel" aria-label="Filters">
          <div className="filter-head">
            <span>Filter</span>
            <button type="button" aria-label="Close filter" onClick={() => setOpen(false)}>✕</button>
          </div>

          <select className="select" value={province} onChange={(e) => update({ province_id: e.target.value })}>
            <option value="">Province</option>
            {provinces.map((p) => (
              <option key={p.province_id} value={p.province_id}>{p.province_name}</option>
            ))}
          </select>

          <select className="select" disabled title="Not supported by the API yet">
            <option>District</option>
          </select>

          <div className="accordion">
            <button type="button" className="accordion-title" onClick={() => setCatOpen(!catOpen)}>
              <span>Category</span><span>{catOpen ? "˄" : "˅"}</span>
            </button>
            {catOpen && (
              <>
                <input type="search" placeholder="search" value={catQuery} onChange={(e) => setCatQuery(e.target.value)} />
                {cats.map((k) => (
                  <label key={k} className="check-row">
                    <input type="checkbox" className="check" checked={category === k}
                      onChange={() => update({ category: category === k ? "" : k })} />
                    {categoryInfo(k).label}
                  </label>
                ))}
              </>
            )}
          </div>

          {active > 0 && (
            <button type="button" className="filter-clear" onClick={() => update({ province_id: "", category: "" })}>
              Clear filters
            </button>
          )}
        </aside>
      )}
    </>
  );
}