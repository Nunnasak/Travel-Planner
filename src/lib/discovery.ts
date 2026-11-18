// Shapes returned by /api/discovery (see src/core/service/discovery.service.ts).
export type Owner = { user_id: number; username: string };

export type PlanItem = {
  schedule_id: number; schedule_name: string; description: string | null;
  total_day: number; category: string; cover_url: string | null;
  owner: Owner; provinces: string[]; place_count: number;
};

export type StopLocation = {
  location_id: number; name: string; address: string; image_url: string | null;
  city: { city_name: string; province: { province_id: number; province_name: string } };
};
export type Stop = {
  item_id: number; sequence_no: number; visit_time: string; location: StopLocation;
};
export type PlanDetail = {
  schedule_id: number; schedule_name: string; description: string | null;
  total_day: number; category: string; cover_url: string | null; owner: Owner;
  days: { day_no: number; stops: Stop[] }[];
};
export type DiscoveryPage = {
  items: PlanItem[]; page: number; page_size: number; total: number; total_pages: number;
};
export type Province = { province_id: number; province_name: string };

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function api<T>(path: string): Promise<T | null> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  return res.ok ? ((await res.json()) as T) : null;
}