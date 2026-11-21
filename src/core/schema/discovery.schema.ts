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

// Largest value a Postgres INT column can hold.
const MAX_INT4 = 2_147_483_647;

// A database id written in plain digits ("12", not "1e1" or "0x10") that fits an
// INT column. A bigger number would make the query fail with a 500 instead of a 400/404.
export const idSchema = z.preprocess(
  (value) => (typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value),
  z.number({ error: `Must be a whole number from 1 to ${MAX_INT4}.` })
    .int()
    .positive()
    .max(MAX_INT4)
);

// Keeps skip = (page - 1) * page_size a small, safe number.
const MAX_PAGE = 10_000;

// Query string of GET /api/discovery
//   q           search in plan name, description and place names
//   province_id plans that have at least one stop in this province
//   city_id     plans that have at least one stop in this district
//   category    one or more categories, comma separated (NATURE,CULTURE)
//   days        1, 2 or 3 match exactly; 4 means "4 days or more"
export const DAYS_OR_MORE = 4;

export const discoveryQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  province_id: z.preprocess(emptyToUndefined, idSchema.optional()),
  city_id: z.preprocess(emptyToUndefined, idSchema.optional()),
  category: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) return undefined;
      const list = (Array.isArray(value) ? value : [value]).flatMap((part) =>
        typeof part === "string" ? part.split(",").filter(Boolean) : [part],
      );
      return list.length ? list : undefined;
    },
    z.array(z.enum(CATEGORIES)).max(CATEGORIES.length).optional(),
  ),
  days: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(DAYS_OR_MORE).optional()
  ),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(MAX_PAGE).default(1)),
  page_size: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(50).default(12)
  ),
});

export type DiscoveryQuery = z.output<typeof discoveryQuerySchema>;