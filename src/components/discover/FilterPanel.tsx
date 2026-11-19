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

      <aside
        className={`filter-panel ${open ? "is-open" : ""}`}
        aria-label="Filters"
        aria-hidden={!open}
      >
        <div className="filter-head">
          <span>filter</span>
          <button
            type="button"
            className="filter-close"
            aria-label="Close filter"
            onClick={() => setOpen(false)}
          >
            [X]
          </button>
        </div>

        <div className="select-wrap">
          <select
            className="select"
            value={province}
            onChange={(e) => update({ province_id: e.target.value })}
          >
            <option value="">Province</option>
            {provinces.map((p) => (
              <option key={p.province_id} value={p.province_id}>
                {p.province_name}
              </option>
            ))}
          </select>
          <svg className="select-chevron" viewBox="0 0 12 8" fill="none" aria-hidden="true">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="select-wrap">
          <select className="select" disabled title="Not supported by the API yet">
            <option>District</option>
          </select>
          <svg className="select-chevron" viewBox="0 0 12 8" fill="none" aria-hidden="true">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="accordion">
          <button
            type="button"
            className="accordion-title"
            aria-expanded={catOpen}
            onClick={() => setCatOpen(!catOpen)}
          >
            <span>Category</span>
            <svg
              className={`accordion-chevron ${catOpen ? "is-open" : ""}`}
              viewBox="0 0 12 8"
              fill="none"
              aria-hidden="true"
            >
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className={`accordion-body ${catOpen ? "is-open" : ""}`}>
            <div className="accordion-inner">
              <input
                type="search"
                className="cat-search"
                placeholder="search"
                value={catQuery}
                onChange={(e) => setCatQuery(e.target.value)}
              />
              <div className="check-list">
                {cats.map((k) => {
                  const isChecked = category === k;
                  return (
                    <label key={k} className={`check-row ${isChecked ? "is-checked" : ""}`}>
                      <input
                        type="checkbox"
                        className="check"
                        checked={isChecked}
                        onChange={() => update({ category: isChecked ? "" : k })}
                      />
                      <span className="check-box" aria-hidden="true" />
                      <span className="check-label">{categoryInfo(k).label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className={`filter-clear-wrap ${active > 0 ? "is-visible" : ""}`}>
          <button
            type="button"
            className="filter-clear"
            onClick={() => update({ province_id: "", category: "" })}
          >
            Clear filters
          </button>
        </div>
      </aside>
    </>
  );
}