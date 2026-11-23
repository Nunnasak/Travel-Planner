"use client";

import { useEffect, useState } from "react";
import SelectMenu from "@/components/ui/select-menu";
import { categoryInfo, CATEGORY_KEYS } from "@/lib/categories";
import type { Province } from "@/lib/discovery";
import { dayOptions, useDiscoverParams } from "./use-discover-params";

const DAY_OPTIONS = dayOptions("กี่วันก็ได้");

type City = { city_id: number; city_name: string };

export default function DiscoverQuery({ provinces }: { provinces: Province[] }) {
  const { params, update } = useDiscoverParams();
  const province = params.get("province_id") ?? "";
  const city = params.get("city_id") ?? "";
  const days = params.get("days") ?? "";
  const selected = (params.get("category") ?? "").split(",").filter(Boolean);
  const [cities, setCities] = useState<{ province: string; list: City[] }>({ province: "", list: [] });

  useEffect(() => {
    if (!province) return;
    let cancelled = false;
    fetch(`/api/provinces/${province}/cities`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list: City[]) => !cancelled && setCities({ province, list }))
      .catch(() => !cancelled && setCities({ province, list: [] }));
    return () => {
      cancelled = true;
    };
  }, [province]);

  const cityList = cities.province === province ? cities.list : [];

  function toggleCategory(key: string) {
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];
    update({ category: next.join(",") });
  }

  return (
    <div className="discover-query">
      <h1 className="query-sentence">
        <span>อยากไป</span>
        <span className="query-slot">
          <SelectMenu
            variant="plain"
            label="จังหวัด"
            value={province}
            options={[
              { value: "", label: "ที่ไหนก็ได้" },
              ...provinces.map((p) => ({ value: String(p.province_id), label: p.province_name })),
            ]}
            onChange={(next) => update({ province_id: next, city_id: "" })}
          />
        </span>
        {province && (
          <span className="query-slot">
            <SelectMenu
              variant="plain"
              label="อำเภอ"
              value={city}
              options={[
                { value: "", label: "ทุกอำเภอ" },
                ...cityList.map((c) => ({ value: String(c.city_id), label: c.city_name })),
              ]}
              onChange={(next) => update({ city_id: next })}
            />
          </span>
        )}
        <span>สัก</span>
        <span className="query-slot">
          <SelectMenu
            variant="plain"
            label="จำนวนวัน"
            value={days}
            options={DAY_OPTIONS}
            onChange={(next) => update({ days: next })}
          />
        </span>
      </h1>

      <div className="category-chips" role="group" aria-label="หมวดหมู่">
        <button
          type="button"
          className="category-chip"
          aria-pressed={selected.length === 0}
          onClick={() => update({ category: "" })}
        >
          ทั้งหมด
        </button>
        {CATEGORY_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="category-chip"
            aria-pressed={selected.includes(key)}
            onClick={() => toggleCategory(key)}
          >
            {categoryInfo(key).label}
          </button>
        ))}
      </div>
    </div>
  );
}
