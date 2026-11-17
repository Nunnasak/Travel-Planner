export type PlanItem = {
  schedule_id: number; schedule_name: string; description: string | null;
  total_day: number; category: string; cover_url: string | null;
  owner: string; provinces: string[]; place_count: number;
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