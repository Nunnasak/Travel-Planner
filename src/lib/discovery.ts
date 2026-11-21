import type { DiscoveryService } from "@/core/service/discovery.service";

// Types are taken from what DiscoveryService returns, so the pages always match
// the data. Type-only import: safe to use from client components too.
export type DiscoveryPage = Awaited<ReturnType<DiscoveryService["list"]>>;
export type PlanItem = DiscoveryPage["items"][number];
export type PlanDetail = Awaited<ReturnType<DiscoveryService["getPublic"]>>;
export type Stop = PlanDetail["days"][number]["stops"][number];
export type Province = Awaited<ReturnType<DiscoveryService["listProvinces"]>>[number];

export const DISCOVER_FILTER_KEYS = ["province_id", "city_id", "category", "days"] as const;
