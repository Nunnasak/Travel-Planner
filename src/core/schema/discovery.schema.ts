import { z } from "zod";

// "" (an empty search box or filter) means "not set".
const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

export const CATEGORIES = [
  "NATURE",
  "CULTURE",
  "ADVENTURE",
  "MARINE",
  "WELLNESS",
  "CULINARY",
  "RELIGIOUS",
  "AGRITOURISM",
  "COMMUNITY",
  "SPORTS",
  "ENTERTAINMENT",
] as const;

// Query string of GET /api/discovery
//   q           search in plan name, description and place names
//   province_id plans that have at least one stop in this province
//   category    plan category
//   days        1, 2 or 3 match exactly; 4 means "4 days or more"
export const DAYS_OR_MORE = 4;

export const discoveryQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  province_id: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional()
  ),
  category: z.preprocess(emptyToUndefined, z.enum(CATEGORIES).optional()),
  days: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(DAYS_OR_MORE).optional()
  ),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  page_size: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(50).default(12)
  ),
});

export type DiscoveryQuery = z.output<typeof discoveryQuerySchema>;