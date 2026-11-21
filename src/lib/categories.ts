import type { CATEGORIES } from "@/core/schema/discovery.schema";

type CategoryKey = (typeof CATEGORIES)[number];
export const TINTS = ["mint", "butter", "peach", "sky", "lilac"] as const;
type Tint = (typeof TINTS)[number];
type CategoryInfo = { label: string; tint: Tint };

// Thai labels follow the @map values of enum Category in prisma/schema.prisma.
// `satisfies` makes TypeScript fail if a category from the API is missing here.
const MAP = {
  NATURE:        { label: "ธรรมชาติ",  tint: "mint" },
  CULTURE:       { label: "วัฒนธรรม",  tint: "butter" },
  ADVENTURE:     { label: "ผจญภัย",    tint: "peach" },
  MARINE:        { label: "ทางทะเล",   tint: "sky" },
  WELLNESS:      { label: "สุขภาพ",    tint: "lilac" },
  CULINARY:      { label: "อาหาร",     tint: "butter" },
  RELIGIOUS:     { label: "ศาสนา",     tint: "lilac" },
  AGRITOURISM:   { label: "เกษตร",     tint: "mint" },
  COMMUNITY:     { label: "ชุมชน",     tint: "peach" },
  SPORTS:        { label: "กีฬา",      tint: "sky" },
  ENTERTAINMENT: { label: "บันเทิง",   tint: "peach" },
} satisfies Record<CategoryKey, CategoryInfo>;

export function categoryInfo(key: string): CategoryInfo {
  return MAP[key as CategoryKey] ?? { label: key, tint: "mint" };
}

export const CATEGORY_KEYS = Object.keys(MAP) as CategoryKey[];

export function tintClass(tint: Tint): string {
  return `tint-${tint}`;
}

export function coverTintClass(keys: string[]): string {
  return tintClass(categoryInfo(keys[0] ?? "").tint);
}
