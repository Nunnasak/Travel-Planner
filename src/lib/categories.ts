const MAP: Record<string, { label: string; tint: string }> = {
  NATURE:        { label: "ธรรมชาติ", tint: "#D3F3EE" },
  CULTURE:       { label: "วัฒนธรรม", tint: "#FFF0C2" },
  MARINE:        { label: "ทะเล",     tint: "#D6F1F7" },
  RELIGIOUS:     { label: "ศาสนา",    tint: "#E6E0FF" },
  ENTERTAINMENT: { label: "บันเทิง",   tint: "#FFDDD6" },
  // add your other enum keys here
};

export function categoryInfo(key: string) {
  return MAP[key] ?? { label: key, tint: "#D3F3EE" };
}
export const CATEGORY_KEYS = Object.keys(MAP);