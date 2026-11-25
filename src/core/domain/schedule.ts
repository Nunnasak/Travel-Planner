export function emptyDayNumbers(totalDays: number, items: { day_no: number }[]) {
  const filled = new Set(items.map((item) => item.day_no));
  return Array.from({ length: totalDays }, (_, index) => index + 1).filter((day) => !filled.has(day));
}

export function unorderedDayNumbers(items: { day_no: number; visit_time: string }[]) {
  const latest = new Map<number, string>();
  const unordered = new Set<number>();
  for (const item of items) {
    const previous = latest.get(item.day_no);
    if (previous !== undefined && item.visit_time < previous) unordered.add(item.day_no);
    latest.set(item.day_no, item.visit_time);
  }
  return [...unordered].sort((a, b) => a - b);
}

type VersionedPlan = {
  access: string;
  updated_at: Date;
  post: { updated_at: Date } | null;
  member_count: number;
  items: { item_id: number; day_no: number; sequence_no: number; visit_time: string; location_id: number }[];
};

export function planVersion(plan: VersionedPlan) {
  const text = [
    plan.access,
    plan.updated_at.toISOString(),
    plan.post?.updated_at.toISOString() ?? "",
    plan.member_count,
    ...plan.items.map((item) => `${item.item_id}:${item.day_no}:${item.sequence_no}:${item.visit_time}:${item.location_id}`),
  ].join("|");
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
