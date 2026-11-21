"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { categoryInfo, CATEGORY_KEYS } from "@/lib/categories";
import { DAYS_OR_MORE } from "@/core/schema/discovery.schema";
import type { Province } from "@/lib/discovery";

const DAY_OPTIONS = Array.from({ length: DAYS_OR_MORE }, (_, i) => i + 1);

export default function FilterPanel({ provinces }: { provinces: Province[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(true);
  const [catQuery, setCatQuery] = useState("");
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const province = sp.get("province_id") ?? "";
  const city = sp.get("city_id") ?? "";
  const selected = (sp.get("category") ?? "").split(",").filter(Boolean);
  const days = sp.get("days") ?? "";
  const active = (province ? 1 : 0) + (city ? 1 : 0) + (days ? 1 : 0) + selected.length;
  const [cities, setCities] = useState<{ city_id: number; city_name: string }[]>([]);

  useEffect(() => {
    if (!province) return setCities([]);
    let cancelled = false;
    fetch(`/api/provinces/${province}/cities`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => !cancelled && setCities(list))
      .catch(() => !cancelled && setCities([]));
    return () => {
      cancelled = true;
    };
  }, [province]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  function toggleCategory(key: string) {
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];
    update({ category: next.join(",") });
  }

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
      <button type="button" ref={triggerRef} className="filter-trigger" onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        Filter
        {active > 0 && <span className="filter-count">{active}</span>}
      </button>

      <aside
        ref={panelRef}
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="select-wrap">
          <select
            className="select"
            value={province}
            onChange={(e) => update({ province_id: e.target.value, city_id: "" })}
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
          <select
            className="select"
            value={city}
            disabled={!province}
            title={province ? undefined : "Pick a province first"}
            onChange={(e) => update({ city_id: e.target.value })}
          >
            <option value="">District</option>
            {cities.map((c) => (
              <option key={c.city_id} value={c.city_id}>
                {c.city_name}
              </option>
            ))}
          </select>
          <svg className="select-chevron" viewBox="0 0 12 8" fill="none" aria-hidden="true">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="select-wrap">
          <select
            className="select"
            value={days}
            aria-label="Days"
            onChange={(e) => update({ days: e.target.value })}
          >
            <option value="">Days</option>
            {DAY_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n === DAYS_OR_MORE ? `${n}+ days` : `${n} ${n === 1 ? "day" : "days"}`}
              </option>
            ))}
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
                  const isChecked = selected.includes(k);
                  return (
                    <label key={k} className={`check-row ${isChecked ? "is-checked" : ""}`}>
                      <input
                        type="checkbox"
                        className="check"
                        checked={isChecked}
                        onChange={() => toggleCategory(k)}
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
            onClick={() => update({ province_id: "", city_id: "", days: "", category: "" })}
          >
            Clear filters
          </button>
        </div>
      </aside>
    </>
  );
}