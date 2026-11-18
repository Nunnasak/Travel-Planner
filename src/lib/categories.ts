import type { CATEGORIES } from "@/core/schema/discovery.schema";

type CategoryKey = (typeof CATEGORIES)[number];
type CategoryInfo = { label: string; tint: string };

// Thai labels follow the @map values of enum Category in prisma/schema.prisma.
// `satisfies` makes TypeScript fail if a category from the API is missing here.
const MAP = {
  NATURE:        { label: "ธรรมชาติ",  tint: "#D3F3EE" },
  CULTURE:       { label: "วัฒนธรรม",  tint: "#FFF0C2" },
  ADVENTURE:     { label: "ผจญภัย",    tint: "#FFDDD6" },
  MARINE:        { label: "ทางทะเล",   tint: "#D6F1F7" },
  WELLNESS:      { label: "สุขภาพ",    tint: "#E6E0FF" },
  CULINARY:      { label: "อาหาร",     tint: "#FFF0C2" },
  RELIGIOUS:     { label: "ศาสนา",     tint: "#E6E0FF" },
  AGRITOURISM:   { label: "เกษตร",     tint: "#D3F3EE" },
  COMMUNITY:     { label: "ชุมชน",     tint: "#FFDDD6" },
  SPORTS:        { label: "กีฬา",      tint: "#D6F1F7" },
  ENTERTAINMENT: { label: "บันเทิง",   tint: "#FFDDD6" },
} satisfies Record<CategoryKey, CategoryInfo>;

export function categoryInfo(key: string): CategoryInfo {
  return MAP[key as CategoryKey] ?? { label: key, tint: "#D3F3EE" };
}

export const CATEGORY_KEYS = Object.keys(MAP) as CategoryKey[];
